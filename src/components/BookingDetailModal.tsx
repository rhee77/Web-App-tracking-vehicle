import React from 'react';
import {
  X,
  Truck,
  UserCheck,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Fuel,
  Gauge
} from 'lucide-react';
import type { Booking, Vehicle, Driver, Region } from '../types/index.ts';
import { formatDateTimeID, formatCurrencyIDR, calculateFuelEfficiency } from '../utils/rules.ts';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  vehicles: Vehicle[];
  drivers: Driver[];
  regions: Region[];
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  vehicles,
  drivers,
  regions
}) => {
  if (!booking) return null;

  const vehicle = vehicles.find((v) => v.id === booking.vehicleId);
  const driver = drivers.find((d) => d.id === booking.driverId);
  const region = regions.find((r) => r.id === booking.regionId);

  const l1 = booking.approvals.find((a) => a.level === 1);
  const l2 = booking.approvals.find((a) => a.level === 2);

  const distance =
    booking.endOdometer && booking.startOdometer
      ? Math.max(0, booking.endOdometer - booking.startOdometer)
      : null;

  const efficiency = calculateFuelEfficiency(
    booking.startOdometer,
    booking.endOdometer,
    booking.fuelFilledLiters
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-bold text-amber-400">
                {booking.code}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  booking.status === 'completed'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : booking.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : booking.status === 'rejected'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {booking.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Diajukan oleh {booking.createdByName} • {formatDateTimeID(booking.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4 text-xs">
          {/* Section 1: Armada & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-850 border border-slate-700/60">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5 mb-1">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Kendaraan Ditugaskan</span>
              </span>
              <p className="font-bold text-white text-sm">{vehicle?.name || '-'}</p>
              <p className="text-slate-300 font-mono mt-0.5">
                No. Pol: <span className="text-amber-300 font-bold">{vehicle?.plateNumber}</span>
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {vehicle?.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang'} •{' '}
                {vehicle?.ownership === 'owned' ? 'Milik Perusahaan' : `Sewa (${vehicle?.rentalCompany || 'Rentalindo'})`}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5 mb-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Driver / Pengemudi</span>
              </span>
              <p className="font-bold text-white text-sm">{driver?.name || '-'}</p>
              <p className="text-slate-300 font-mono mt-0.5">
                Kontak: <span className="text-slate-200">{driver?.phone}</span>
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Lisensi: {driver?.licenseType} ({driver?.licenseNumber})
              </p>
            </div>
          </div>

          {/* Section 2: Jadwal, Wilayah, Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-850 border border-slate-700/60">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Rentang Waktu Operasional</span>
              </span>
              <p className="text-slate-200 font-medium">Mulai: {formatDateTimeID(booking.startAt)}</p>
              <p className="text-slate-200 font-medium">Selesai: {formatDateTimeID(booking.endAt)}</p>
              <p className="text-emerald-400 text-[11px] mt-1 flex items-center space-x-1">
                <MapPin className="w-3 h-3" />
                <span>Wilayah: {region?.name}</span>
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 mb-1 block">
                Tujuan &amp; Keperluan
              </span>
              <p className="font-bold text-white">{booking.destination}</p>
              <p className="text-slate-300 text-[11px] italic mt-1 leading-relaxed">
                "{booking.purpose}"
              </p>
            </div>
          </div>

          {/* Section 3: Timeline Persetujuan Berjenjang 2-Level */}
          <div className="p-3.5 rounded-xl bg-slate-850 border border-slate-700/60 space-y-3">
            <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Status Otorisasi Persetujuan Berjenjang</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Level 1 Card */}
              <div
                className={`p-3 rounded-xl border ${
                  l1?.status === 'approved'
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : l1?.status === 'rejected'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-amber-950/20 border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">Persetujuan Level 1</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      l1?.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : l1?.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {l1?.status}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] font-semibold">{l1?.approverName}</p>
                <p className="text-slate-400 text-[10px]">{l1?.approverPosition}</p>
                {l1?.actedAt && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Diproses: {formatDateTimeID(l1.actedAt)}
                  </p>
                )}
                <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Catatan:</span> {l1?.note || 'Belum ada catatan'}
                </div>
              </div>

              {/* Level 2 Card */}
              <div
                className={`p-3 rounded-xl border ${
                  l2?.status === 'approved'
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : l2?.status === 'rejected'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : l2?.status === 'pending'
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white text-xs">Persetujuan Level 2 (Final)</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      l2?.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : l2?.status === 'rejected'
                        ? 'bg-rose-500/20 text-rose-400'
                        : l2?.status === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {l2?.status}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] font-semibold">{l2?.approverName}</p>
                <p className="text-slate-400 text-[10px]">{l2?.approverPosition}</p>
                {l2?.actedAt && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Diproses: {formatDateTimeID(l2.actedAt)}
                  </p>
                )}
                <div className="mt-2 text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Catatan:</span> {l2?.note || 'Belum ada catatan'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Realisasi Odometer & Konsumsi BBM (if completed) */}
          {booking.status === 'completed' && (
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/40 space-y-2">
              <span className="text-[11px] font-bold text-blue-300 flex items-center space-x-1.5 uppercase tracking-wider">
                <Gauge className="w-4 h-4" />
                <span>Realisasi Jarak Tempuh &amp; Konsumsi BBM</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Odometer Awal</span>
                  <p className="font-mono font-bold text-white text-xs mt-0.5">
                    {booking.startOdometer?.toLocaleString('id-ID')} KM
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Odometer Akhir</span>
                  <p className="font-mono font-bold text-white text-xs mt-0.5">
                    {booking.endOdometer?.toLocaleString('id-ID')} KM
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Jarak</span>
                  <p className="font-mono font-bold text-emerald-400 text-xs mt-0.5">
                    {distance ? `${distance} KM` : '-'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Konsumsi BBM</span>
                  <p className="font-mono font-bold text-amber-400 text-xs mt-0.5">
                    {booking.fuelFilledLiters} L ({formatCurrencyIDR(booking.fuelCost || 0)})
                  </p>
                </div>
              </div>

              {efficiency && (
                <p className="text-[11px] text-emerald-300 text-center pt-1">
                  Tingkat Efisiensi Rata-rata: <span className="font-bold font-mono">{efficiency} km/liter</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
