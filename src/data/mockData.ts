import type {
  Region,
  Vehicle,
  Driver,
  User,
  Booking,
  FuelLog,
  ServiceSchedule,
  ActivityLog
} from '../types/index.ts';

export const INITIAL_REGIONS: Region[] = [
  {
    id: 'reg-ho',
    name: 'Kantor Pusat Makassar',
    type: 'head_office',
    location: 'Makassar, Sulawesi Selatan',
    code: 'KP-MKS'
  },
  {
    id: 'reg-branch',
    name: 'Kantor Cabang Kendari',
    type: 'branch',
    location: 'Kendari, Sulawesi Tenggara',
    code: 'KC-KDI'
  },
  {
    id: 'reg-mine-1',
    name: 'Tambang Kolaka (Blok Pomalaa)',
    type: 'mine',
    location: 'Kolaka, Sulawesi Tenggara',
    code: 'TB-KLK'
  },
  {
    id: 'reg-mine-2',
    name: 'Tambang Morowali (Blok Bahodopi)',
    type: 'mine',
    location: 'Morowali, Sulawesi Tengah',
    code: 'TB-MRW'
  },
  {
    id: 'reg-mine-3',
    name: 'Tambang Sorowako (Blok Petea)',
    type: 'mine',
    location: 'Luwu Timur, Sulawesi Selatan',
    code: 'TB-SRW'
  },
  {
    id: 'reg-mine-4',
    name: 'Tambang Konawe Utara (Blok Mandiodo)',
    type: 'mine',
    location: 'Konawe Utara, Sulawesi Tenggara',
    code: 'TB-KNU'
  },
  {
    id: 'reg-mine-5',
    name: 'Tambang Halmahera Timur (Blok Buli)',
    type: 'mine',
    location: 'Halmahera Timur, Maluku Utara',
    code: 'TB-HLM'
  },
  {
    id: 'reg-mine-6',
    name: 'Tambang Morowali Utara (Blok Petasia)',
    type: 'mine',
    location: 'Morowali Utara, Sulawesi Tengah',
    code: 'TB-MRU'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Budi Pratama, S.T.',
    username: 'admin',
    email: 'admin.pool@sekawan-nikel.co.id',
    role: 'admin',
    position: 'Fleet & Pool Administrator',
    regionId: 'reg-ho',
    avatar: 'BP'
  },
  {
    id: 'usr-appr1',
    name: 'Ir. Hendra Gunawan',
    username: 'approver1',
    email: 'hendra.gunawan@sekawan-nikel.co.id',
    role: 'approver',
    approvalLevel: 1,
    position: 'Kepala Divisi Operasional Tambang (Approver L1)',
    regionId: 'reg-mine-1',
    avatar: 'HG'
  },
  {
    id: 'usr-appr2',
    name: 'Bambang Soedirjo, M.T.',
    username: 'approver2',
    email: 'bambang.soedirjo@sekawan-nikel.co.id',
    role: 'approver',
    approvalLevel: 2,
    position: 'General Manager Pool & Logistik Tambang (Approver L2)',
    regionId: 'reg-ho',
    avatar: 'BS'
  }
];

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    plateNumber: 'DD 8421 MN',
    name: 'Toyota Hilux 4x4 Double Cabin E',
    model: 'Hilux D-Cab 2.4 V 4x4',
    category: 'people',
    ownership: 'owned',
    regionId: 'reg-mine-1',
    odometer: 48250,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 80,
    seatCapacity: 5
  },
  {
    id: 'veh-2',
    plateNumber: 'DT 9012 NA',
    name: 'Mitsubishi Triton HD-X 4WD',
    model: 'Triton Single/Double Cab 4x4 Site Spec',
    category: 'people',
    ownership: 'owned',
    regionId: 'reg-mine-2',
    odometer: 32410,
    status: 'in_use',
    fuelType: 'Solar / Dex',
    fuelCapacity: 75,
    seatCapacity: 5
  },
  {
    id: 'veh-3',
    plateNumber: 'DT 7145 NK',
    name: 'Toyota HiAce Commuter 16 Seat',
    model: 'HiAce Commuter 2.5 M/T Bus Karyawan',
    category: 'people',
    ownership: 'owned',
    regionId: 'reg-mine-3',
    odometer: 64200,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 70,
    seatCapacity: 16
  },
  {
    id: 'veh-4',
    plateNumber: 'B 9234 XKA',
    name: 'Isuzu D-Max 4x4 Heavy Duty',
    model: 'D-Max Rodeo 1.9 Ddi BluePower',
    category: 'people',
    ownership: 'rented',
    rentalCompany: 'PT Rentalindo Mandiri Nusantara',
    regionId: 'reg-mine-4',
    odometer: 28150,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 76,
    seatCapacity: 5
  },
  {
    id: 'veh-5',
    plateNumber: 'B 9811 MTR',
    name: 'Mitsubishi Pajero Sport 4x4 Dakar',
    model: 'Pajero Sport 4x4 Site VIP Inspection',
    category: 'people',
    ownership: 'rented',
    rentalCompany: 'PT Trans Nusantara Perkasa',
    regionId: 'reg-ho',
    odometer: 19800,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 68,
    seatCapacity: 7
  },
  {
    id: 'veh-6',
    plateNumber: 'DD 7701 TN',
    name: 'Hino Ranger 500 Dump Tipper FM 260 JD',
    model: 'Hino 500 Series 6x4 260PS Ore Tipper',
    category: 'goods',
    ownership: 'owned',
    regionId: 'reg-mine-1',
    odometer: 78900,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 200,
    cargoCapacityTons: 20
  },
  {
    id: 'veh-7',
    plateNumber: 'DT 8820 TR',
    name: 'Isuzu Giga FVR 34 P Heavy Hauler',
    model: 'Giga 6-Wheel Heavy Nickel Cargo',
    category: 'goods',
    ownership: 'owned',
    regionId: 'reg-mine-2',
    odometer: 54120,
    status: 'in_use',
    fuelType: 'Solar / Dex',
    fuelCapacity: 200,
    cargoCapacityTons: 16
  },
  {
    id: 'veh-8',
    plateNumber: 'DT 6321 LG',
    name: 'Mitsubishi Fuso Canter FE 74 HD Logistik',
    model: 'Colt Diesel Canter 125 PS Box Logistik',
    category: 'goods',
    ownership: 'owned',
    regionId: 'reg-branch',
    odometer: 89400,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 100,
    cargoCapacityTons: 8
  },
  {
    id: 'veh-9',
    plateNumber: 'B 9043 ORN',
    name: 'Hino Profia 700 Ore Hauler 8x4',
    model: 'Hino 700 Heavy Mining 30 Ton Dump',
    category: 'goods',
    ownership: 'rented',
    rentalCompany: 'PT Morowali Trans Logistik',
    regionId: 'reg-mine-2',
    odometer: 42100,
    status: 'maintenance',
    fuelType: 'Solar / Dex',
    fuelCapacity: 300,
    cargoCapacityTons: 32
  },
  {
    id: 'veh-10',
    plateNumber: 'DG 7122 NK',
    name: 'Toyota Fortuner 4x4 Safety Patrol',
    model: 'Fortuner 2.8 VRZ 4x4 HSE Rescue',
    category: 'people',
    ownership: 'owned',
    regionId: 'reg-mine-5',
    odometer: 31050,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 80,
    seatCapacity: 7
  },
  {
    id: 'veh-11',
    plateNumber: 'DT 8301 CB',
    name: 'Isuzu Elf NQR 71 Microbus Crew Shift',
    model: 'Elf NQR 71 29 Seat Mining Bus',
    category: 'people',
    ownership: 'rented',
    rentalCompany: 'PT Sulawesi Rental Armada',
    regionId: 'reg-mine-6',
    odometer: 45600,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 100,
    seatCapacity: 29
  },
  {
    id: 'veh-12',
    plateNumber: 'DD 9912 HG',
    name: 'Scania P380 Heavy Mining Tipper',
    model: 'Scania P380 XT 6x4 Nickel Ore Body',
    category: 'goods',
    ownership: 'owned',
    regionId: 'reg-mine-3',
    odometer: 61500,
    status: 'available',
    fuelType: 'Solar / Dex',
    fuelCapacity: 350,
    cargoCapacityTons: 35
  }
];

