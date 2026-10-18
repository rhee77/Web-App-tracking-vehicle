import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Booking, Vehicle, Driver, Region, User } from '../types/index.ts';
import { formatDateTimeID, formatCurrencyIDR } from '../utils/rules.ts';

interface BookingsViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  regions: Region[];
  currentUser: User;
  onNewBookingClick: () => void;
  onViewBookingDetail: (booking: Booking) => void;
  onOpenCompleteModal: (booking: Booking) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  vehicles,
  drivers,
  regions,
  currentUser,
  onNewBookingClick,
  onViewBookingDetail,
  onOpenCompleteModal,
  onCancelBooking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverMap = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);
  const regionMap = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) {
        return false;
      }
      // Region filter
      if (regionFilter !== 'all' && b.regionId !== regionFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const v = vehicleMap.get(b.vehicleId);
        const d = driverMap.get(b.driverId);
        const matchesCode = b.code.toLowerCase().includes(query);
        const matchesDest = b.destination.toLowerCase().includes(query);
        const matchesPurpose = b.purpose.toLowerCase().includes(query);
        const matchesVehicle = v?.name.toLowerCase().includes(query) || v?.plateNumber.toLowerCase().includes(query);
        const matchesDriver = d?.name.toLowerCase().includes(query);
        return matchesCode || matchesDest || matchesPurpose || matchesVehicle || matchesDriver;
      }
      return true;
    });
  }, [bookings, statusFilter, regionFilter, searchTerm, vehicleMap, driverMap]);

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Daftar Pemesanan Kendaraan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manajemen permintaan armada dengan alur persetujuan berjenjang atasan &amp; pool
          </p>
        </div>

        <button
          onClick={onNewBookingClick}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs sm:text-sm border border-slate-700 transition-colors shrink-0"
        >
          Buat Pemesanan Baru
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode booking, armada, no. polisi, driver, atau tujuan..."
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition-colors"
            />
          </div>

          {/* Region Select */}
          <div className="w-full md:w-56">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-slate-500"
            >
              <option value="all">Semua Wilayah Operasional</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5 text-xs">
          <span className="text-[11px] text-slate-400 shrink-0 mr-1">Status:</span>
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'pending', label: 'Menunggu Approval' },
            { id: 'approved', label: 'Disetujui' },
            { id: 'completed', label: 'Selesai' },
            { id: 'rejected', label: 'Ditolak' },
            { id: 'cancelled', label: 'Dibatalkan' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-slate-700 text-white font-medium border border-slate-600'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] font-medium border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3.5">Kode &amp; Pemohon</th>
                <th className="py-2.5 px-3.5">Kendaraan &amp; Driver</th>
                <th className="py-2.5 px-3.5">Jadwal &amp; Lokasi</th>
                <th className="py-2.5 px-3.5">Tujuan / Keperluan</th>
                <th className="py-2.5 px-3.5">Alur Approval</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-medium">Tidak ada pemesanan yang cocok</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Coba sesuaikan kata kunci pencarian atau filter status.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const v = vehicleMap.get(b.vehicleId);
                  const d = driverMap.get(b.driverId);
                  const r = regionMap.get(b.regionId);
                  const l1 = b.approvals.find((a) => a.level === 1);
                  const l2 = b.approvals.find((a) => a.level === 2);

                  return (
                    <tr key={b.id} className="hover:bg-slate-850/60 transition-colors">
                      {/* Code & Requester */}
                      <td className="py-3 px-3.5 font-medium">
                        <div className="text-slate-200 font-mono text-xs">
                          {b.code}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {b.department}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {b.createdByName}
                        </div>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="py-3 px-3.5">
                        <div className="font-medium text-slate-200">
                          {v?.name || '-'}
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300 border border-slate-700/80">
                            {v?.plateNumber}
                          </span>
                          <span className="text-[9px] px-1 py-0.2 rounded uppercase bg-slate-850 text-slate-400 border border-slate-800">
                            {v?.ownership === 'owned' ? 'Milik' : 'Sewa'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Driver: {d?.name || '-'}
                        </div>
                      </td>

                      {/* Schedule & Region */}
                      <td className="py-3 px-3.5">
                        <div className="text-slate-300 text-[11px]">
                          {formatDateTimeID(b.startAt)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          s/d {formatDateTimeID(b.endAt)}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {r?.name}
                        </div>
                      </td>

                      {/* Destination / Purpose */}
                      <td className="py-3 px-3.5 max-w-[200px]">
                        <div className="font-medium text-slate-200 truncate" title={b.destination}>
                          {b.destination}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5" title={b.purpose}>
                          {b.purpose}
                        </div>
                      </td>

                      {/* Approval Status Badges */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1 text-[10px]">
                          {/* Level 1 */}
                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-400 w-5">L1:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-medium ${
                                l1?.status === 'approved'
                                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                  : l1?.status === 'rejected'
                                  ? 'bg-slate-850 text-slate-400 border border-slate-700'
                                  : 'bg-slate-800 text-slate-300 border border-slate-700'
                              }`}
                            >
                              {l1?.status.toUpperCase()}
                            </span>
                            <span className="text-slate-500 truncate max-w-[80px]">
                              {l1?.approverName.split(' ')[0]}
                            </span>
                          </div>

                          {/* Level 2 */}
                          <div className="flex items-center space-x-1.5">
                            <span className="text-slate-400 w-5">L2:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-medium ${
                                l2?.status === 'approved'
                                  ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                  : l2?.status === 'rejected'
                                  ? 'bg-slate-850 text-slate-400 border border-slate-700'
                                  : l2?.status === 'pending'
                                  ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                  : 'bg-slate-850 text-slate-500'
                              }`}
                            >
                              {l2?.status.toUpperCase()}
                            </span>
                            <span className="text-slate-500 truncate max-w-[80px]">
                              {l2?.approverName.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Overall Status */}
                      <td className="py-3 px-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                            b.status === 'completed'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : b.status === 'approved'
                              ? 'bg-slate-800 text-slate-200 border border-slate-700'
                              : b.status === 'rejected'
                              ? 'bg-slate-850 text-slate-400 border border-slate-700'
                              : b.status === 'cancelled'
                              ? 'bg-slate-850 text-slate-500 border border-slate-800'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onViewBookingDetail(b)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-[11px] transition-colors"
                          >
                            Detail
                          </button>

                          {/* Selesai Button */}
                          {b.status === 'approved' && currentUser.role === 'admin' && (
                            <button
                              onClick={() => onOpenCompleteModal(b)}
                              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-650 text-white text-[11px] font-medium border border-slate-600 transition-colors"
                            >
                              Selesai
                            </button>
                          )}

                          {/* Cancel Button */}
                          {b.status === 'pending' && currentUser.role === 'admin' && (
                            <button
                              onClick={() => onCancelBooking(b.id)}
                              className="px-2 py-1 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-rose-300 border border-slate-700 text-[11px] transition-colors"
                            >
                              Batal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
