import * as XLSX from 'xlsx';
import type { Booking, Vehicle, Driver, Region } from '../types/index.ts';
import { formatDateTimeID, formatCurrencyIDR } from './rules.ts';

export function exportBookingsToExcel(
  bookings: Booking[],
  vehicles: Vehicle[],
  drivers: Driver[],
  regions: Region[],
  filename = 'Laporan_Pemesanan_Kendaraan_Tambang.xlsx'
) {
  // Map data to clean tabular format
  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const driverMap = new Map(drivers.map((d) => [d.id, d]));
  const regionMap = new Map(regions.map((r) => [r.id, r]));

  const rows = bookings.map((b, index) => {
    const v = vehicleMap.get(b.vehicleId);
    const d = driverMap.get(b.driverId);
    const r = regionMap.get(b.regionId);

    const app1 = b.approvals.find((a) => a.level === 1);
    const app2 = b.approvals.find((a) => a.level === 2);

    const distance =
      b.endOdometer && b.startOdometer
        ? Math.max(0, b.endOdometer - b.startOdometer)
        : 0;

    return {
      'No': index + 1,
      'Kode Booking': b.code,
      'Tanggal Input': formatDateTimeID(b.createdAt),
      'Pemohon': b.createdByName,
      'Departemen': b.department,
      'Nama Kendaraan': v?.name || '-',
      'No. Polisi': v?.plateNumber || '-',
      'Kategori': v?.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang',
      'Kepemilikan': v?.ownership === 'owned' ? 'Milik Perusahaan' : `Sewa (${v?.rentalCompany || 'Rentalindo'})`,
      'Driver Ditugaskan': d?.name || '-',
      'No. HP Driver': d?.phone || '-',
      'Wilayah Operasional': r?.name || '-',
      'Tujuan': b.destination,
      'Keperluan': b.purpose,
      'Jadwal Mulai': formatDateTimeID(b.startAt),
      'Jadwal Selesai': formatDateTimeID(b.endAt),
      'Status Pemesanan': b.status.toUpperCase(),
      'Approver L1 (Atasan)': app1 ? `${app1.approverName} (${app1.status.toUpperCase()})` : '-',
      'Catatan L1': app1?.note || '-',
      'Approver L2 (Pool/Logistik)': app2 ? `${app2.approverName} (${app2.status.toUpperCase()})` : '-',
      'Catatan L2': app2?.note || '-',
      'Odometer Awal (KM)': b.startOdometer ?? '-',
      'Odometer Akhir (KM)': b.endOdometer ?? '-',
      'Jarak Tempuh (KM)': distance > 0 ? distance : '-',
      'BBM (Liter)': b.fuelFilledLiters ?? '-',
      'Biaya BBM': b.fuelCost ? formatCurrencyIDR(b.fuelCost) : '-'
    };
  });

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Main Data
  const wsMain = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, wsMain, 'Data Pemesanan');

  // Sheet 2: Summary metrics
  const totalBookings = bookings.length;
  const approvedBookings = bookings.filter((b) => b.status === 'approved' || b.status === 'completed').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const rejectedBookings = bookings.filter((b) => b.status === 'rejected').length;
  const totalFuelLiters = bookings.reduce((acc, b) => acc + (b.fuelFilledLiters || 0), 0);
  const totalFuelCost = bookings.reduce((acc, b) => acc + (b.fuelCost || 0), 0);
  const totalDistance = bookings.reduce(
    (acc, b) => acc + (b.endOdometer && b.startOdometer ? Math.max(0, b.endOdometer - b.startOdometer) : 0),
    0
  );

  const summaryData = [
    { 'Indikator': 'Total Permohonan Pemesanan', 'Nilai': totalBookings },
    { 'Indikator': 'Pemesanan Disetujui / Selesai', 'Nilai': approvedBookings },
    { 'Indikator': 'Pemesanan Sedang Menunggu Persetujuan', 'Nilai': pendingBookings },
    { 'Indikator': 'Pemesanan Ditolak', 'Nilai': rejectedBookings },
    { 'Indikator': 'Total Konsumsi BBM Tercatat (Liter)', 'Nilai': totalFuelLiters },
    { 'Indikator': 'Total Biaya BBM (IDR)', 'Nilai': formatCurrencyIDR(totalFuelCost) },
    { 'Indikator': 'Total Akumulasi Jarak Tempuh (KM)', 'Nilai': `${totalDistance.toLocaleString('id-ID')} KM` },
    { 'Indikator': 'Waktu Laporan Di-generate', 'Nilai': new Date().toLocaleString('id-ID') }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

  // Sheet 3: Fleet master
  const fleetData = vehicles.map((v, i) => ({
    'No': i + 1,
    'Nama Kendaraan': v.name,
    'Model': v.model,
    'No. Polisi': v.plateNumber,
    'Kategori': v.category === 'people' ? 'Angkutan Orang' : 'Angkutan Barang',
    'Kepemilikan': v.ownership === 'owned' ? 'Milik Sendiri' : 'Sewa (Rental)',
    'Perusahaan Rental': v.rentalCompany || '-',
    'Odometer Saat Ini (KM)': v.odometer,
    'Kapasitas Tangki (L)': v.fuelCapacity,
    'Status Operasional': v.status.toUpperCase(),
    'Penempatan Lokasi': regionMap.get(v.regionId)?.name || '-'
  }));
  const wsFleet = XLSX.utils.json_to_sheet(fleetData);
  XLSX.utils.book_append_sheet(wb, wsFleet, 'Master Armada');

  // Trigger browser download
  XLSX.writeFile(wb, filename);
}
