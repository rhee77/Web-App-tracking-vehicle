import React from 'react';
import { X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 shadow-xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-semibold text-white">
                {booking.code}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase border ${
                  booking.status === 'completed'
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : booking.status === 'approved'
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
                    : booking.status === 'rejected'
                    ? 'bg-rose-950/40 text-rose-400 border-rose-800/50'
                    : 'bg-amber-950/30 text-amber-400/90 border-amber-800/40'
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
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-3.5 text-xs">
          {/* Section 1: Armada & Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-850/60 border border-slate-800">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                <span>Kendaraan Ditugaskan</span>
              </span>
              <p className="font-medium text-white text-sm">{vehicle?.name || '-'}</p>
              <p className="text-slate-300 font-mono text-[11px] mt-0.5">
                No. Pol: <span className="text-slate-200 font-semibold">{vehicle?.plateNumber}</span>
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {vehicle?.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang'} •{' '}
                {vehicle?.ownership === 'owned' ? 'Milik Perusahaan' : `Sewa (${vehicle?.rentalCompany || 'Rentalindo'})`}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                <span>Driver / Pengemudi</span>
              </span>
              <p className="font-medium text-white text-sm">{driver?.name || '-'}</p>
              <p className="text-slate-300 font-mono text-[11px] mt-0.5">
                Kontak: <span className="text-slate-200">{driver?.phone}</span>
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Lisensi: {driver?.licenseType} ({driver?.licenseNumber})
              </p>
            </div>
          </div>

          {/* Section 2: Jadwal, Wilayah, Tujuan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-slate-850/60 border border-slate-800">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block mb-1">
                <span>Rentang Waktu Operasional</span>
              </span>
              <p className="text-slate-300 font-medium text-[11px]">Mulai: {formatDateTimeID(booking.startAt)}</p>
              <p className="text-slate-300 font-medium text-[11px]">Selesai: {formatDateTimeID(booking.endAt)}</p>
              <p className="text-slate-400 text-[11px] mt-1">
                Wilayah: {region?.name}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-medium text-slate-400 mb-1 block">
                Tujuan &amp; Keperluan
              </span>
              <p className="font-medium text-white">{booking.destination}</p>
              <p className="text-slate-400 text-[11px] italic mt-1 leading-relaxed">
                "{booking.purpose}"
              </p>
            </div>
          </div>

          {/* Section 3: Timeline Persetujuan Berjenjang 2-Level */}
          <div className="p-3 rounded-lg bg-slate-850/60 border border-slate-800 space-y-2.5">
            <span className="text-[11px] font-medium text-slate-300 block uppercase tracking-wider">
              <span>Status Otorisasi Persetujuan Berjenjang</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Level 1 Card */}
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-200 text-xs">Persetujuan Level 1</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase border ${
                      l1?.status === 'approved'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                        : l1?.status === 'rejected'
                        ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                        : 'bg-amber-950/30 text-amber-400/90 border-amber-800/30'
                    }`}
                  >
                    {l1?.status}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{l1?.approverName}</p>
                <p className="text-slate-500 text-[10px]">{l1?.approverPosition}</p>
                {l1?.actedAt && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Diproses: {formatDateTimeID(l1.actedAt)}
                  </p>
                )}
                <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-850">
                  <span className="text-slate-500">Catatan:</span> {l1?.note || 'Belum ada catatan'}
                </div>
              </div>

              {/* Level 2 Card */}
              <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-200 text-xs">Persetujuan Level 2 (Final)</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium uppercase border ${
                      l2?.status === 'approved'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                        : l2?.status === 'rejected'
                        ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                        : l2?.status === 'pending'
                        ? 'bg-amber-950/30 text-amber-400/90 border-amber-800/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {l2?.status}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{l2?.approverName}</p>
                <p className="text-slate-500 text-[10px]">{l2?.approverPosition}</p>
                {l2?.actedAt && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Diproses: {formatDateTimeID(l2.actedAt)}
                  </p>
                )}
                <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-850">
                  <span className="text-slate-500">Catatan:</span> {l2?.note || 'Belum ada catatan'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Realisasi Odometer & Konsumsi BBM (if completed) */}
          {booking.status === 'completed' && (
            <div className="p-3 rounded-lg bg-slate-850/60 border border-slate-800 space-y-2">
              <span className="text-[11px] font-medium text-slate-300 block uppercase tracking-wider">
                <span>Realisasi Jarak Tempuh &amp; Konsumsi BBM</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Odometer Awal</span>
                  <p className="font-mono font-medium text-white text-xs mt-0.5">
                    {booking.startOdometer?.toLocaleString('id-ID')} KM
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Odometer Akhir</span>
                  <p className="font-mono font-medium text-white text-xs mt-0.5">
                    {booking.endOdometer?.toLocaleString('id-ID')} KM
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Total Jarak</span>
                  <p className="font-mono font-medium text-slate-200 text-xs mt-0.5">
                    {distance ? `${distance} KM` : '-'}
                  </p>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400">Konsumsi BBM</span>
                  <p className="font-mono font-medium text-slate-200 text-xs mt-0.5">
                    {booking.fuelFilledLiters} L ({formatCurrencyIDR(booking.fuelCost || 0)})
                  </p>
                </div>
              </div>

              {efficiency && (
                <p className="text-[11px] text-slate-300 text-center pt-1">
                  Tingkat Efisiensi Rata-rata: <span className="font-semibold font-mono">{efficiency} km/liter</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
