import React, { useState } from 'react';

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
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Monitoring Armada, Konsumsi BBM &amp; Jadwal Servis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Pelacakan efisiensi bahan bakar, pemeliharaan rutin dump truck &amp; light vehicle di area tambang
          </p>
        </div>

        <button
          onClick={() => setIsAddFuelOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-medium text-xs sm:text-sm border border-slate-700 transition-colors shrink-0"
        >
          Catat Pengisian BBM
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs">
        <button
          onClick={() => setActiveSubTab('fuel')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'fuel'
              ? 'border-slate-300 text-white font-medium'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Riwayat BBM</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
            {fuelLogs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('service')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'service'
              ? 'border-slate-300 text-white font-medium'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Jadwal Servis</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px]">
            {serviceSchedules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('vehicles')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeSubTab === 'vehicles'
              ? 'border-slate-300 text-white font-medium'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Inventaris 12 Armada</span>
        </button>
      </div>

      {/* Tab 1: Fuel Logs */}
      {activeSubTab === 'fuel' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] font-medium border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3.5">Tanggal Pengisian</th>
                  <th className="py-2.5 px-3.5">Kendaraan</th>
                  <th className="py-2.5 px-3.5">Odometer</th>
                  <th className="py-2.5 px-3.5">Volume (Liter)</th>
                  <th className="py-2.5 px-3.5">Total Biaya (IDR)</th>
                  <th className="py-2.5 px-3.5">Lokasi Pengisian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {fuelLogs.map((log) => {
                  const v = vehicleMap.get(log.vehicleId);
                  return (
                    <tr key={log.id} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 px-3.5 font-medium text-slate-200">
                        {formatDateTimeID(log.filledAt)}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="font-medium text-slate-200">{v?.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{v?.plateNumber}</div>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-300">
                        {log.odometer.toLocaleString('id-ID')} KM
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono text-slate-200 font-medium">
                          {log.liters}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500">Liter Solar</span>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-200 font-medium">
                        {formatCurrencyIDR(log.cost)}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-400">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {serviceSchedules.map((s) => {
            const v = vehicleMap.get(s.vehicleId);
            return (
              <div
                key={s.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {s.status === 'completed'
                      ? 'Selesai Dikerjakan'
                      : s.status === 'in_progress'
                      ? 'Sedang Dalam Servis'
                      : 'Terjadwal (Planned)'}
                  </span>
                  <span className="text-xs text-slate-400">
                    <span>{formatDateID(s.scheduledAt)}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-medium text-white text-sm">{s.serviceType}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {v?.name} ({v?.plateNumber})
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Estimasi Biaya:</span>
                    <p className="font-medium text-slate-200 font-mono mt-0.5">
                      {formatCurrencyIDR(s.costEst)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {s.status === 'planned' && (
                      <button
                        onClick={() => onUpdateServiceStatus(s.id, 'in_progress')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium"
                      >
                        Mulai Servis
                      </button>
                    )}
                    {s.status === 'in_progress' && (
                      <button
                        onClick={() => onUpdateServiceStatus(s.id, 'completed')}
                        className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-650 text-white border border-slate-600 text-xs font-medium"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {vehicles.map((v) => {
            const r = regionMap.get(v.regionId);
            return (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs space-y-2.5 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-850 text-slate-300 border border-slate-700/80">
                    {v.plateNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    {v.status === 'available' ? 'Siap' : v.status === 'in_use' ? 'Operasi' : 'Servis'}
                  </span>
                </div>

                <div>
                  <h3 className="font-medium text-white text-sm">{v.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{v.model}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kategori:</span>
                    <span className="text-slate-200">
                      {v.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kepemilikan:</span>
                    <span className="text-slate-200">
                      {v.ownership === 'owned' ? 'Milik Perusahaan' : `Sewa (${v.rentalCompany || 'Rentalindo'})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Odometer:</span>
                    <span className="font-mono text-slate-200">
                      {v.odometer.toLocaleString('id-ID')} KM
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Penempatan:</span>
                    <span className="text-slate-300 truncate max-w-[150px]">{r?.name}</span>
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-white">
              <span>Input Pengisian BBM Armada</span>
            </h3>

            <form onSubmit={handleSaveFuel} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Pilih Kendaraan
                </label>
                <select
                  value={fuelVehicleId}
                  onChange={(e) => setFuelVehicleId(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} - {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Volume Bahan Bakar (Liter Solar/Dex)
                </label>
                <input
                  type="number"
                  min={1}
                  value={fuelLiters}
                  onChange={(e) => setFuelLiters(Number(e.target.value))}
                  required
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Total Biaya Pengisian (IDR)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  value={fuelCost}
                  onChange={(e) => setFuelCost(Number(e.target.value))}
                  required
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Odometer Saat Pengisian (KM)
                </label>
                <input
                  type="number"
                  value={fuelOdometer}
                  onChange={(e) => setFuelOdometer(Number(e.target.value))}
                  required
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Lokasi / Stasiun Pengisian
                </label>
                <input
                  type="text"
                  value={fuelStation}
                  onChange={(e) => setFuelStation(e.target.value)}
                  required
                  className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="mt-5 flex items-center justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddFuelOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 font-medium text-xs transition-colors"
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
