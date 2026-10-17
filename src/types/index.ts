export type UserRole = 'admin' | 'approver';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  approvalLevel?: 1 | 2;
  position: string;
  regionId: string;
  avatar?: string;
}

export type RegionType = 'head_office' | 'branch' | 'mine';

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  location: string;
  code: string;
}

export type VehicleCategory = 'people' | 'goods';
export type VehicleOwnership = 'owned' | 'rented';
export type VehicleStatus = 'available' | 'in_use' | 'maintenance';

export interface Vehicle {
  id: string;
  plateNumber: string;
  name: string;
  model: string;
  category: VehicleCategory;
  ownership: VehicleOwnership;
  rentalCompany?: string;
  regionId: string;
  odometer: number;
  status: VehicleStatus;
  fuelType: 'Solar / Dex' | 'Bensin';
  fuelCapacity: number; // liters
  seatCapacity?: number;
  cargoCapacityTons?: number;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseType: 'SIM A' | 'SIM B1' | 'SIM B2 Umum';
  regionId: string;
  isActive: boolean;
  status: 'available' | 'on_duty';
}

export type ApprovalStatus = 'waiting' | 'pending' | 'approved' | 'rejected';

export interface BookingApproval {
  id: string;
  bookingId: string;
  approverId: string;
  approverName: string;
  approverPosition: string;
  level: 1 | 2;
  status: ApprovalStatus;
  note?: string;
  actedAt?: string;
}

export type BookingStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export interface Booking {
  id: string;
  code: string; // e.g. BKG-2026-001
  vehicleId: string;
  driverId: string;
  createdById: string;
  createdByName: string;
  department: string;
  startAt: string; // ISO string
  endAt: string; // ISO string
  destination: string;
  purpose: string;
  regionId: string;
  status: BookingStatus;
  approvals: BookingApproval[];
  startOdometer?: number;
  endOdometer?: number;
  fuelFilledLiters?: number;
  fuelCost?: number;
  createdAt: string;
  cancellationReason?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  category: 'auth' | 'booking' | 'approval' | 'vehicle' | 'export' | 'service';
  description: string;
  timestamp: string;
  ipAddress: string;
  details?: Record<string, any>;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  bookingId?: string;
  liters: number;
  cost: number;
  filledAt: string;
  odometer: number;
  fuelStation: string;
}

export interface ServiceSchedule {
  id: string;
  vehicleId: string;
  scheduledAt: string;
  serviceType: 'Servis Berkala' | 'Ganti Oli & Filter' | 'Overhaul Mesin' | 'Ganti Ban Tambang' | 'Inspeksi Rem & Kaki';
  description: string;
  costEst: number;
  status: 'planned' | 'in_progress' | 'completed';
  completedAt?: string;
}
