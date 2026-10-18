import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Booking, Vehicle } from '../types/index.ts';
import { formatCurrencyIDR } from '../utils/rules.ts';

interface CompleteBookingModalProps {
  booking: Booking | null;
  vehicle: Vehicle | undefined;
  onClose: () => void;
  onConfirm: (
    bookingId: string,
    endOdometer: number,
    fuelLiters: number,
    fuelCost: number
  ) => void;
}

export const CompleteBookingModal: React.FC<CompleteBookingModalProps> = ({
  booking,
  vehicle,
  onClose,
  onConfirm
}) => {
  if (!booking) return null;

  const initialOdo = booking.startOdometer || vehicle?.odometer || 40000;
  const [endOdometer, setEndOdometer] = useState(initialOdo + 180);
  const [fuelLiters, setFuelLiters] = useState(35);
  const [fuelCost, setFuelCost] = useState(525000);
  const [errorMsg, setErrorMsg] = useState('');

  const distance = Math.max(0, endOdometer - initialOdo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (endOdometer < initialOdo) {
      setErrorMsg('Odometer akhir tidak boleh lebih kecil dari odometer awal.');
      return;
    }
    onConfirm(booking.id, Number(endOdometer), Number(fuelLiters), Number(fuelCost));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-sm">
              Penyelesaian Pemesanan Kendaraan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 p-3 rounded-lg bg-slate-850/60 border border-slate-800 text-xs text-slate-400">
          <p>
            Kode Booking: <span className="font-mono font-medium text-white">{booking.code}</span>
          </p>
          <p className="mt-0.5">
            Kendaraan: <span className="font-medium text-slate-200">{vehicle?.name}</span> ({vehicle?.plateNumber})
          </p>
          <p className="mt-0.5">
            Odometer Awal: <span className="font-mono text-slate-300">{initialOdo.toLocaleString('id-ID')} KM</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-850 border border-slate-700 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 text-[11px] mb-1">
              Odometer Akhir Saat Kembali ke Pool (KM) <span className="text-slate-500">*</span>
            </label>
            <input
              type="number"
              min={initialOdo}
              value={endOdometer}
              onChange={(e) => setEndOdometer(Number(e.target.value))}
              required
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-slate-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Estimasi Jarak Tempuh: <span className="font-medium text-slate-200">{distance} KM</span>
            </p>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">
              Pengisian BBM Tambahan (Liter Solar/Dex)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={fuelLiters}
              onChange={(e) => setFuelLiters(Number(e.target.value))}
              required
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1">
              Total Biaya Bahan Bakar (IDR)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={fuelCost}
              onChange={(e) => setFuelCost(Number(e.target.value))}
              required
              className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-slate-500"
            />
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-medium shadow-sm transition-colors"
            >
              Simpan &amp; Tandai Selesai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
