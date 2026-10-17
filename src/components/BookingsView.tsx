import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  UserCheck,
  ChevronRight,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Daftar Pemesanan Kendaraan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manajemen permintaan armada dengan alur persetujuan berjenjang atasan &amp; pool
          </p>
        </div>

        <button
          onClick={onNewBookingClick}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Pemesanan Baru</span>
        </button>
      </div>

      {/* Filter Chips & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode booking, armada, no. polisi, driver, atau tujuan..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Region Select */}
          <div className="w-full md:w-60">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
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
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Status:</span>
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'pending', label: 'Menunggu Approval' },
            { id: 'approved', label: 'Disetujui (Approved)' },
            { id: 'completed', label: 'Selesai (Completed)' },
            { id: 'rejected', label: 'Ditolak (Rejected)' },
            { id: 'cancelled', label: 'Dibatalkan' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Kode &amp; Pemohon</th>
                <th className="py-3 px-4">Kendaraan &amp; Driver</th>
                <th className="py-3 px-4">Jadwal &amp; Lokasi</th>
                <th className="py-3 px-4">Tujuan / Keperluan</th>
                <th className="py-3 px-4">Alur Approval</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold">Tidak ada pemesanan yang cocok</p>
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
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Code & Requester */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="text-white font-mono font-bold text-xs">
                          {b.code}
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                          {b.department}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {b.createdByName}
                        </div>
                      </td>

                      {/* Vehicle & Driver */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 flex items-center space-x-1.5">
                          <span>{v?.name || '-'}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded text-slate-300 border border-slate-700">
                            {v?.plateNumber}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1 py-0.2 rounded uppercase ${
                              v?.ownership === 'owned'
                                ? 'bg-blue-900/40 text-blue-300'
                                : 'bg-purple-900/40 text-purple-300'
                            }`}
                          >
                            {v?.ownership === 'owned' ? 'Milik' : 'Sewa'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                          <UserCheck className="w-3 h-3 text-slate-500" />
                          <span>Driver: {d?.name || '-'}</span>
                        </div>
                      </td>

                      {/* Schedule & Region */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-200 text-[11px] font-medium">
                          {formatDateTimeID(b.startAt)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          s/d {formatDateTimeID(b.endAt)}
                        </div>
                        <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">
                          {r?.name}
                        </div>
                      </td>

                      {/* Destination / Purpose */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="font-medium text-slate-200 truncate" title={b.destination}>
                          {b.destination}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5" title={b.purpose}>
                          {b.purpose}
                        </div>
                      </td>

                      {/* Approval Status Badges */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          {/* Level 1 */}
                          <div className="flex items-center space-x-1.5 text-[10px]">
                            <span className="text-slate-400 w-5">L1:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                l1?.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : l1?.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {l1?.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                              {l1?.approverName.split(' ')[0]}
                            </span>
                          </div>

                          {/* Level 2 */}
                          <div className="flex items-center space-x-1.5 text-[10px]">
                            <span className="text-slate-400 w-5">L2:</span>
                            <span
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                l2?.status === 'approved'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : l2?.status === 'rejected'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : l2?.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {l2?.status.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                              {l2?.approverName.split(' ')[0]}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Overall Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            b.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : b.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : b.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : b.status === 'cancelled'
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onViewBookingDetail(b)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                          >
                            Detail
                          </button>

                          {/* Selesai Button (for approved bookings to input end odo & BBM) */}
                          {b.status === 'approved' && currentUser.role === 'admin' && (
                            <button
                              onClick={() => onOpenCompleteModal(b)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors shadow-xs"
                            >
                              Selesai
                            </button>
                          )}

                          {/* Cancel Button (if still pending) */}
                          {b.status === 'pending' && currentUser.role === 'admin' && (
                            <button
                              onClick={() => onCancelBooking(b.id)}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-semibold transition-colors"
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
