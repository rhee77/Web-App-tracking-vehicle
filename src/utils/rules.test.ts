import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isDateOverlap,
  checkBookingConflicts,
  canApproverAct,
  processApprovalAction,
  calculateFuelEfficiency
} from './rules.ts';
import type { Booking } from '../types/index.ts';

test('isDateOverlap detects overlapping intervals correctly', () => {
  // Overlapping
  assert.equal(
    isDateOverlap('2026-10-20T08:00:00Z', '2026-10-20T12:00:00Z', '2026-10-20T10:00:00Z', '2026-10-20T14:00:00Z'),
    true
  );

  // Non-overlapping (after)
  assert.equal(
    isDateOverlap('2026-10-20T08:00:00Z', '2026-10-20T12:00:00Z', '2026-10-20T13:00:00Z', '2026-10-20T17:00:00Z'),
    false
  );

  // Edge boundary: end == start does not overlap
  assert.equal(
    isDateOverlap('2026-10-20T08:00:00Z', '2026-10-20T12:00:00Z', '2026-10-20T12:00:00Z', '2026-10-20T16:00:00Z'),
    false
  );
});

test('checkBookingConflicts flags vehicle and driver conflicts', () => {
  const mockBookings: Booking[] = [
    {
      id: 'bkg-1',
      code: 'BKG-001',
      vehicleId: 'veh-1',
      driverId: 'drv-1',
      createdById: 'usr-admin',
      createdByName: 'Admin',
      department: 'Mining',
      startAt: '2026-10-20T08:00:00Z',
      endAt: '2026-10-20T17:00:00Z',
      destination: 'Tambang Kolaka',
      purpose: 'Inspeksi pit',
      regionId: 'reg-kolaka',
      status: 'approved',
      approvals: [],
      createdAt: '2026-10-19T00:00:00Z'
    }
  ];

  // Conflict on vehicle
  const res1 = checkBookingConflicts(mockBookings, 'veh-1', 'drv-2', '2026-10-20T09:00:00Z', '2026-10-20T11:00:00Z');
  assert.equal(res1.hasConflict, true);
  assert.equal(res1.vehicleConflict?.id, 'bkg-1');

  // Conflict on driver
  const res2 = checkBookingConflicts(mockBookings, 'veh-2', 'drv-1', '2026-10-20T09:00:00Z', '2026-10-20T11:00:00Z');
  assert.equal(res2.hasConflict, true);
  assert.equal(res2.driverConflict?.id, 'bkg-1');

  // No conflict on different date
  const res3 = checkBookingConflicts(mockBookings, 'veh-1', 'drv-1', '2026-10-21T08:00:00Z', '2026-10-21T17:00:00Z');
  assert.equal(res3.hasConflict, false);
});

test('2-level approval workflow enforces sequence and state transitions', () => {
  const booking: Booking = {
    id: 'bkg-test',
    code: 'BKG-TEST',
    vehicleId: 'veh-1',
    driverId: 'drv-1',
    createdById: 'usr-admin',
    createdByName: 'Admin',
    department: 'Operasional',
    startAt: '2026-10-25T08:00:00Z',
    endAt: '2026-10-25T17:00:00Z',
    destination: 'Tambang Morowali',
    purpose: 'Distribusi Logistik',
    regionId: 'reg-morowali',
    status: 'pending',
    createdAt: '2026-10-24T00:00:00Z',
    approvals: [
      {
        id: 'appr-1',
        bookingId: 'bkg-test',
        approverId: 'usr-l1',
        approverName: 'Approver 1',
        approverPosition: 'Project Manager',
        level: 1,
        status: 'pending'
      },
      {
        id: 'appr-2',
        bookingId: 'bkg-test',
        approverId: 'usr-l2',
        approverName: 'Approver 2',
        approverPosition: 'Kepala Pool',
        level: 2,
        status: 'waiting'
      }
    ]
  };

  // Step 1: Approver Level 2 cannot approve while Level 1 has not approved yet
  const canL2ActInitially = canApproverAct(booking, 'usr-l2', 2);
  assert.equal(canL2ActInitially.allowed, false);

  // Step 2: Approver Level 1 can approve
  const canL1Act = canApproverAct(booking, 'usr-l1', 1);
  assert.equal(canL1Act.allowed, true);

  // Step 3: Approver Level 1 approves
  const bookingAfterL1 = processApprovalAction(booking, 'usr-l1', 'approve', 'Disetujui untuk operasional site');
  assert.equal(bookingAfterL1.status, 'pending'); // Still pending until Level 2 approves
  assert.equal(bookingAfterL1.approvals[0].status, 'approved');
  assert.equal(bookingAfterL1.approvals[1].status, 'pending'); // Level 2 is now pending!

  // Step 4: Now Approver Level 2 can approve
  const canL2ActNow = canApproverAct(bookingAfterL1, 'usr-l2', 2);
  assert.equal(canL2ActNow.allowed, true);

  // Step 5: Approver Level 2 approves -> overall status becomes 'approved'
  const bookingAfterL2 = processApprovalAction(bookingAfterL1, 'usr-l2', 'approve', 'Disetujui pool siap');
  assert.equal(bookingAfterL2.status, 'approved');
  assert.equal(bookingAfterL2.approvals[1].status, 'approved');
});

test('rejection at Level 1 marks booking as rejected and stops workflow', () => {
  const booking: Booking = {
    id: 'bkg-reject',
    code: 'BKG-REJ',
    vehicleId: 'veh-1',
    driverId: 'drv-1',
    createdById: 'usr-admin',
    createdByName: 'Admin',
    department: 'Operasional',
    startAt: '2026-10-25T08:00:00Z',
    endAt: '2026-10-25T17:00:00Z',
    destination: 'Tambang Halmahera',
    purpose: 'Survei',
    regionId: 'reg-halmahera',
    status: 'pending',
    createdAt: '2026-10-24T00:00:00Z',
    approvals: [
      {
        id: 'appr-1',
        bookingId: 'bkg-reject',
        approverId: 'usr-l1',
        approverName: 'Approver 1',
        approverPosition: 'Project Manager',
        level: 1,
        status: 'pending'
      },
      {
        id: 'appr-2',
        bookingId: 'bkg-reject',
        approverId: 'usr-l2',
        approverName: 'Approver 2',
        approverPosition: 'Kepala Pool',
        level: 2,
        status: 'waiting'
      }
    ]
  };

  const bookingRejected = processApprovalAction(booking, 'usr-l1', 'reject', 'Kendaraan dialihkan ke darurat');
  assert.equal(bookingRejected.status, 'rejected');
  assert.equal(bookingRejected.approvals[0].status, 'rejected');
  assert.equal(bookingRejected.approvals[1].status, 'waiting');
});

test('calculateFuelEfficiency returns correct km per liter', () => {
  // Start: 10000 km, End: 10450 km, Liters: 45L -> 450 km / 45L = 10 km/L
  const eff = calculateFuelEfficiency(10000, 10450, 45);
  assert.equal(eff, 10);

  // Incomplete data returns null
  assert.equal(calculateFuelEfficiency(undefined, 10450, 45), null);
  assert.equal(calculateFuelEfficiency(10000, 10450, 0), null);
});
