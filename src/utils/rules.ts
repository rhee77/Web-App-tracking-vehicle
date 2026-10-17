import type { Booking, BookingApproval, BookingStatus, ApprovalStatus } from '../types/index.ts';

/**
 * Checks if two date-time ranges overlap.
 * Both ranges are half-open/closed intervals: [start, end]
 * Overlap occurs if startA < endB AND endA > startB.
 */
export function isDateOverlap(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  if (isNaN(sA) || isNaN(eA) || isNaN(sB) || isNaN(eB)) {
    return false;
  }
  return sA < eB && eA > sB;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  vehicleConflict?: Booking;
  driverConflict?: Booking;
  message?: string;
}

/**
 * Checks if a vehicle or driver is already booked in a conflicting time interval.
 * Only active bookings (pending, approved) are checked.
 */
export function checkBookingConflicts(
  existingBookings: Booking[],
  vehicleId: string,
  driverId: string,
  startAt: string,
  endAt: string,
  excludeBookingId?: string
): ConflictCheckResult {
  const activeBookings = existingBookings.filter(
    (b) =>
      b.id !== excludeBookingId &&
      (b.status === 'pending' || b.status === 'approved')
  );

  for (const b of activeBookings) {
    if (isDateOverlap(startAt, endAt, b.startAt, b.endAt)) {
      if (b.vehicleId === vehicleId) {
        return {
          hasConflict: true,
          vehicleConflict: b,
          message: `Kendaraan sedang dipesan untuk jadwal (${b.code}) dari ${formatDateTimeID(b.startAt)} sampai ${formatDateTimeID(b.endAt)}.`
        };
      }
      if (b.driverId === driverId) {
        return {
          hasConflict: true,
          driverConflict: b,
          message: `Driver sedang ditugaskan untuk jadwal (${b.code}) dari ${formatDateTimeID(b.startAt)} sampai ${formatDateTimeID(b.endAt)}.`
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Validates if an approver can currently act on a booking.
 * Enforces sequential 2-level approval logic:
 * - Level 1 can only act when Level 1 is 'pending'
 * - Level 2 CANNOT act if Level 1 is still 'waiting' or 'pending'. Level 1 must be 'approved'.
 */
export function canApproverAct(
  booking: Booking,
  approverId: string,
  approverLevel?: 1 | 2
): { allowed: boolean; reason?: string; approvalItem?: BookingApproval } {
  if (booking.status !== 'pending') {
    return {
      allowed: false,
      reason: `Pemesanan ini sudah berstatus ${booking.status.toUpperCase()}, tidak dapat diubah.`
    };
  }

  const approvalItem = booking.approvals.find(
    (a) => a.approverId === approverId || (approverLevel && a.level === approverLevel)
  );

  if (!approvalItem) {
    return {
      allowed: false,
      reason: 'Anda bukan approver yang ditugaskan untuk pemesanan ini.'
    };
  }

  if (approvalItem.status === 'approved' || approvalItem.status === 'rejected') {
    return {
      allowed: false,
      reason: `Anda sudah memberikan keputusan (${approvalItem.status.toUpperCase()}) sebelumnya.`
    };
  }

  // If level 2, check level 1
  if (approvalItem.level === 2) {
    const level1 = booking.approvals.find((a) => a.level === 1);
    if (!level1 || level1.status !== 'approved') {
      return {
        allowed: false,
        reason: 'Persetujuan Level 2 baru dapat dilakukan setelah Level 1 menyetujui (Workflow Berjenjang).'
      };
    }
  }

  return { allowed: true, approvalItem };
}

/**
 * Processes an approval action (approve or reject) and returns the updated booking.
 */
export function processApprovalAction(
  booking: Booking,
  approverId: string,
  action: 'approve' | 'reject',
  note: string = '',
  approverLevel?: 1 | 2
): Booking {
  const check = canApproverAct(booking, approverId, approverLevel);
  if (!check.allowed || !check.approvalItem) {
    throw new Error(check.reason || 'Tidak diizinkan menyetujui');
  }

  const now = new Date().toISOString();
  const currentLevel = check.approvalItem.level;

  const updatedApprovals = booking.approvals.map((a) => {
    if (a.id === check.approvalItem?.id) {
      return {
        ...a,
        status: (action === 'approve' ? 'approved' : 'rejected') as ApprovalStatus,
        note: note.trim() || (action === 'approve' ? 'Disetujui tanpa catatan khusus' : 'Ditolak'),
        actedAt: now
      };
    }
    return a;
  });

  let newOverallStatus: BookingStatus = 'pending';

  if (action === 'reject') {
    // If any level rejects, entire booking becomes rejected
    newOverallStatus = 'rejected';
    // Any remaining waiting/pending approvals stay as is or cancelled
  } else if (action === 'approve') {
    if (currentLevel === 1) {
      // Advance level 2 from 'waiting' to 'pending'
      const level2Index = updatedApprovals.findIndex((a) => a.level === 2);
      if (level2Index !== -1) {
        updatedApprovals[level2Index] = {
          ...updatedApprovals[level2Index],
          status: 'pending'
        };
      }
      // Check if all approvals are approved (in case only 1 level, but here min 2 level)
      const allApproved = updatedApprovals.every((a) => a.status === 'approved');
      if (allApproved) {
        newOverallStatus = 'approved';
      } else {
        newOverallStatus = 'pending';
      }
    } else if (currentLevel === 2) {
      // If level 2 approves, check if all required approvals are complete
      const allApproved = updatedApprovals.every((a) => a.status === 'approved');
      if (allApproved) {
        newOverallStatus = 'approved';
      }
    }
  }

  return {
    ...booking,
    status: newOverallStatus,
    approvals: updatedApprovals
  };
}

/**
 * Calculates fuel efficiency in km per liter.
 */
export function calculateFuelEfficiency(
  startOdometer?: number,
  endOdometer?: number,
  fuelLiters?: number
): number | null {
  if (
    startOdometer === undefined ||
    endOdometer === undefined ||
    fuelLiters === undefined ||
    fuelLiters <= 0
  ) {
    return null;
  }
  const distance = endOdometer - startOdometer;
  if (distance <= 0) return 0;
  return Number((distance / fuelLiters).toFixed(2));
}

/**
 * Formats a currency amount into IDR Rupiah string.
 */
export function formatCurrencyIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formats an ISO date string to Indonesian formatted date time.
 */
export function formatDateTimeID(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Formats a date only (DD MMM YYYY).
 */
export function formatDateID(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return isoString;
  }
}
