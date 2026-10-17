import React, { useState, useMemo } from 'react';
import {
  Truck,
  Users,
  CalendarCheck2,
  Clock,
  Fuel,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Building2,
  BarChart3
} from 'lucide-react';
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
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Monitoring &amp; Fleet ERP Tambang Nikel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Operasional Armada
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Pemantauan terpusat untuk 1 Kantor Pusat, 1 Cabang, dan 6 Area Tambang Nikel dengan sistem persetujuan berjenjang 2-level.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('new_booking')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Truck className="w-4 h-4" />
              <span>+ Buat Pemesanan Baru</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Export Laporan Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Approver Action Callout Banner (if applicable) */}
      {currentUser.role === 'approver' && myPendingApprovals.length > 0 && (
        <div className="bg-gradient-to-r from-amber-900/60 to-amber-800/40 border border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-200 text-sm sm:text-base">
                Perhatian: Terdapat {myPendingApprovals.length} Pemesanan Menunggu Persetujuan Anda!
              </h3>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Sebagai {currentUser.position}, persetujuan Anda diperlukan agar kendaraan dapat segera diterbitkan pool.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('approvals')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center space-x-1.5 shrink-0 transition-colors"
          >
            <span>Tinjau Persetujuan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Armada */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Armada Pool</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {totalVehicles} <span className="text-xs font-normal text-slate-400">Unit</span>
          </div>
          <div className="mt-2 flex items-center space-x-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{availableVehicles} Siap</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{inUseVehicles} Operasi</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{maintenanceVehicles} Servis</span>
          </div>
        </div>

        {/* Card 2: Pemesanan Aktif */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pemesanan Disetujui</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
            {activeBookings}{' '}
            <span className="text-xs font-normal text-slate-400">Jadwal Aktif</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {completedBookings} pesanan telah selesai operasi
          </p>
        </div>

        {/* Card 3: Menunggu Approval */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Menunggu Persetujuan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400">
            {pendingBookings}{' '}
            <span className="text-xs font-normal text-slate-400">Pengajuan</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Verifikasi berjenjang L1 Atasan &amp; L2 Pool
          </p>
        </div>

        {/* Card 4: Konsumsi BBM */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Konsumsi BBM Tercatat</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white">
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
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-bold text-white text-base flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Grafik Tren Pemakaian Kendaraan Bulanan (2026)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Jumlah order pemesanan unit kendaraan tambang &amp; konsumsi solar
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-300">
                <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span>
                <span>Order Pemesanan</span>
              </span>
            </div>
          </div>

          {/* Native SVG Bar Chart */}
          <div className="h-64 w-full flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-800">
            {monthlyData.map((d, i) => {
              const heightPercent = Math.round((d.count / maxMonthCount) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="text-[11px] font-bold text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5">
                    {d.count} unit
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-800 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-amber-600 via-amber-500 to-amber-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                    />
                  </div>
                  <span className="mt-3 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                    {d.month}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {d.liters}L
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-2">
            <span>Rata-rata kenaikan utilitas: +18.4% per kuartal</span>
            <span className="text-emerald-400 font-semibold">Tingkat Utilisasi Armada: 83.3%</span>
          </div>
        </div>

        {/* Chart 2: Category Ratio & Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-white text-base flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Komposisi Jenis Kendaraan</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Angkutan Orang vs Angkutan Barang
            </p>

            {/* Visual Ratio Progress Bar */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-blue-400 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                    <span>Angkutan Orang (Hilux, HiAce, Triton)</span>
                  </span>
                  <span className="font-bold text-white">{peoplePercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${peoplePercent}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {peopleBookingsCount} order pemesanan operasional crew &amp; inspeksi
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-amber-400 flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span>Angkutan Barang (Dump Truck, Hauler, Canter)</span>
                  </span>
                  <span className="font-bold text-white">{goodsPercent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${goodsPercent}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {goodsBookingsCount} order pengangkutan bijih nikel &amp; spareparts
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Status Kepemilikan Armada
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 text-[11px]">Milik Perusahaan</span>
                <p className="font-bold text-white text-sm mt-0.5">8 Unit (66.7%)</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 text-[11px]">Sewa (Rental)</span>
                <p className="font-bold text-amber-400 text-sm mt-0.5">4 Unit (33.3%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Region Distribution & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Region Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-white text-base flex items-center space-x-2 mb-1">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Sebaran Pemakaian per Wilayah</span>
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Distribusi pergerakan di 1 Kantor Pusat, 1 Cabang, 6 Tambang
          </p>

          <div className="space-y-3">
            {regionUsage.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      r.type === 'head_office'
                        ? 'bg-blue-400'
                        : r.type === 'branch'
                        ? 'bg-purple-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="font-medium text-slate-200 truncate">{r.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold font-mono">
                    {r.count} trip
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Bookings Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white text-base flex items-center space-x-2">
                <CalendarCheck2 className="w-4 h-4 text-amber-400" />
                <span>Pemesanan Terbaru</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring status alur persetujuan berjenjang
              </p>
            </div>
            <button
              onClick={() => onNavigate('bookings')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Kode &amp; Tanggal</th>
                  <th className="py-2.5 px-3">Kendaraan</th>
                  <th className="py-2.5 px-3">Tujuan</th>
                  <th className="py-2.5 px-3">Persetujuan</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {bookings.slice(0, 5).map((b) => {
                  const v = vehicleMap.get(b.vehicleId);
                  const l1 = b.approvals.find((a) => a.level === 1);
                  const l2 = b.approvals.find((a) => a.level === 2);

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-medium">
                        <div className="text-white font-mono font-semibold">{b.code}</div>
                        <div className="text-[10px] text-slate-400">{formatDateID(b.createdAt)}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-200">{v?.name || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v?.plateNumber}</div>
                      </td>
                      <td className="py-3 px-3 max-w-[160px] truncate" title={b.destination}>
                        {b.destination}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              l1?.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : l1?.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            L1: {l1?.status.toUpperCase()}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              l2?.status === 'approved'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : l2?.status === 'rejected'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : l2?.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            L2: {l2?.status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'completed'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : b.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : b.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {b.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onViewBookingDetail(b)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
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