export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Agus Salim S.',
    phone: '0812-4411-9821',
    licenseNumber: 'SIM-A-8712903',
    licenseType: 'SIM A',
    regionId: 'reg-mine-1',
    isActive: true,
    status: 'available'
  },
  {
    id: 'drv-2',
    name: 'Rahmat Hidayat',
    phone: '0821-9033-1122',
    licenseNumber: 'SIM-B2-9901452',
    licenseType: 'SIM B2 Umum',
    regionId: 'reg-mine-2',
    isActive: true,
    status: 'on_duty'
  },
  {
    id: 'drv-3',
    name: 'Dedi Kurniawan',
    phone: '0852-7711-4455',
    licenseNumber: 'SIM-A-7782190',
    licenseType: 'SIM A',
    regionId: 'reg-mine-3',
    isActive: true,
    status: 'available'
  },
  {
    id: 'drv-4',
    name: 'Supardi Mansyur',
    phone: '0813-8822-6633',
    licenseNumber: 'SIM-B2-8871201',
    licenseType: 'SIM B2 Umum',
    regionId: 'reg-mine-1',
    isActive: true,
    status: 'available'
  },
  {
    id: 'drv-5',
    name: 'Faisal Basri',
    phone: '0822-5500-1199',
    licenseNumber: 'SIM-B1-6623019',
    licenseType: 'SIM B1',
    regionId: 'reg-branch',
    isActive: true,
    status: 'available'
  },
  {
    id: 'drv-6',
    name: 'Yanto Wahyudi',
    phone: '0811-9021-3344',
    licenseNumber: 'SIM-A-9912044',
    licenseType: 'SIM A',
    regionId: 'reg-ho',
    isActive: true,
    status: 'available'
  },
  {
    id: 'drv-7',
    name: 'Mansur Efendi',
    phone: '0853-2211-7788',
    licenseNumber: 'SIM-B2-5561023',
    licenseType: 'SIM B2 Umum',
    regionId: 'reg-mine-2',
    isActive: true,
    status: 'on_duty'
  },
  {
    id: 'drv-8',
    name: 'Lukman Hakim',
    phone: '0812-3344-5566',
    licenseNumber: 'SIM-A-8821904',
    licenseType: 'SIM A',
    regionId: 'reg-mine-4',
    isActive: true,
    status: 'available'
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-001',
    code: 'BKG-2026-10-001',
    vehicleId: 'veh-1',
    driverId: 'drv-1',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'Geology & Exploration',
    startAt: '2026-10-10T08:00:00Z',
    endAt: '2026-10-10T17:00:00Z',
    destination: 'Site Pit 3 Blok Pomalaa Kolaka',
    purpose: 'Inspeksi Titik Pengeboran Bijih Nikel dan Pengambilan Sampel Core',
    regionId: 'reg-mine-1',
    status: 'completed',
    startOdometer: 47900,
    endOdometer: 48250,
    fuelFilledLiters: 42,
    fuelCost: 630000,
    createdAt: '2026-10-09T08:30:00Z',
    approvals: [
      {
        id: 'app-001-1',
        bookingId: 'bkg-001',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'approved',
        note: 'Disetujui. Pastikan perlengkapan APD dan GPS tambang siap.',
        actedAt: '2026-10-09T09:15:00Z'
      },
      {
        id: 'app-001-2',
        bookingId: 'bkg-001',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'approved',
        note: 'Disetujui oleh Pool. Kendaraan telah di-check radiokomunikasi.',
        actedAt: '2026-10-09T10:00:00Z'
      }
    ]
  },
  {
    id: 'bkg-002',
    code: 'BKG-2026-10-002',
    vehicleId: 'veh-2',
    driverId: 'drv-2',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'Mine Engineering',
    startAt: '2026-10-16T07:00:00Z',
    endAt: '2026-10-17T20:00:00Z',
    destination: 'Jetty Pelabuhan Muat Morowali - Smelter IMIP',
    purpose: 'Monitoring Jalur Hauling dan Koordinasi Pengapalan Nickel Pig Iron',
    regionId: 'reg-mine-2',
    status: 'approved',
    startOdometer: 32200,
    createdAt: '2026-10-15T11:00:00Z',
    approvals: [
      {
        id: 'app-002-1',
        bookingId: 'bkg-002',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'approved',
        note: 'Disetujui untuk pengawalan tim surveyor.',
        actedAt: '2026-10-15T11:45:00Z'
      },
      {
        id: 'app-002-2',
        bookingId: 'bkg-002',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'approved',
        note: 'Approved. Kendaraan dalam kondisi prima.',
        actedAt: '2026-10-15T13:20:00Z'
      }
    ]
  },
  {
    id: 'bkg-003',
    code: 'BKG-2026-10-003',
    vehicleId: 'veh-7',
    driverId: 'drv-7',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'Logistik & Supply Chain',
    startAt: '2026-10-17T06:00:00Z',
    endAt: '2026-10-17T18:00:00Z',
    destination: 'Gudang Bahan Peledak & Spareparts Pit Morowali',
    purpose: 'Pengangkutan Suku Cadang Excavator Komatsu PC2000 & Oli Pelumas Drum',
    regionId: 'reg-mine-2',
    status: 'approved',
    startOdometer: 54000,
    createdAt: '2026-10-15T14:30:00Z',
    approvals: [
      {
        id: 'app-003-1',
        bookingId: 'bkg-003',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'approved',
        note: 'Suku cadang sangat urgen untuk excavator yang standby.',
        actedAt: '2026-10-15T15:00:00Z'
      },
      {
        id: 'app-003-2',
        bookingId: 'bkg-003',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'approved',
        note: 'Disetujui. Pastikan lashing dan pengikatan muatan aman.',
        actedAt: '2026-10-15T16:10:00Z'
      }
    ]
  },
  {
    id: 'bkg-004',
    code: 'BKG-2026-10-004',
    vehicleId: 'veh-3',
    driverId: 'drv-3',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'HR & GA Tambang Sorowako',
    startAt: '2026-10-18T07:30:00Z',
    endAt: '2026-10-18T16:30:00Z',
    destination: 'Mess Karyawan Blok Petea ke Basecamp Utama',
    purpose: 'Mobilisasi Antar Shift Regu Operator Tambang Sorowako (14 Personel)',
    regionId: 'reg-mine-3',
    status: 'pending',
    createdAt: '2026-10-16T10:00:00Z',
    approvals: [
      {
        id: 'app-004-1',
        bookingId: 'bkg-004',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'approved',
        note: 'Shift change mingguan telah diverifikasi.',
        actedAt: '2026-10-16T11:00:00Z'
      },
      {
        id: 'app-004-2',
        bookingId: 'bkg-004',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'pending',
        note: undefined
      }
    ]
  },
  {
    id: 'bkg-005',
    code: 'BKG-2026-10-005',
    vehicleId: 'veh-4',
    driverId: 'drv-8',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'Health, Safety & Environment (HSE)',
    startAt: '2026-10-19T08:00:00Z',
    endAt: '2026-10-19T17:00:00Z',
    destination: 'Pit Disposal & Sediment Pond Blok Mandiodo',
    purpose: 'Audit Kepatuhan Lingkungan & Uji Kualitas Air Limpasan Tambang',
    regionId: 'reg-mine-4',
    status: 'pending',
    createdAt: '2026-10-16T14:00:00Z',
    approvals: [
      {
        id: 'app-005-1',
        bookingId: 'bkg-005',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'pending',
        note: undefined
      },
      {
        id: 'app-005-2',
        bookingId: 'bkg-005',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'waiting',
        note: undefined
      }
    ]
  },
  {
    id: 'bkg-006',
    code: 'BKG-2026-10-006',
    vehicleId: 'veh-5',
    driverId: 'drv-6',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'Corporate Secretariat & Legal',
    startAt: '2026-10-12T09:00:00Z',
    endAt: '2026-10-12T15:00:00Z',
    destination: 'Dinas ESDM & Kantor Gubernur Sulawesi Selatan',
    purpose: 'Kunjungan Kerja Pembaruan Dokumen RKAB Tambang Nikel',
    regionId: 'reg-ho',
    status: 'rejected',
    createdAt: '2026-10-11T09:00:00Z',
    approvals: [
      {
        id: 'app-006-1',
        bookingId: 'bkg-006',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'rejected',
        note: 'Ditolak: Jadwal bentrok dengan agenda direksi, disarankan menggunakan taksi operasional.',
        actedAt: '2026-10-11T10:30:00Z'
      },
      {
        id: 'app-006-2',
        bookingId: 'bkg-006',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'waiting'
      }
    ]
  },
  {
    id: 'bkg-007',
    code: 'BKG-2026-09-021',
    vehicleId: 'veh-6',
    driverId: 'drv-4',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'Produksi Hauling Kolaka',
    startAt: '2026-09-22T07:00:00Z',
    endAt: '2026-09-22T19:00:00Z',
    destination: 'Stockpile Pelabuhan Pomalaa',
    purpose: 'Pengangkutan Bijih Nikel Kadar Tinggi (Saprolit 1.8%) ke Kapal Tongkang',
    regionId: 'reg-mine-1',
    status: 'completed',
    startOdometer: 78500,
    endOdometer: 78900,
    fuelFilledLiters: 95,
    fuelCost: 1425000,
    createdAt: '2026-09-21T08:00:00Z',
    approvals: [
      {
        id: 'app-007-1',
        bookingId: 'bkg-007',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'approved',
        note: 'Disetujui target muatan 250 ton per shift.',
        actedAt: '2026-09-21T08:30:00Z'
      },
      {
        id: 'app-007-2',
        bookingId: 'bkg-007',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'approved',
        note: 'Approved oleh Pool Kendaraan Berat.',
        actedAt: '2026-09-21T09:00:00Z'
      }
    ]
  },
  {
    id: 'bkg-008',
    code: 'BKG-2026-08-015',
    vehicleId: 'veh-10',
    driverId: 'drv-1',
    createdById: 'usr-admin',
    createdByName: 'Budi Pratama (Admin)',
    department: 'Safety & Rescue',
    startAt: '2026-08-15T08:00:00Z',
    endAt: '2026-08-15T17:00:00Z',
    destination: 'Blok Buli Halmahera Timur Area Barat',
    purpose: 'Simulasi Tanggap Darurat Bencana Banjir & Longsor Lereng Tambang',
    regionId: 'reg-mine-5',
    status: 'completed',
    startOdometer: 30800,
    endOdometer: 31050,
    fuelFilledLiters: 35,
    fuelCost: 525000,
    createdAt: '2026-08-14T10:00:00Z',
    approvals: [
      {
        id: 'app-008-1',
        bookingId: 'bkg-008',
        approverId: 'usr-appr1',
        approverName: 'Ir. Hendra Gunawan',
        approverPosition: 'Kepala Divisi Operasional (L1)',
        level: 1,
        status: 'approved',
        actedAt: '2026-08-14T11:00:00Z'
      },
      {
        id: 'app-008-2',
        bookingId: 'bkg-008',
        approverId: 'usr-appr2',
        approverName: 'Bambang Soedirjo, M.T.',
        approverPosition: 'GM Pool & Logistik (L2)',
        level: 2,
        status: 'approved',
        actedAt: '2026-08-14T11:30:00Z'
      }
    ]
  }
];

