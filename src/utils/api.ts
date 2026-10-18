import type {
  User,
  Booking,
  Vehicle,
  Driver,
  Region,
  FuelLog,
  ServiceSchedule,
  ActivityLog
} from '../types/index.ts';

export interface BootstrapData {
  regions: Region[];
  users: User[];
  vehicles: Vehicle[];
  drivers: Driver[];
  bookings: Booking[];
  fuelLogs: FuelLog[];
  serviceSchedules: ServiceSchedule[];
  activityLogs: ActivityLog[];
}

export const api = {
  token: '',

  setToken(token: string) {
    this.token = token;
  },

  headers(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  },

  async login(username: string, password: string): Promise<{ token: string; user: User } | null> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    this.token = data.token;
    return { token: data.token, user: data.user };
  },

  async logout(): Promise<void> {
    if (this.token) await fetch('/api/auth/logout', { method: 'POST', headers: this.headers() });
    this.token = '';
  },
  // Check health / MySQL connection
  async checkHealth(): Promise<{ connected: boolean; message: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();
      return { connected: true, message: `Terhubung ke MySQL (${data.database})` };
    } catch (e: any) {
      return { connected: false, message: 'Tidak terhubung ke server DB (mode offline/localStorage)' };
    }
  },

  // Load all initial data from MySQL
  async getBootstrap(): Promise<BootstrapData | null> {
    try {
      const res = await fetch('/api/bootstrap', { headers: this.headers() });
      if (!res.ok) throw new Error('Failed to fetch bootstrap data');
      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }
      return null;
    } catch (e) {
      console.warn('API Bootstrap failed, using local fallback:', e);
      return null;
    }
  },

  // Create booking
  async createBooking(booking: Booking): Promise<boolean> {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify(booking),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Process approval
  async processApproval(
    bookingId: string,
    action: 'approve' | 'reject',
    note: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/approval`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ action, note }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Complete booking
  async completeBooking(
    bookingId: string,
    endOdometer: number,
    fuelLiters: number,
    fuelCost: number,
    vehicleId?: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ endOdometer, fuelLiters, fuelCost, vehicleId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Cancel booking
  async cancelBooking(bookingId: string, reason?: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ reason }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async logExport(description: string): Promise<boolean> {
    try {
      const res = await fetch('/api/activity-logs/export', {
        method: 'POST', headers: this.headers(), body: JSON.stringify({ description }),
      });
      return res.ok;
    } catch { return false; }
  },

};
