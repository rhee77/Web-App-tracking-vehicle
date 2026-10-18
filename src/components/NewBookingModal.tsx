import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import type { Booking, Vehicle, Driver, Region, User } from '../types/index.ts';
import { checkBookingConflicts, formatDateTimeID } from '../utils/rules.ts';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newBooking: Booking) => void;
  existingBookings: Booking[];
  vehicles: Vehicle[];
  drivers: Driver[];
  regions: Region[];
  approvers: User[];
  currentUser: User;
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  existingBookings,
  vehicles,
  drivers,
  regions,
  approvers,
  currentUser
}) => {
  // Form state
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [regionId, setRegionId] = useState(regions[2]?.id || regions[0]?.id || '');
  const [department, setDepartment] = useState('Divisi Operasional & Hauling Tambang');

  // Dates default: tomorrow 08:00 to 17:00
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(tomorrowStr);
  const [startTime, setStartTime] = useState('08:00');
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [endTime, setEndTime] = useState('17:00');

  const [destination, setDestination] = useState('');
  const [purpose, setPurpose] = useState('');

  // 2 Approvers
  const approversL1 = approvers.filter((a) => a.approvalLevel === 1);
  const approversL2 = approvers.filter((a) => a.approvalLevel === 2);

  const [approverL1Id, setApproverL1Id] = useState(approversL1[0]?.id || approvers[0]?.id || '');
  const [approverL2Id, setApproverL2Id] = useState(approversL2[0]?.id || approvers[1]?.id || '');

  const [errorMsg, setErrorMsg] = useState('');

  // ISO dates
  const startAt = `${startDate}T${startTime}:00Z`;
  const endAt = `${endDate}T${endTime}:00Z`;

  // Real-time conflict checking
  const conflictResult = useMemo(() => {
    if (!vehicleId || !driverId || !startAt || !endAt) {
      return { hasConflict: false };
    }
    return checkBookingConflicts(existingBookings, vehicleId, driverId, startAt, endAt);
  }, [existingBookings, vehicleId, driverId, startAt, endAt]);

  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const selectedDriver = drivers.find((d) => d.id === driverId);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!destination.trim()) {
      setErrorMsg('Mohon isi lokasi tujuan pemakaian kendaraan.');
      return;
    }
    if (!purpose.trim()) {
      setErrorMsg('Mohon isi keperluan atau alasan penggunaan kendaraan.');
      return;
    }

    const sTime = new Date(startAt).getTime();
    const eTime = new Date(endAt).getTime();
    if (eTime <= sTime) {
      setErrorMsg('Jadwal selesai harus lebih lambat dari jadwal mulai.');
      return;
    }

    if (conflictResult.hasConflict) {
      setErrorMsg(conflictResult.message || 'Jadwal bentrok dengan pemesanan lain.');
      return;
    }

    if (approverL1Id === approverL2Id) {
      setErrorMsg('Approver Level 1 dan Level 2 harus orang yang berbeda.');
      return;
    }

    const appr1User = approvers.find((u) => u.id === approverL1Id);
    const appr2User = approvers.find((u) => u.id === approverL2Id);

    const bookingCode = `BKG-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(
      existingBookings.length + 1
    ).padStart(3, '0')}`;

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      code: bookingCode,
      vehicleId,
      driverId,
      createdById: currentUser.id,
      createdByName: `${currentUser.name} (${currentUser.role === 'admin' ? 'Admin' : 'Staff'})`,
      department,
      startAt,
      endAt,
      destination: destination.trim(),
      purpose: purpose.trim(),
      regionId,
      status: 'pending',
      startOdometer: selectedVehicle?.odometer,
      createdAt: new Date().toISOString(),
      approvals: [
        {
          id: `app-${Date.now()}-1`,
          bookingId: `bkg-${Date.now()}`,
          approverId: approverL1Id,
          approverName: appr1User?.name || 'Approver Level 1',
          approverPosition: appr1User?.position || 'Atasan Langsung',
          level: 1,
          status: 'pending' // Level 1 is pending immediately
        },
        {
          id: `app-${Date.now()}-2`,
          bookingId: `bkg-${Date.now()}`,
          approverId: approverL2Id,
          approverName: appr2User?.name || 'Approver Level 2',
          approverPosition: appr2User?.position || 'Kepala Pool & Logistik',
          level: 2,
          status: 'waiting' // Level 2 waits until Level 1 approves!
        }
      ]
    };

    onSubmit(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 shadow-xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-white">
              Buat Formulir Pemesanan Kendaraan
            </h2>
            <p className="text-xs text-slate-400">
              Persetujuan berjenjang minimal 2 level (Atasan Langsung &amp; Kepala Pool)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-lg bg-slate-850 border border-slate-700 text-rose-300 text-xs">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real-time Conflict Warning */}
        {conflictResult.hasConflict && (
          <div className="mt-3 p-3 rounded-lg bg-slate-850 border border-slate-700 text-slate-300 text-xs">
            <span className="font-semibold text-white">Peringatan Jadwal Bentrok:</span>{' '}
            {conflictResult.message}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Departemen & Wilayah */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Departemen Pemohon <span className="text-slate-500">*</span>
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
                className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Wilayah Operasional / Tambang <span className="text-slate-500">*</span>
              </label>
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Armada & Driver Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Pilih Kendaraan Armada <span className="text-slate-500">*</span>
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    [{v.plateNumber}] {v.name} ({v.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang'}) - {v.ownership === 'owned' ? 'Milik' : 'Sewa'}
                  </option>
                ))}
              </select>
              {selectedVehicle && (
                <div className="mt-1 text-[11px] text-slate-400">
                  Status: <span className="font-medium text-slate-300 uppercase">{selectedVehicle.status}</span> • Odo: {selectedVehicle.odometer.toLocaleString('id-ID')} KM
                </div>
              )}
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Pilih Driver / Pengemudi <span className="text-slate-500">*</span>
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.licenseType}) - {d.status === 'available' ? 'Siap' : 'Bertugas'}
                  </option>
                ))}
              </select>
              {selectedDriver && (
                <div className="mt-1 text-[11px] text-slate-400">
                  Kontak: <span className="font-mono text-slate-300">{selectedDriver.phone}</span> ({selectedDriver.licenseNumber})
                </div>
              )}
            </div>
          </div>

          {/* Schedule Range */}
          <div className="p-3 rounded-lg bg-slate-850/60 border border-slate-800 space-y-2.5">
            <div className="text-slate-300 font-medium">
              <span>Rentang Waktu Pemakaian Kendaraan</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Mulai Operasional
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-24 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Selesai Operasional
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="flex-1 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-24 bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-white focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Destination & Purpose */}
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Lokasi Tujuan Spesifik <span className="text-slate-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pit 4 Blok Pomalaa Kolaka / Jetty Pelabuhan Muat Morowali"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Keperluan Penggunaan Kendaraan <span className="text-slate-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Jelaskan kebutuhan operasional (misal: pengangkutan ore nikel kadar 1.8%, mobilisasi regu geologi, inspeksi K3 safety, dll.)"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                className="w-full bg-slate-850 border border-slate-700/80 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
              />
            </div>
          </div>

          {/* 2-Level Approvers Configuration */}
          <div className="p-3 rounded-lg bg-slate-850/60 border border-slate-800 space-y-2.5">
            <div className="text-slate-300 font-medium">
              <span>Penentuan Pihak yang Menyetujui (Minimal 2 Level)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Approver Level 1 (Atasan Langsung) <span className="text-slate-500">*</span>
                </label>
                <select
                  value={approverL1Id}
                  onChange={(e) => setApproverL1Id(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
                >
                  {approvers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.position})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Memvalidasi relevansi tugas &amp; urgensi operasional.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 text-[11px] mb-1">
                  Approver Level 2 (Kepala Pool / Logistik) <span className="text-slate-500">*</span>
                </label>
                <select
                  value={approverL2Id}
                  onChange={(e) => setApproverL2Id(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-slate-500"
                >
                  {approvers.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.position})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  Memvalidasi alokasi unit pool, BBM, dan ketersediaan driver.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={conflictResult.hasConflict}
              className={`px-4 py-1.5 rounded-lg font-medium transition-all text-xs ${
                conflictResult.hasConflict
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
                  : 'bg-white hover:bg-slate-100 text-slate-900 shadow-sm'
              }`}
            >
              Kirim Pengajuan Pemesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
