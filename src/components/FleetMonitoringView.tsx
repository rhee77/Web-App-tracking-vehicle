import React, { useState } from 'react';
import {
  Fuel,
  Wrench,
  Truck,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Building2,
  DollarSign
} from 'lucide-react';
import type { Vehicle, FuelLog, ServiceSchedule, Region } from '../types/index.ts';
import { formatCurrencyIDR, formatDateTimeID, formatDateID } from '../utils/rules.ts';

interface FleetMonitoringViewProps {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  serviceSchedules: ServiceSchedule[];
  regions: Region[];
  onAddFuelLog: (log: FuelLog) => void;
  onUpdateServiceStatus: (serviceId: string, status: 'in_progress' | 'completed') => void;
}

export const FleetMonitoringView: React.FC<FleetMonitoringViewProps> = ({
  vehicles,
  fuelLogs,
  serviceSchedules,
  regions,
  onAddFuelLog,
  onUpdateServiceStatus
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'fuel' | 'service' | 'vehicles'>('fuel');
  const [isAddFuelOpen, setIsAddFuelOpen] = useState(false);

  // New Fuel state
  const [fuelVehicleId, setFuelVehicleId] = useState(vehicles[0]?.id || '');
  const [fuelLiters, setFuelLiters] = useState(50);
  const [fuelCost, setFuelCost] = useState(750000);
  const [fuelStation, setFuelStation] = useState('Fuel Dispenser Internal Pool');
  const [fuelOdometer, setFuelOdometer] = useState(48500);

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const regionMap = new Map(regions.map((r) => [r.id, r]));

  const handleSaveFuel = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: FuelLog = {
      id: `fl-${Date.now()}`,
      vehicleId: fuelVehicleId,
      liters: Number(fuelLiters),
      cost: Number(fuelCost),
      filledAt: new Date().toISOString(),
      odometer: Number(fuelOdometer),
      fuelStation
    };
    onAddFuelLog(newLog);
    setIsAddFuelOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Fuel className="w-6 h-6 text-amber-500" />
            <span>Monitoring Armada, Konsumsi BBM &amp; Jadwal Servis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pelacakan efisiensi bahan bakar, pemeliharaan rutin dump truck &amp; light vehicle di area tambang
          </p>
        </div>

        <button
          onClick={() => setIsAddFuelOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Pengisian BBM</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('fuel')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'fuel'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Fuel className="w-4 h-4" />
          <span>Riwayat Konsumsi BBM ({fuelLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('service')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'service'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Jadwal Servis &amp; Perbaikan ({serviceSchedules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('vehicles')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'vehicles'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Inventaris 12 Armada Tambang</span>
        </button>
      </div>

      {/* Tab 1: Fuel Logs */}
      {activeSubTab === 'fuel' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Tanggal Pengisian</th>
                  <th className="py-3 px-4">Kendaraan</th>
                  <th className="py-3 px-4">Odometer</th>
                  <th className="py-3 px-4">Volume (Liter)</th>
                  <th className="py-3 px-4">Total Biaya (IDR)</th>
                  <th className="py-3 px-4">Lokasi Pengisian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {fuelLogs.map((log) => {
                  const v = vehicleMap.get(log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium text-white">
                        {formatDateTimeID(log.filledAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-200">{v?.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{v?.plateNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {log.odometer.toLocaleString('id-ID')} KM
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-amber-400 font-mono text-sm">
                          {log.liters}
                        </span>{' '}
                        <span className="text-[10px] text-slate-400">Liter Solar</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-100">
                        {formatCurrencyIDR(log.cost)}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {log.fuelStation}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Service Schedules */}
      {activeSubTab === 'service' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {serviceSchedules.map((s) => {
            const v = vehicleMap.get(s.vehicleId);
            return (
              <div
                key={s.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      s.status === 'completed'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : s.status === 'in_progress'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {s.status === 'completed'
                      ? 'Selesai Dikerjakan'
                      : s.status === 'in_progress'
                      ? 'Sedang Dalam Servis'
                      : 'Terjadwal (Planned)'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>{formatDateID(s.scheduledAt)}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{s.serviceType}</h3>
                  <p className="text-xs text-amber-400 font-medium mt-0.5">
                    {v?.name} ({v?.plateNumber})
                  </p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Estimasi Biaya:</span>
                    <p className="font-extrabold text-white font-mono mt-0.5">
                      {formatCurrencyIDR(s.costEst)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {s.status === 'planned' && (
                      <button
                        onClick={() => onUpdateServiceStatus(s.id, 'in_progress')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                      >
                        Mulai Servis
                      </button>
                    )}
                    {s.status === 'in_progress' && (
                      <button
                        onClick={() => onUpdateServiceStatus(s.id, 'completed')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Vehicles Master List */}
      {activeSubTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const r = regionMap.get(v.regionId);
            return (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                    {v.plateNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      v.status === 'available'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : v.status === 'in_use'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {v.status === 'available' ? 'Siap' : v.status === 'in_use' ? 'Operasi' : 'Servis'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{v.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{v.model}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kategori:</span>
                    <span className="font-semibold text-white">
                      {v.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kepemilikan:</span>
                    <span className="font-semibold text-white">
                      {v.ownership === 'owned' ? 'Milik Perusahaan' : `Sewa (${v.rentalCompany || 'Rentalindo'})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Odometer:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {v.odometer.toLocaleString('id-ID')} KM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Penempatan:</span>
                    <span className="text-emerald-400 font-medium truncate max-w-[170px]">
                      {r?.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Fuel Modal */}
      {isAddFuelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Fuel className="w-5 h-5 text-amber-400" />
              <span>Input Pengisian BBM Armada</span>
            </h3>

            <form onSubmit={handleSaveFuel} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Pilih Kendaraan
                </label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Volume Bahan Bakar (Liter Solar/Dex)
                </label>
                <input
                  type="number"
                  min={1}
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Total Biaya Pengisian (IDR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={fuelCost}
                  onChange={(e) => setFuelCost(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Odometer Saat Pengisian (KM)
                </label>
                <input
                  type="number"
                  value={fuelOdometer}
                  onChange={(e) => setFuelOdometer(Number(e.target.value))}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Lokasi / Stasiun Pengisian
                </label>
                <input
                  type="text"
                  value={fuelStation}
                  onChange={(e) => setFuelStation(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="mt-5 flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFuelOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Simpan Log BBM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
