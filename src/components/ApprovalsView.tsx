import React, { useState, useMemo } from 'react';
import type { Booking, Vehicle, Driver, Region, User } from '../types/index.ts';
import { formatDateTimeID } from '../utils/rules.ts';

interface ApprovalsViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  regions: Region[];
  currentUser: User;
  onApprove: (bookingId: string, note: string) => void;
  onReject: (bookingId: string, note: string) => void;
  onViewBookingDetail: (booking: Booking) => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  bookings,
  vehicles,
  drivers,
  regions,
  currentUser,
  onApprove,
  onReject,
  onViewBookingDetail,
  onSwitchUser,
  allUsers
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<{
    booking: Booking;
    action: 'approve' | 'reject';
  } | null>(null);
  const [actionNote, setActionNote] = useState('');

  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverMap = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);
  const regionMap = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);

  // Check pending approvals for current user
  const { pendingApprovals, lockedApprovals, historyApprovals } = useMemo(() => {
    const pending: Booking[] = [];
    const locked: Booking[] = [];
    const history: Booking[] = [];

    bookings.forEach((b) => {
      // Find approval record relevant for current user or current level
      const myApp = b.approvals.find(
        (a) => a.approverId === currentUser.id || (currentUser.role === 'approver' && a.level === currentUser.approvalLevel)
      );

      if (!myApp) {
        // If current user is Admin, show all pending items so they can monitor
        if (currentUser.role === 'admin') {
          if (b.status === 'pending') {
            pending.push(b);
          } else {
            history.push(b);
          }
        }
        return;
      }

      if (myApp.status === 'pending') {
        // Check if level 2 is locked waiting for level 1
        if (myApp.level === 2) {
          const l1 = b.approvals.find((a) => a.level === 1);
          if (l1?.status !== 'approved') {
            locked.push(b);
            return;
          }
        }
        pending.push(b);
      } else if (myApp.status === 'waiting') {
        locked.push(b);
      } else {
        // Already approved or rejected by this user
        history.push(b);
      }
    });

    return { pendingApprovals: pending, lockedApprovals: locked, historyApprovals: history };
  }, [bookings, currentUser]);

  const handleOpenActionModal = (booking: Booking, action: 'approve' | 'reject') => {
    setSelectedBookingForAction({ booking, action });
    setActionNote(action === 'approve' ? 'Disetujui untuk kegiatan operasional site.' : '');
  };

  const handleConfirmAction = () => {
    if (!selectedBookingForAction) return;
    const { booking, action } = selectedBookingForAction;

    if (action === 'approve') {
      onApprove(booking.id, actionNote);
    } else {
      if (!actionNote.trim()) {
        alert('Mohon masukkan alasan penolakan pemesanan.');
        return;
      }
      onReject(booking.id, actionNote);
    }

    setSelectedBookingForAction(null);
    setActionNote('');
  };

  const approver1User = allUsers.find((u) => u.approvalLevel === 1);
  const approver2User = allUsers.find((u) => u.approvalLevel === 2);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Persetujuan Pemesanan Kendaraan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Otorisasi berjenjang 2-level: Level 1 (Atasan Langsung) &amp; Level 2 (Pool &amp; Logistik)
          </p>
        </div>

        {/* Quick Role Switch Buttons for Testing */}
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Beralih Akun:</span>
          {approver1User && (
            <button
              onClick={() => onSwitchUser(approver1User)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                currentUser.id === approver1User.id
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              Approver L1
            </button>
          )}
          {approver2User && (
            <button
              onClick={() => onSwitchUser(approver2User)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                currentUser.id === approver2User.id
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-transparent'
              }`}
            >
              Approver L2
            </button>
          )}
        </div>
      </div>

      {/* Role Alert for Admin */}
      {currentUser.role === 'admin' && (
        <div className="p-3.5 rounded-lg bg-slate-850 border border-slate-700/80 text-slate-300 text-xs">
          <div className="leading-relaxed">
            <span className="font-semibold text-white">Mode Admin:</span> Saat ini Anda masuk sebagai{' '}
            <span className="font-medium text-slate-200">{currentUser.name}</span>. Untuk menguji aksi persetujuan (Setujui / Tolak), silakan beralih ke{' '}
            <button
              onClick={() => approver1User && onSwitchUser(approver1User)}
              className="font-medium underline text-slate-200 hover:text-white"
            >
              Approver L1
            </button>{' '}
            atau{' '}
            <button
              onClick={() => approver2User && onSwitchUser(approver2User)}
              className="font-medium underline text-slate-200 hover:text-white"
            >
              Approver L2
            </button>.
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'pending'
              ? 'border-slate-300 text-white font-medium'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Perlu Keputusan</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
            {pendingApprovals.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'history'
              ? 'border-slate-300 text-white font-medium'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Riwayat Keputusan</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/80 text-[10px]">
            {historyApprovals.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingApprovals.length === 0 && lockedApprovals.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <h3 className="text-base font-bold text-white">
                Tidak Ada Permintaan Persetujuan Tertunda
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Semua permohonan pemesanan kendaraan telah diproses atau telah selesai disetujui.
              </p>
            </div>
          ) : (
            <>
              {/* Ready to act list */}
              {pendingApprovals.map((b) => {
                const v = vehicleMap.get(b.vehicleId);
                const d = driverMap.get(b.driverId);
                const r = regionMap.get(b.regionId);
                const l1 = b.approvals.find((a) => a.level === 1);
                const l2 = b.approvals.find((a) => a.level === 2);

                const isCurrentL1 = currentUser.approvalLevel === 1 || currentUser.role === 'admin';
                const isCurrentL2 = currentUser.approvalLevel === 2;

                return (
                  <div
                    key={b.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700/80 transition-colors space-y-3.5"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-mono text-xs font-semibold text-slate-200">
                          {b.code}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          Menunggu Persetujuan
                        </span>
                        <span className="text-xs text-slate-400">
                          {b.department}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Diajukan: {formatDateTimeID(b.createdAt)}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                      {/* Column 1: Armada */}
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[11px]">Kendaraan &amp; Driver:</span>
                        <p className="text-white font-medium">{v?.name || '-'}</p>
                        <p className="text-slate-400 font-mono text-[11px]">
                          {v?.plateNumber} • {v?.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang'}
                        </p>
                        <p className="text-slate-400 mt-1 text-[11px]">
                          <span>Driver: {d?.name} ({d?.phone})</span>
                        </p>
                      </div>

                      {/* Column 2: Jadwal & Lokasi */}
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[11px]">Jadwal &amp; Wilayah:</span>
                        <p className="text-slate-300">
                          <span>{formatDateTimeID(b.startAt)}</span>
                        </p>
                        <p className="text-slate-400">s/d {formatDateTimeID(b.endAt)}</p>
                        <p className="text-slate-300 mt-1">
                          <span>{r?.name}</span>
                        </p>
                      </div>

                      {/* Column 3: Tujuan & Keperluan */}
                      <div className="space-y-1">
                        <span className="text-slate-400 text-[11px]">Tujuan &amp; Keperluan:</span>
                        <p className="text-white font-medium">{b.destination}</p>
                        <p className="text-slate-400 italic text-[11px] leading-relaxed">
                          "{b.purpose}"
                        </p>
                      </div>
                    </div>

                    {/* Multi-Level Approval Status Bar */}
                    <div className="p-3 rounded-lg bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-[11px]">Level 1 (Atasan):</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              l1?.status === 'approved'
                                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {l1?.status.toUpperCase()} ({l1?.approverName.split(',')[0]})
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-[11px]">Level 2 (Pool):</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              l2?.status === 'approved'
                                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                : l2?.status === 'pending'
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-slate-850 text-slate-500 border border-slate-800'
                            }`}
                          >
                            {l2?.status.toUpperCase()} ({l2?.approverName.split(',')[0]})
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewBookingDetail(b)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-xs transition-colors"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(b, 'reject')}
                          className="px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-medium transition-colors"
                        >
                          Tolak
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(b, 'approve')}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 text-xs font-medium transition-colors"
                        >
                          Setujui
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Locked Level 2 Approvals List (waiting for L1) */}
              {lockedApprovals.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="text-slate-400 text-xs font-semibold mb-3">
                    <span>Pemesanan Menunggu Persetujuan Level 1 Terlebih Dahulu ({lockedApprovals.length})</span>
                  </div>

                  <div className="space-y-3">
                    {lockedApprovals.map((b) => {
                      const v = vehicleMap.get(b.vehicleId);
                      const l1 = b.approvals.find((a) => a.level === 1);
                      return (
                        <div
                          key={b.id}
                          className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs opacity-75"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="font-mono font-bold text-slate-300">{b.code}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-white font-medium">{v?.name}</span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-300 truncate max-w-[200px]">{b.destination}</span>
                          </div>

                          <div className="flex items-center space-x-3 text-[11px]">
                            <span className="text-amber-400/90 font-medium">
                              <span>Menunggu {l1?.approverName} (L1)</span>
                            </span>
                            <button
                              onClick={() => onViewBookingDetail(b)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                            >
                              Detail
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: History Approvals */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Kode Pemesanan</th>
                  <th className="py-3 px-4">Kendaraan</th>
                  <th className="py-3 px-4">Tujuan</th>
                  <th className="py-3 px-4">Keputusan Anda</th>
                  <th className="py-3 px-4">Catatan / Alasan</th>
                  <th className="py-3 px-4">Status Akhir</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {historyApprovals.map((b) => {
                  const v = vehicleMap.get(b.vehicleId);
                  const myApp = b.approvals.find(
                    (a) => a.approverId === currentUser.id || a.level === currentUser.approvalLevel
                  );

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {b.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{v?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v?.plateNumber}</div>
                      </td>
                      <td className="py-3 px-4 max-w-[180px] truncate" title={b.destination}>
                        {b.destination}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            myApp?.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {myApp?.status.toUpperCase() || 'DISETUJUI'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 max-w-[200px] truncate" title={myApp?.note}>
                        {myApp?.note || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onViewBookingDetail(b)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px]"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirmation Modal (Approve / Reject) */}
      {selectedBookingForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white">
              {selectedBookingForAction.action === 'approve'
                ? 'Konfirmasi Persetujuan Pemesanan'
                : 'Konfirmasi Penolakan Pemesanan'}
            </h3>

            <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 space-y-1">
              <p>
                <span className="text-slate-400">Kode:</span>{' '}
                <span className="font-mono font-bold text-white">
                  {selectedBookingForAction.booking.code}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Tujuan:</span>{' '}
                <span className="font-semibold text-slate-200">
                  {selectedBookingForAction.booking.destination}
                </span>
              </p>
              <p>
                <span className="text-slate-400">Sebagai:</span>{' '}
                <span className="text-amber-400 font-medium">
                  {currentUser.position}
                </span>
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {selectedBookingForAction.action === 'approve'
                  ? 'Catatan Persetujuan (Opsional):'
                  : 'Alasan Penolakan (Wajib Diisi):'}
              </label>
              <textarea
                rows={3}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder={
                  selectedBookingForAction.action === 'approve'
                    ? 'Misal: Disetujui, harap patuhi batas kecepatan pit tambang 40 km/jam.'
                    : 'Misal: Kebutuhan operasional belum mendesak / kendaraan dialihkan ke tim safety patrol.'
                }
                className="w-full bg-slate-850 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div className="mt-5 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setSelectedBookingForAction(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedBookingForAction.action === 'approve'
                    ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600'
                    : 'bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700'
                }`}
              >
                {selectedBookingForAction.action === 'approve'
                  ? 'Konfirmasi Persetujuan'
                  : 'Konfirmasi Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