export const INITIAL_FUEL_LOGS: FuelLog[] = [
  {
    id: 'fl-1',
    vehicleId: 'veh-1',
    bookingId: 'bkg-001',
    liters: 42,
    cost: 630000,
    filledAt: '2026-10-10T16:30:00Z',
    odometer: 48250,
    fuelStation: 'SPBU Internal Pool Tambang Kolaka'
  },
  {
    id: 'fl-2',
    vehicleId: 'veh-6',
    bookingId: 'bkg-007',
    liters: 95,
    cost: 1425000,
    filledAt: '2026-09-22T18:45:00Z',
    odometer: 78900,
    fuelStation: 'Fuel Dispenser Utama Pit Pomalaa'
  },
  {
    id: 'fl-3',
    vehicleId: 'veh-10',
    bookingId: 'bkg-008',
    liters: 35,
    cost: 525000,
    filledAt: '2026-08-15T16:40:00Z',
    odometer: 31050,
    fuelStation: 'SPBU Pertamina Buli Halmahera'
  },
  {
    id: 'fl-4',
    vehicleId: 'veh-7',
    liters: 80,
    cost: 1200000,
    filledAt: '2026-10-15T09:00:00Z',
    odometer: 54000,
    fuelStation: 'Fuel Storage Blok Bahodopi Morowali'
  },
  {
    id: 'fl-5',
    vehicleId: 'veh-2',
    liters: 50,
    cost: 750000,
    filledAt: '2026-10-14T17:00:00Z',
    odometer: 32200,
    fuelStation: 'SPBU Morowali Kota'
  }
];

