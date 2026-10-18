import mysql from 'mysql2/promise';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  INITIAL_REGIONS,
  INITIAL_USERS,
  INITIAL_VEHICLES,
  INITIAL_DRIVERS,
  INITIAL_BOOKINGS,
  INITIAL_FUEL_LOGS,
  INITIAL_SERVICE_SCHEDULES,
  INITIAL_ACTIVITY_LOGS
} from '../src/data/mockData.ts';

async function seed() {
  const host = process.env.DB_HOST || process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1';
  const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || process.env.MYSQL_PORT) || 3306;
  const user = process.env.DB_USER || process.env.MYSQLUSER || process.env.MYSQL_USER || 'root';
  const password = process.env.DB_PASSWORD || process.env.MYSQL_ROOT_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '';
  const database = process.env.DB_NAME || process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'vehicle_booking';

  console.log(`Connecting to MySQL database ${database} at ${host}:${port}...`);
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true
  });

  console.log('Connected! Ensuring tables exist from database/schema.sql...');
  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = await fs.promises.readFile(schemaPath, 'utf-8');
    await connection.query(schemaSql);
    console.log('Schema verified/created successfully.');
  }

  console.log('Cleaning old records...');
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  await connection.query('TRUNCATE TABLE booking_approvals');
  await connection.query('TRUNCATE TABLE bookings');
  await connection.query('TRUNCATE TABLE fuel_logs');
  await connection.query('TRUNCATE TABLE service_schedules');
  await connection.query('TRUNCATE TABLE vehicles');
  await connection.query('TRUNCATE TABLE drivers');
  await connection.query('TRUNCATE TABLE users');
  await connection.query('TRUNCATE TABLE regions');
  await connection.query('TRUNCATE TABLE activity_logs');
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log(`Seeding ${INITIAL_REGIONS.length} regions...`);
  for (const r of INITIAL_REGIONS) {
    await connection.query(
      'INSERT INTO regions (id, name, type, location, code) VALUES (?, ?, ?, ?, ?)',
      [r.id, r.name, r.type, r.location, r.code]
    );
  }

  console.log(`Seeding ${INITIAL_USERS.length} users...`);
  for (const u of INITIAL_USERS) {
    await connection.query(
      'INSERT INTO users (id, name, username, email, password, role, approval_level, region_id, position, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        u.id,
        u.name,
        u.username,
        u.email,
        crypto.scryptSync('password', 'nikelfleet-demo-v1', 64).toString('hex'),
        u.role,
        u.approvalLevel || null,
        u.regionId,
        u.position,
        u.avatar || null
      ]
    );
  }

  console.log(`Seeding ${INITIAL_VEHICLES.length} vehicles...`);
  for (const v of INITIAL_VEHICLES) {
    await connection.query(
      'INSERT INTO vehicles (id, plate_number, name, model, category, ownership, rental_company, region_id, odometer, status, fuel_type, fuel_capacity, seat_capacity, cargo_capacity_tons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        v.id,
        v.plateNumber,
        v.name,
        v.model,
        v.category,
        v.ownership,
        v.rentalCompany || null,
        v.regionId,
        v.odometer,
        v.status,
        v.fuelType,
        v.fuelCapacity,
        v.seatCapacity || null,
        v.cargoCapacityTons || null
      ]
    );
  }

  console.log(`Seeding ${INITIAL_DRIVERS.length} drivers...`);
  for (const d of INITIAL_DRIVERS) {
    await connection.query(
      'INSERT INTO drivers (id, name, phone, license_number, license_type, region_id, is_active, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [d.id, d.name, d.phone, d.licenseNumber, d.licenseType, d.regionId, d.isActive, d.status]
    );
  }

  console.log(`Seeding ${INITIAL_BOOKINGS.length} bookings & approvals...`);
  for (const b of INITIAL_BOOKINGS) {
    await connection.query(
      'INSERT INTO bookings (id, code, vehicle_id, driver_id, created_by_id, created_by_name, department, start_at, end_at, destination, purpose, region_id, status, start_odometer, end_odometer, fuel_filled_liters, fuel_cost, cancellation_reason, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        b.id,
        b.code,
        b.vehicleId,
        b.driverId,
        b.createdById,
        b.createdByName,
        b.department,
        new Date(b.startAt),
        new Date(b.endAt),
        b.destination,
        b.purpose,
        b.regionId,
        b.status,
        b.startOdometer || null,
        b.endOdometer || null,
        b.fuelFilledLiters || null,
        b.fuelCost || null,
        b.cancellationReason || null,
        new Date(b.createdAt)
      ]
    );

    for (const a of b.approvals) {
      await connection.query(
        'INSERT INTO booking_approvals (id, booking_id, approver_id, approver_name, approver_position, level, status, note, acted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          a.id,
          b.id,
          a.approverId,
          a.approverName,
          a.approverPosition,
          a.level,
          a.status,
          a.note || null,
          a.actedAt ? new Date(a.actedAt) : null
        ]
      );
    }
  }

  console.log(`Seeding ${INITIAL_FUEL_LOGS.length} fuel logs...`);
  for (const f of INITIAL_FUEL_LOGS) {
    await connection.query(
      'INSERT INTO fuel_logs (id, vehicle_id, booking_id, liters, cost, filled_at, odometer, fuel_station) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [f.id, f.vehicleId, f.bookingId || null, f.liters, f.cost, new Date(f.filledAt), f.odometer, f.fuelStation]
    );
  }

  console.log(`Seeding ${INITIAL_SERVICE_SCHEDULES.length} service schedules...`);
  for (const s of INITIAL_SERVICE_SCHEDULES) {
    await connection.query(
      'INSERT INTO service_schedules (id, vehicle_id, scheduled_at, service_type, description, cost_est, status, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        s.id,
        s.vehicleId,
        s.scheduledAt.includes('T') ? s.scheduledAt.split('T')[0] : s.scheduledAt,
        s.serviceType,
        s.description,
        s.costEst,
        s.status,
        s.completedAt ? new Date(s.completedAt) : null
      ]
    );
  }

  console.log(`Seeding ${INITIAL_ACTIVITY_LOGS.length} activity logs...`);
  for (const l of INITIAL_ACTIVITY_LOGS) {
    await connection.query(
      'INSERT INTO activity_logs (id, user_id, user_name, role, action, category, description, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        l.id,
        l.userId,
        l.userName,
        l.role,
        l.action,
        l.category,
        l.description,
        l.ipAddress,
        new Date(l.timestamp)
      ]
    );
  }

  console.log('Database seeding successfully completed!');
  await connection.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
