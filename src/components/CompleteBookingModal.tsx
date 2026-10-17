import React, { useState } from 'react';
import { CheckCircle2, X, Gauge, Fuel, DollarSign } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Penyelesaian Pemesanan Kendaraan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
          <p>
            Kode Booking: <span className="font-mono font-bold text-white">{booking.code}</span>
          </p>
          <p className="mt-0.5">
            Kendaraan: <span className="font-semibold text-amber-300">{vehicle?.name}</span> ({vehicle?.plateNumber})
          </p>
          <p className="mt-0.5">
            Odometer Awal: <span className="font-mono text-white">{initialOdo.toLocaleString('id-ID')} KM</span>
          </p>
        </div>

        {errorMsg && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Odometer Akhir Saat Kembali ke Pool (KM) <span className="text-rose-400">*</span>
            </label>
            <input
              type="number"
              min={initialOdo}
              value={endOdometer}
              onChange={(e) => setEndOdometer(Number(e.target.value))}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-emerald-400 mt-1">
              Estimasi Jarak Tempuh: <span className="font-bold">{distance} KM</span>
            </p>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Pengisian BBM Tambahan (Liter Solar/Dex)
            </label>
            <input
              type="number"
              min={0}
              step={0.5}
              value={fuelLiters}
              onChange={(e) => setFuelLiters(Number(e.target.value))}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Total Biaya Bahan Bakar (IDR)
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              value={fuelCost}
              onChange={(e) => setFuelCost(Number(e.target.value))}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
            >
              Simpan &amp; Tandai Selesai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