export const INITIAL_SERVICE_SCHEDULES: ServiceSchedule[] = [
  {
    id: 'srv-1',
    vehicleId: 'veh-9',
    scheduledAt: '2026-10-18T08:00:00Z',
    serviceType: 'Overhaul Mesin',
    description: 'Perbaikan hidrolik tipper dan kalibrasi turbo dump truck hauler 30 ton',
    costEst: 18500000,
    status: 'in_progress'
  },
  {
    id: 'srv-2',
    vehicleId: 'veh-1',
    scheduledAt: '2026-10-28T09:00:00Z',
    serviceType: 'Servis Berkala',
    description: 'Servis rutin 50.000 KM (Ganti oli gardan, filter solar, spooring baling roda tambang)',
    costEst: 2750000,
    status: 'planned'
  },
  {
    id: 'srv-3',
    vehicleId: 'veh-6',
    scheduledAt: '2026-10-05T08:00:00Z',
    serviceType: 'Ganti Ban Tambang',
    description: 'Penggantian 4 ban belakang tipe Lug Heavy Mining 11.00R20',
    costEst: 14200000,
    status: 'completed',
    completedAt: '2026-10-05T16:00:00Z'
  },
  {
    id: 'srv-4',
    vehicleId: 'veh-3',
    scheduledAt: '2026-11-02T08:30:00Z',
    serviceType: 'Inspeksi Rem & Kaki',
    description: 'Pengecekan brake shoe, suspensi daun, dan kelistrikan AC mikrobus',
    costEst: 3400000,
    status: 'planned'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-001',
    userId: 'usr-admin',
    userName: 'Budi Pratama (Admin)',
    role: 'admin',
    action: 'CREATE_BOOKING',
    category: 'booking',
    description: 'Membuat pemesanan baru BKG-2026-10-005 untuk Divisi HSE di Tambang Konawe Utara',
    timestamp: '2026-10-16T14:00:00Z',
    ipAddress: '192.168.10.45'
  },
  {
    id: 'log-002',
    userId: 'usr-appr1',
    userName: 'Ir. Hendra Gunawan',
    role: 'approver',
    action: 'APPROVE_LEVEL_1',
    category: 'approval',
    description: 'Menyetujui permohonan pemesanan BKG-2026-10-004 (Level 1). Status berlanjut ke Level 2.',
    timestamp: '2026-10-16T11:00:00Z',
    ipAddress: '10.20.1.12'
  },
  {
    id: 'log-003',
    userId: 'usr-admin',
    userName: 'Budi Pratama (Admin)',
    role: 'admin',
    action: 'CREATE_BOOKING',
    category: 'booking',
    description: 'Membuat pemesanan BKG-2026-10-004 untuk mobilisasi shift di Sorowako',
    timestamp: '2026-10-16T10:00:00Z',
    ipAddress: '192.168.10.45'
  },
  {
    id: 'log-004',
    userId: 'usr-appr2',
    userName: 'Bambang Soedirjo, M.T.',
    role: 'approver',
    action: 'APPROVE_LEVEL_2',
    category: 'approval',
    description: 'Menyetujui permohonan pemesanan BKG-2026-10-003 (Level 2 Final). Status pemesanan menjadi APPROVED.',
    timestamp: '2026-10-15T16:10:00Z',
    ipAddress: '192.168.1.5'
  },
  {
    id: 'log-005',
    userId: 'usr-admin',
    userName: 'Budi Pratama (Admin)',
    role: 'admin',
    action: 'COMPLETE_BOOKING',
    category: 'vehicle',
    description: 'Menyelesaikan pemesanan BKG-2026-10-001: Odometer kembali 48.250 km, BBM 42 Liter',
    timestamp: '2026-10-10T17:15:00Z',
    ipAddress: '192.168.10.45'
  }
];
