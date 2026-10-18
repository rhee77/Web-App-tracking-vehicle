import React, { useState, useMemo } from 'react';

import type { Booking, Vehicle, Driver, Region } from '../types/index.ts';
import { exportBookingsToExcel } from '../utils/excelExport.ts';
import { formatDateTimeID, formatCurrencyIDR } from '../utils/rules.ts';

interface ReportsViewProps {
  bookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  regions: Region[];
  onLogActivity: (action: string, category: 'export', description: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  bookings,
  vehicles,
  drivers,
  regions,
  onLogActivity
}) => {
  const [periodPreset, setPeriodPreset] = useState<'all' | 'this_month' | 'last_month' | 'quarter'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState(false);

  const vehicleMap = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverMap = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);
  const regionMap = useMemo(() => new Map(regions.map((r) => [r.id, r])), [regions]);

  // Filter logic
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      // Region
      if (regionFilter !== 'all' && b.regionId !== regionFilter) return false;
      // Category
      if (categoryFilter !== 'all') {
        const v = vehicleMap.get(b.vehicleId);
        if (v && v.category !== categoryFilter) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, regionFilter, categoryFilter, vehicleMap]);

  // Aggregated metrics
  const totalCount = filteredBookings.length;
  const approvedCount = filteredBookings.filter((b) => b.status === 'approved' || b.status === 'completed').length;
  const pendingCount = filteredBookings.filter((b) => b.status === 'pending').length;
  const rejectedCount = filteredBookings.filter((b) => b.status === 'rejected').length;

  const totalFuelLiters = filteredBookings.reduce((sum, b) => sum + (b.fuelFilledLiters || 0), 0);
  const totalFuelCost = filteredBookings.reduce((sum, b) => sum + (b.fuelCost || 0), 0);
  const totalDistance = filteredBookings.reduce(
    (sum, b) => sum + (b.endOdometer && b.startOdometer ? Math.max(0, b.endOdometer - b.startOdometer) : 0),
    0
  );

  const handleExport = () => {
    setIsExporting(true);
    try {
      const filename = `Laporan_Pemesanan_Armada_Nikel_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportBookingsToExcel(filteredBookings, vehicles, drivers, regions, filename);
      onLogActivity('EXPORT_EXCEL', 'export', `Mengunduh laporan periodik (${filteredBookings.length} data pemesanan) format Excel .xlsx`);
      setExportSuccessMsg(true);
      setTimeout(() => setExportSuccessMsg(false), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal mengekspor file Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Laporan Periodik Pemesanan &amp; Export Excel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Unduh rekapitulasi data pemesanan, konsumsi BBM, jarak tempuh, dan status persetujuan
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || filteredBookings.length === 0}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs sm:text-sm border border-slate-700 transition-colors shrink-0 disabled:opacity-50"
        >
          {isExporting ? 'Memproses...' : 'Export ke Excel (.xlsx)'}
        </button>
      </div>

      {/* Success Notification */}
      {exportSuccessMsg && (
        <div className="p-3.5 rounded-lg bg-slate-850 border border-slate-700 text-slate-200 text-xs">
          <div>
            <span className="font-semibold text-white">Berhasil!</span> File spreadsheet Excel (.xlsx) telah di-generate dan otomatis diunduh dengan 3 lembar kerja (Data Pemesanan, Ringkasan, Master Armada).
          </div>
        </div>
      )}

      {/* Filter Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs space-y-3.5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Parameter Filter Laporan
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Status Pemesanan</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
            >
              <option value="all">Semua Status</option>
              <option value="approved">Disetujui (Approved)</option>
              <option value="completed">Selesai (Completed)</option>
              <option value="pending">Menunggu Persetujuan</option>
              <option value="rejected">Ditolak (Rejected)</option>
            </select>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Wilayah / Tambang</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
            >
              <option value="all">Semua Lokasi Tambang &amp; Kantor</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Kategori Kendaraan</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
            >
              <option value="all">Semua Jenis Angkutan</option>
              <option value="people">Angkutan Orang (Personel &amp; Crew)</option>
              <option value="goods">Angkutan Barang (Hauling &amp; Dump)</option>
            </select>
          </div>

          {/* Period Preset */}
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">Rentang Periode</label>
            <select
              value={periodPreset}
              onChange={(e) => setPeriodPreset(e.target.value as any)}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
            >
              <option value="all">Semua Periode</option>
              <option value="this_month">Bulan Ini (Oktober 2026)</option>
              <option value="last_month">Bulan Lalu (September 2026)</option>
              <option value="quarter">Kuartal 3 &amp; 4 (2026)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">Total Dokumen Pemesanan</span>
          <div className="text-xl font-bold text-white mt-1">
            {totalCount} <span className="text-xs font-normal text-slate-400">Pemesanan</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {approvedCount} disetujui • {rejectedCount} ditolak
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">Total Akumulasi Jarak</span>
          <div className="text-xl font-bold text-white mt-1">
            {totalDistance.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">KM</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Berdasarkan input odometer pool
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">Total Konsumsi Solar</span>
          <div className="text-xl font-bold text-white mt-1">
            {totalFuelLiters.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-400">Liter</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Realisasi pengisian pool
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xs">
          <span className="text-[11px] text-slate-400">Total Biaya Bahan Bakar</span>
          <div className="text-xl font-bold text-white mt-1">
            {formatCurrencyIDR(totalFuelCost)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Estimasi efisiensi operasional
          </div>
        </div>
      </div>

      {/* Filtered Data Preview Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-semibold text-white text-xs">
            Preview Data ({filteredBookings.length} baris)
          </span>
          <span className="text-[11px] text-slate-400">
            Format: Microsoft Excel OpenXML (.xlsx)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Kode Booking</th>
                <th className="py-2.5 px-3">Kendaraan</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Tujuan</th>
                <th className="py-2.5 px-3">Mulai</th>
                <th className="py-2.5 px-3">Selesai</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">BBM (L)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredBookings.map((b, i) => {
                const v = vehicleMap.get(b.vehicleId);
                const d = driverMap.get(b.driverId);

                return (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-white">{b.code}</td>
                    <td className="py-2.5 px-3">
                      <div>{v?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{v?.plateNumber}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {v?.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang'}
                    </td>
                    <td className="py-2.5 px-3">{d?.name}</td>
                    <td className="py-2.5 px-3 max-w-[160px] truncate" title={b.destination}>
                      {b.destination}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">{formatDateTimeID(b.startAt)}</td>
                    <td className="py-2.5 px-3 text-[11px]">{formatDateTimeID(b.endAt)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200">
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {b.fuelFilledLiters ? `${b.fuelFilledLiters} L` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
