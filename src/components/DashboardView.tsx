import React, { useState, useMemo } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import type { Booking, Vehicle, Driver, Region, User } from '../types/index.ts';
import { formatCurrencyIDR, formatDateID } from '../utils/rules.ts';

interface DashboardViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  regions: Region[];
  currentUser: User;
  onNavigate: (tab: string) => void;
  onViewBookingDetail: (booking: Booking) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  bookings,
  vehicles,
  drivers,
  regions,
  currentUser,
  onNavigate,
  onViewBookingDetail
}) => {
  const [periodFilter, setPeriodFilter] = useState<'all' | 'month' | 'quarter'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'people' | 'goods'>('all');

  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const regionMap = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);

  // Filter bookings based on period
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (categoryFilter !== 'all') {
        const v = vehicleMap.get(b.vehicleId);
        if (v && v.category !== categoryFilter) return false;
      }
      return true;
    });
  }, [bookings, categoryFilter, vehicleMap]);

  // Metrics
  const totalVehicles = vehicles.length;
  const inUseVehicles = vehicles.filter((v) => v.status === 'in_use').length;
  const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;

  const activeBookings = bookings.filter((b) => b.status === 'approved').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;

  const totalFuelLiters = bookings.reduce((sum, b) => sum + (b.fuelFilledLiters || 0), 0);
  const totalFuelCost = bookings.reduce((sum, b) => sum + (b.fuelCost || 0), 0);

  // Approver's urgent tasks
  const myPendingApprovals = useMemo(() => {
    if (currentUser.role === 'admin') return [];
    return bookings.filter((b) => {
      if (b.status !== 'pending') return false;
      const myApp = b.approvals.find(
        (a) => a.approverId === currentUser.id || a.level === currentUser.approvalLevel
      );
      if (!myApp) return false;
      if (myApp.status !== 'pending') return false;
      if (myApp.level === 2) {
        const l1 = b.approvals.find((a) => a.level === 1);
        return l1?.status === 'approved';
      }
      return true;
    });
  }, [bookings, currentUser]);

  // Monthly Usage Data for SVG Chart
  const monthlyData = [
    { month: 'Mei', count: 4, liters: 180 },
    { month: 'Jun', count: 7, liters: 320 },
    { month: 'Jul', count: 9, liters: 410 },
    { month: 'Agu', count: 12, liters: 540 },
    { month: 'Sep', count: 15, liters: 690 },
    { month: 'Okt', count: 18, liters: 820 }
  ];
  const maxMonthCount = Math.max(...monthlyData.map((d) => d.count), 20);

  // Category Distribution
  const peopleBookingsCount = bookings.filter((b) => {
    const v = vehicleMap.get(b.vehicleId);
    return v?.category === 'people';
  }).length;
  const goodsBookingsCount = bookings.filter((b) => {
    const v = vehicleMap.get(b.vehicleId);
    return v?.category === 'goods';
  }).length;
  const totalCategory = peopleBookingsCount + goodsBookingsCount || 1;
  const peoplePercent = Math.round((peopleBookingsCount / totalCategory) * 100);
  const goodsPercent = 100 - peoplePercent;

  // Region breakdown
  const regionUsage = useMemo(() => {
    const countMap: Record<string, number> = {};
    bookings.forEach((b) => {
      countMap[b.regionId] = (countMap[b.regionId] || 0) + 1;
    });
    return regions.map((r) => ({
      name: r.name.replace('Tambang ', '').replace('Kantor ', ''),
      type: r.type,
      count: countMap[r.id] || 0
    })).sort((a, b) => b.count - a.count);
  }, [bookings, regions]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-slate-300 text-[11px] font-medium mb-2">
              <span>Sistem Manajemen Armada Tambang</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Dashboard Operasional Armada
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Pemantauan terpusat untuk 1 Kantor Pusat, 1 Cabang, dan 6 Area Tambang Nikel dengan sistem persetujuan berjenjang 2-level.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('new_booking')}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              Buat Pemesanan Baru
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 py-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/80 font-medium text-xs sm:text-sm transition-colors"
            >
              Export Laporan Excel
            </button>
          </div>
        </div>
      </div>

      {/* Approver Action Callout Banner (if applicable) */}
      {currentUser.role === 'approver' && myPendingApprovals.length > 0 && (
        <div className="bg-slate-850 border border-slate-700/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-200 text-sm">
              Terdapat {myPendingApprovals.length} Pemesanan Menunggu Persetujuan Anda
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Sebagai {currentUser.position}, persetujuan Anda diperlukan untuk pemrosesan armada.
            </p>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-medium text-xs flex items-center justify-center space-x-1.5 shrink-0 transition-colors"
          >
            <span>Tinjau Persetujuan</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Armada */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700/80 transition-colors">
          <div className="text-xs font-medium text-slate-400 mb-2">
            Total Armada Pool
          </div>
          <div className="text-2xl font-bold text-white">
            {totalVehicles} <span className="text-xs font-normal text-slate-400">Unit</span>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="text-slate-300">{availableVehicles} Siap</span>
            <span>•</span>
            <span className="text-slate-300">{inUseVehicles} Operasi</span>
            <span>•</span>
            <span className="text-slate-400">{maintenanceVehicles} Servis</span>
          </div>
        </div>

        {/* Card 2: Pemesanan Aktif */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700/80 transition-colors">
          <div className="text-xs font-medium text-slate-400 mb-2">
            Pemesanan Disetujui
          </div>
          <div className="text-2xl font-bold text-white">
            {activeBookings}{' '}
            <span className="text-xs font-normal text-slate-400">Jadwal Aktif</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {completedBookings} pesanan selesai operasi
          </p>
        </div>

        {/* Card 3: Menunggu Approval */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700/80 transition-colors">
          <div className="text-xs font-medium text-slate-400 mb-2">
            Menunggu Persetujuan
          </div>
          <div className="text-2xl font-bold text-white">
            {pendingBookings}{' '}
            <span className="text-xs font-normal text-slate-400">Pengajuan</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Verifikasi berjenjang L1 Atasan &amp; L2 Pool
          </p>
        </div>

        {/* Card 4: Konsumsi BBM */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs hover:border-slate-700/80 transition-colors">
          <div className="text-xs font-medium text-slate-400 mb-2">
            Konsumsi BBM Tercatat
          </div>
          <div className="text-2xl font-bold text-white">
            {totalFuelLiters.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-slate-400">Liter</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 truncate">
            Total Biaya: {formatCurrencyIDR(totalFuelCost)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Bar Chart of Monthly Vehicle Usage */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-semibold text-white text-sm sm:text-base">
                Tren Pemakaian Kendaraan Bulanan (2026)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Jumlah order pemesanan armada &amp; konsumsi bahan bakar
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-slate-500 inline-block"></span>
                <span>Order Pemesanan</span>
              </span>
            </div>
          </div>

          {/* Native SVG Bar Chart */}
          <div className="h-60 w-full flex items-end justify-between gap-2 sm:gap-6 pt-4 pb-2 px-2 border-b border-slate-800">
            {monthlyData.map((d, i) => {
              const heightPercent = Math.round((d.count / maxMonthCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[11px] font-medium text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5">
                    {d.count} unit
                  </div>
                  <div className="w-full max-w-[36px] bg-slate-800/80 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-slate-600 group-hover:bg-slate-500 rounded-t-md transition-all duration-300"
                    />
                  </div>
                  <span className="mt-2.5 text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                    {d.month}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {d.liters}L
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>Rata-rata utilitas: +18.4% per kuartal</span>
            <span className="text-slate-300 font-medium">Tingkat Utilisasi Armada: 83.3%</span>
          </div>
        </div>

        {/* Chart 2: Category Ratio & Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-white text-sm sm:text-base mb-1">
              Komposisi Jenis Kendaraan
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Angkutan Orang vs Angkutan Barang
            </p>

            {/* Visual Ratio Progress Bar */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span>Angkutan Orang (Hilux, HiAce, Triton)</span>
                  </span>
                  <span className="font-semibold text-slate-200">{peoplePercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${peoplePercent}%` }}
                    className="h-full bg-slate-500 rounded-full"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {peopleBookingsCount} order pemesanan operasional crew &amp; inspeksi
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-300 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                    <span>Angkutan Barang (Dump Truck, Hauler, Canter)</span>
                  </span>
                  <span className="font-semibold text-slate-200">{goodsPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${goodsPercent}%` }}
                    className="h-full bg-slate-600 rounded-full"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {goodsBookingsCount} order pengangkutan bijih nikel &amp; spareparts
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Status Kepemilikan Armada
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Milik Perusahaan</span>
                <p className="font-semibold text-white text-sm mt-0.5">8 Unit (66.7%)</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-850 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Sewa (Rental)</span>
                <p className="font-semibold text-slate-300 text-sm mt-0.5">4 Unit (33.3%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Distribution & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Region Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <h2 className="font-semibold text-white text-sm sm:text-base mb-1">
            Sebaran Pemakaian per Wilayah
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Distribusi pergerakan di 1 Kantor Pusat, 1 Cabang, 6 Tambang
          </p>

          <div className="space-y-2.5">
            {regionUsage.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-850 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      r.type === 'head_office'
                        ? 'bg-slate-300'
                        : r.type === 'branch'
                        ? 'bg-slate-400'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="text-slate-300 truncate">{r.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700/80">
                    {r.count} trip
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Bookings Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-white text-sm sm:text-base">
                Pemesanan Terbaru
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring status alur persetujuan berjenjang
              </p>
            </div>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition-colors"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Kode &amp; Tanggal</th>
                  <th className="py-2.5 px-3">Kendaraan</th>
                  <th className="py-2.5 px-3">Tujuan</th>
                  <th className="py-2.5 px-3">Persetujuan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {bookings.slice(0, 5).map((b) => {
                  const v = vehicleMap.get(b.vehicleId);
                  const l1 = b.approvals.find((a) => a.level === 1);
                  const l2 = b.approvals.find((a) => a.level === 2);

                  return (
                    <tr key={b.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 px-3 font-medium">
                        <div className="text-slate-200 font-mono">{b.code}</div>
                        <div className="text-[10px] text-slate-500">{formatDateID(b.createdAt)}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-200">{v?.name || '-'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{v?.plateNumber}</div>
                      </td>
                      <td className="py-2.5 px-3 max-w-[160px] truncate" title={b.destination}>
                        {b.destination}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              l1?.status === 'approved'
                                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                : l1?.status === 'rejected'
                                ? 'bg-slate-850 text-slate-400 border border-slate-700'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            L1: {l1?.status.toUpperCase()}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                              l2?.status === 'approved'
                                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                                : l2?.status === 'rejected'
                                ? 'bg-slate-850 text-slate-400 border border-slate-700'
                                : l2?.status === 'pending'
                                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                : 'bg-slate-850 text-slate-500'
                            }`}
                          >
                            L2: {l2?.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            b.status === 'completed'
                              ? 'bg-slate-800 text-slate-300 border border-slate-700'
                              : b.status === 'approved'
                              ? 'bg-slate-800 text-slate-200 border border-slate-700'
                              : b.status === 'rejected'
                              ? 'bg-slate-850 text-slate-400 border border-slate-700'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onViewBookingDetail(b)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 text-[11px] transition-colors"
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
      </div>
    </div>
  );
};
