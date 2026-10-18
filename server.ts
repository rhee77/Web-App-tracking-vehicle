import crypto from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import mysql from 'mysql2/promise';
import path from 'node:path';
import fs from 'node:fs';

type Role = 'admin' | 'approver';
type AuthUser = { id: string; name: string; username: string; email: string; role: Role; approvalLevel: 1 | 2 | null; position: string; regionId: string | null; avatar: string | null };
const app = express();
const sessions = new Map<string, AuthUser>();

const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1';
const dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT) || 3306;
const dbUser = process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '';
const dbName = process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'vehicle_booking';

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true
});
app.use(express.json());

const passwordHash = (password: string) => crypto.scryptSync(password, 'nikelfleet-demo-v1', 64).toString('hex');
const getUser = (req: Request) => { const value = req.header('authorization'); return value?.startsWith('Bearer ') ? sessions.get(value.slice(7)) : undefined; };
function requireAuth(req: Request, res: Response, next: NextFunction) { const user = getUser(req); if (!user) return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu.' }); res.locals.user = user; next(); }
function requireRole(...roles: Role[]) { return (_req: Request, res: Response, next: NextFunction) => { if (!roles.includes((res.locals.user as AuthUser).role)) return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses untuk aksi ini.' }); next(); }; }
function toUser(row: any): AuthUser { return { id: row.id, name: row.name, username: row.username, email: row.email, role: row.role, approvalLevel: row.approvalLevel ?? null, position: row.position, regionId: row.regionId, avatar: row.avatar }; }
async function log(connection: mysql.PoolConnection | typeof pool, user: AuthUser, action: string, category: string, description: string, req: Request) { await connection.query('INSERT INTO activity_logs (id, user_id, user_name, role, action, category, description, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [`log-${crypto.randomUUID()}`, user.id, user.name, user.role, action, category, description, req.ip || 'unknown', new Date()]); }

app.get('/api/health', async (_req, res) => { try { const [rows] = await pool.query('SELECT 1 as connected, DATABASE() as db'); res.json({ status: 'ok', database: 'vehicle_booking', result: rows }); } catch (err: any) { res.status(500).json({ status: 'error', message: err.message }); } });

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') return res.status(422).json({ success: false, message: 'Username dan password wajib diisi.' });
  try {
    const [rows]: any = await pool.query('SELECT id, name, username, email, password, role, approval_level as approvalLevel, position, region_id as regionId, avatar FROM users WHERE username = ? LIMIT 1', [username.trim()]);
    const row = rows[0]; const supplied = Buffer.from(passwordHash(password), 'hex'); const stored = typeof row?.password === 'string' ? Buffer.from(row.password, 'hex') : Buffer.alloc(0);
    if (!row || stored.length !== supplied.length || !crypto.timingSafeEqual(stored, supplied)) return res.status(401).json({ success: false, message: 'Username atau password tidak valid.' });
    const user = toUser(row); const token = crypto.randomUUID(); sessions.set(token, user); await log(pool, user, 'LOGIN', 'auth', 'Login ke aplikasi.', req); res.json({ success: true, token, user });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
});
app.post('/api/auth/logout', requireAuth, async (req, res) => { const user = res.locals.user as AuthUser; sessions.delete(req.header('authorization')!.slice(7)); await log(pool, user, 'LOGOUT', 'auth', 'Logout dari aplikasi.', req); res.json({ success: true }); });

app.get('/api/bootstrap', requireAuth, async (_req, res) => {
  try {
    const [regions]: any = await pool.query('SELECT * FROM regions ORDER BY id');
    const [users]: any = await pool.query('SELECT id, name, username, email, role, approval_level as approvalLevel, position, region_id as regionId, avatar FROM users ORDER BY id');
    const [vehicles]: any = await pool.query('SELECT id, plate_number as plateNumber, name, model, category, ownership, rental_company as rentalCompany, region_id as regionId, odometer, status, fuel_type as fuelType, fuel_capacity as fuelCapacity, seat_capacity as seatCapacity, cargo_capacity_tons as cargoCapacityTons FROM vehicles ORDER BY id');
    const [drivers]: any = await pool.query('SELECT id, name, phone, license_number as licenseNumber, license_type as licenseType, region_id as regionId, is_active as isActive, status FROM drivers ORDER BY id');
    const [bookingsRaw]: any = await pool.query('SELECT id, code, vehicle_id as vehicleId, driver_id as driverId, created_by_id as createdById, created_by_name as createdByName, department, start_at as startAt, end_at as endAt, destination, purpose, region_id as regionId, status, start_odometer as startOdometer, end_odometer as endOdometer, fuel_filled_liters as fuelFilledLiters, fuel_cost as fuelCost, cancellation_reason as cancellationReason, created_at as createdAt FROM bookings ORDER BY created_at DESC');
    const [approvalsRaw]: any = await pool.query('SELECT id, booking_id as bookingId, approver_id as approverId, approver_name as approverName, approver_position as approverPosition, level, status, note, acted_at as actedAt FROM booking_approvals ORDER BY level ASC');
    const [fuelLogs]: any = await pool.query('SELECT id, vehicle_id as vehicleId, booking_id as bookingId, liters, cost, filled_at as filledAt, odometer, fuel_station as fuelStation FROM fuel_logs ORDER BY filled_at DESC');
    const [serviceSchedules]: any = await pool.query('SELECT id, vehicle_id as vehicleId, scheduled_at as scheduledAt, service_type as serviceType, description, cost_est as costEst, status, completed_at as completedAt FROM service_schedules ORDER BY scheduled_at ASC');
    const [activityLogs]: any = await pool.query('SELECT id, user_id as userId, user_name as userName, role, action, category, description, ip_address as ipAddress, created_at as timestamp FROM activity_logs ORDER BY created_at DESC LIMIT 100');
    const bookings = bookingsRaw.map((b: any) => ({ ...b, startAt: new Date(b.startAt).toISOString(), endAt: new Date(b.endAt).toISOString(), createdAt: new Date(b.createdAt).toISOString(), approvals: approvalsRaw.filter((a: any) => a.bookingId === b.id).map((a: any) => ({ ...a, actedAt: a.actedAt ? new Date(a.actedAt).toISOString() : undefined })) }));
    res.json({ success: true, data: { regions, users, vehicles, drivers: drivers.map((d: any) => ({ ...d, isActive: Boolean(d.isActive) })), bookings, fuelLogs: fuelLogs.map((f: any) => ({ ...f, filledAt: new Date(f.filledAt).toISOString() })), serviceSchedules: serviceSchedules.map((s: any) => ({ ...s, scheduledAt: s.scheduledAt ? new Date(s.scheduledAt).toISOString().split('T')[0] : '', completedAt: s.completedAt ? new Date(s.completedAt).toISOString() : undefined })), activityLogs: activityLogs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp).toISOString() })) } });
  } catch (err: any) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/bookings', requireAuth, requireRole('admin'), async (req, res) => {
  const connection = await pool.getConnection(); const user = res.locals.user as AuthUser;
  try {
    const b = req.body ?? {}; const startAt = new Date(b.startAt); const endAt = new Date(b.endAt); const approvals = Array.isArray(b.approvals) ? b.approvals : [];
    if (!b.vehicleId || !b.driverId || !b.destination?.trim() || !b.purpose?.trim() || Number.isNaN(startAt.valueOf()) || Number.isNaN(endAt.valueOf()) || endAt <= startAt) return res.status(422).json({ success: false, message: 'Data pemesanan atau rentang waktu tidak valid.' });
    if (approvals.length !== 2 || new Set(approvals.map((a: any) => a.approverId)).size !== 2 || ![1, 2].every(level => approvals.some((a: any) => Number(a.level) === level))) return res.status(422).json({ success: false, message: 'Pilih dua approver unik untuk level 1 dan 2.' });
    await connection.beginTransaction();
    const [vehicles]: any = await connection.query('SELECT id FROM vehicles WHERE id = ? FOR UPDATE', [b.vehicleId]); const [drivers]: any = await connection.query('SELECT id, is_active FROM drivers WHERE id = ? FOR UPDATE', [b.driverId]);
    if (!vehicles[0] || !drivers[0]?.is_active) throw new Error('Kendaraan atau driver tidak tersedia.');
    const [conflicts]: any = await connection.query("SELECT code FROM bookings WHERE status IN ('pending', 'approved') AND (vehicle_id = ? OR driver_id = ?) AND start_at < ? AND end_at > ? FOR UPDATE", [b.vehicleId, b.driverId, endAt, startAt]);
    if (conflicts.length) return res.status(409).json({ success: false, message: `Jadwal bentrok dengan booking ${conflicts[0].code}.` });
    const ids = approvals.map((a: any) => a.approverId); const [approvers]: any = await connection.query("SELECT id, name, position, approval_level FROM users WHERE role = 'approver' AND id IN (?, ?)", ids);
    if (approvers.length !== 2 || !approvals.every((a: any) => approvers.some((u: any) => u.id === a.approverId && Number(u.approval_level) === Number(a.level)))) return res.status(422).json({ success: false, message: 'Approver tidak sesuai dengan level yang dipilih.' });
    const bookingId = b.id || `bkg-${crypto.randomUUID()}`; const code = b.code || `BKG-${Date.now()}`;
    await connection.query("INSERT INTO bookings (id, code, vehicle_id, driver_id, created_by_id, created_by_name, department, start_at, end_at, destination, purpose, region_id, status, start_odometer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)", [bookingId, code, b.vehicleId, b.driverId, user.id, user.name, b.department || '-', startAt, endAt, b.destination.trim(), b.purpose.trim(), b.regionId, b.startOdometer || null, new Date()]);
    for (const a of approvals) { const approver = approvers.find((u: any) => u.id === a.approverId); await connection.query('INSERT INTO booking_approvals (id, booking_id, approver_id, approver_name, approver_position, level, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [a.id || `appr-${crypto.randomUUID()}`, bookingId, approver.id, approver.name, approver.position, a.level, Number(a.level) === 1 ? 'pending' : 'waiting']); }
    await log(connection, user, 'CREATE_BOOKING', 'booking', `Membuat pemesanan ${code}.`, req); await connection.commit(); res.status(201).json({ success: true, bookingId, code });
  } catch (err: any) { await connection.rollback(); res.status(err.message?.includes('tersedia') ? 422 : 500).json({ success: false, message: err.message }); } finally { connection.release(); }
});

app.post('/api/bookings/:id/approval', requireAuth, requireRole('approver'), async (req, res) => {
  const connection = await pool.getConnection(); const user = res.locals.user as AuthUser;
  try {
    const { action, note } = req.body ?? {}; if (!['approve', 'reject'].includes(action)) return res.status(422).json({ success: false, message: 'Aksi approval tidak valid.' });
    await connection.beginTransaction(); const [bookings]: any = await connection.query('SELECT code, status FROM bookings WHERE id = ? FOR UPDATE', [req.params.id]); if (!bookings[0] || bookings[0].status !== 'pending') return res.status(409).json({ success: false, message: 'Booking tidak dapat diproses.' });
    const [rows]: any = await connection.query('SELECT id, level, status FROM booking_approvals WHERE booking_id = ? AND approver_id = ? FOR UPDATE', [req.params.id, user.id]); const approval = rows[0]; if (!approval || approval.status !== 'pending') return res.status(403).json({ success: false, message: 'Bukan giliran Anda untuk memproses approval ini.' });
    const status = action === 'approve' ? 'approved' : 'rejected'; await connection.query('UPDATE booking_approvals SET status = ?, note = ?, acted_at = ? WHERE id = ?', [status, typeof note === 'string' ? note.trim() || null : null, new Date(), approval.id]);
    if (action === 'reject') await connection.query("UPDATE bookings SET status = 'rejected' WHERE id = ?", [req.params.id]); else { const [next]: any = await connection.query("SELECT id FROM booking_approvals WHERE booking_id = ? AND status = 'waiting' ORDER BY level LIMIT 1 FOR UPDATE", [req.params.id]); if (next[0]) await connection.query("UPDATE booking_approvals SET status = 'pending' WHERE id = ?", [next[0].id]); else await connection.query("UPDATE bookings SET status = 'approved' WHERE id = ?", [req.params.id]); }
    await log(connection, user, `${action === 'approve' ? 'APPROVE' : 'REJECT'}_LEVEL_${approval.level}`, 'approval', `${action === 'approve' ? 'Menyetujui' : 'Menolak'} pemesanan ${bookings[0].code}.`, req); await connection.commit(); res.json({ success: true });
  } catch (err: any) { await connection.rollback(); res.status(500).json({ success: false, message: err.message }); } finally { connection.release(); }
});

app.post('/api/bookings/:id/complete', requireAuth, requireRole('admin'), async (req, res) => {
  const connection = await pool.getConnection(); const user = res.locals.user as AuthUser;
  try { const { endOdometer, fuelLiters = 0, fuelCost = 0 } = req.body ?? {}; if (!Number.isFinite(endOdometer) || endOdometer < 0 || !Number.isFinite(fuelLiters) || fuelLiters < 0 || !Number.isFinite(fuelCost) || fuelCost < 0) return res.status(422).json({ success: false, message: 'Data odometer atau BBM tidak valid.' }); await connection.beginTransaction(); const [rows]: any = await connection.query('SELECT code, vehicle_id, start_odometer FROM bookings WHERE id = ? AND status = \'approved\' FOR UPDATE', [req.params.id]); const booking = rows[0]; if (!booking) return res.status(409).json({ success: false, message: 'Hanya booking approved yang dapat diselesaikan.' }); if (booking.start_odometer && endOdometer < booking.start_odometer) return res.status(422).json({ success: false, message: 'Odometer akhir tidak boleh lebih kecil dari odometer awal.' }); await connection.query("UPDATE bookings SET status = 'completed', end_odometer = ?, fuel_filled_liters = ?, fuel_cost = ? WHERE id = ?", [endOdometer, fuelLiters, fuelCost, req.params.id]); await connection.query("UPDATE vehicles SET status = 'available', odometer = GREATEST(odometer, ?) WHERE id = ?", [endOdometer, booking.vehicle_id]); if (fuelLiters > 0) await connection.query('INSERT INTO fuel_logs (id, vehicle_id, booking_id, liters, cost, filled_at, odometer, fuel_station) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [`fl-${crypto.randomUUID()}`, booking.vehicle_id, req.params.id, fuelLiters, fuelCost, new Date(), endOdometer, 'SPBU Internal Pool Tambang']); await log(connection, user, 'COMPLETE_BOOKING', 'vehicle', `Menyelesaikan pemesanan ${booking.code}.`, req); await connection.commit(); res.json({ success: true }); } catch (err: any) { await connection.rollback(); res.status(500).json({ success: false, message: err.message }); } finally { connection.release(); }
});

app.post('/api/bookings/:id/cancel', requireAuth, requireRole('admin'), async (req, res) => { const user = res.locals.user as AuthUser; try { const [result]: any = await pool.query("UPDATE bookings SET status = 'cancelled', cancellation_reason = ? WHERE id = ? AND status = 'pending'", [req.body?.reason || 'Dibatalkan oleh Administrator', req.params.id]); if (!result.affectedRows) return res.status(409).json({ success: false, message: 'Hanya booking pending yang dapat dibatalkan.' }); await log(pool, user, 'CANCEL_BOOKING', 'booking', `Membatalkan pemesanan ${req.params.id}.`, req); res.json({ success: true }); } catch (err: any) { res.status(500).json({ success: false, message: err.message }); } });
app.post('/api/activity-logs/export', requireAuth, requireRole('admin'), async (req, res) => { const user = res.locals.user as AuthUser; try { await log(pool, user, 'EXPORT_EXCEL', 'export', typeof req.body?.description === 'string' ? req.body.description.slice(0, 500) : 'Mengunduh laporan Excel.', req); res.json({ success: true }); } catch (err: any) { res.status(500).json({ success: false, message: err.message }); } });

async function initDb() {
  try {
    const [rows]: any = await pool.query("SHOW TABLES LIKE 'users'");
    if (rows.length === 0) {
      console.log('Database empty. Automatically initializing schema from database/schema.sql...');
      const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = await fs.promises.readFile(schemaPath, 'utf-8');
        await pool.query(schemaSql);
        console.log('Database schema created successfully.');
      }
    }
  } catch (err: any) {
    console.warn('Database auto-initialization check skipped/failed:', err.message);
  }
}
initDb();

const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.resolve(distDir, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Application running at http://0.0.0.0:${PORT}`));
