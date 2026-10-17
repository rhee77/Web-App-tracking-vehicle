import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Code2,
  Table,
  Layers,
  KeyRound,
  FileCode,
  Network
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'dictionary' | 'ddl' | 'mermaid'>('diagram');
  const [copied, setCopied] = useState(false);

  const mermaidCode = `erDiagram
    users ||--o{ bookings : "created_by (admin)"
    users ||--o{ booking_approvals : "approver"
    users ||--o{ activity_logs : "performed_by"
    regions ||--o{ vehicles : "located_at"
    regions ||--o{ users : "assigned_to"
    vehicles ||--o{ bookings : "assigned_vehicle"
    drivers ||--o{ bookings : "assigned_driver"
    bookings ||--|{ booking_approvals : "has_approvals (2-level)"
    vehicles ||--o{ fuel_logs : "fuel_consumption"
    vehicles ||--o{ service_schedules : "maintenance"

    users {
        bigint id PK
        varchar name
        varchar username UK
        varchar email UK
        varchar password
        enum role "admin|approver"
        tinyint approval_level "1 or 2"
        bigint region_id FK
        timestamps created_at
    }
    regions {
        bigint id PK
        varchar name
        enum type "head_office|branch|mine"
        varchar location
        varchar code UK
    }
    vehicles {
        bigint id PK
        varchar plate_number UK
        varchar name
        varchar model
        enum category "people|goods"
        enum ownership "owned|rented"
        varchar rental_company
        bigint region_id FK
        int odometer
        enum status "available|in_use|maintenance"
        varchar fuel_type
        int fuel_capacity
    }
    drivers {
        bigint id PK
        varchar name
        varchar phone
        varchar license_number UK
        varchar license_type
        bigint region_id FK
        boolean is_active
        enum status "available|on_duty"
    }
    bookings {
        bigint id PK
        varchar code UK
        bigint vehicle_id FK
        bigint driver_id FK
        bigint created_by FK
        varchar department
        datetime start_at
        datetime end_at
        varchar destination
        text purpose
        bigint region_id FK
        enum status "pending|approved|rejected|cancelled|completed"
        int start_odometer
        int end_odometer
        decimal fuel_filled_liters
        decimal fuel_cost
        timestamps created_at
    }
    booking_approvals {
        bigint id PK
        bigint booking_id FK
        bigint approver_id FK
        tinyint level "1=Atasan, 2=Pool"
        enum status "waiting|pending|approved|rejected"
        text note
        datetime acted_at
    }
    activity_logs {
        bigint id PK
        bigint user_id FK
        varchar action
        varchar category
        text description
        varchar ip_address
        timestamp created_at
    }`;

  const sqlDDL = `-- ========================================================
-- PHYSICAL DATA MODEL (PDM) SCHEMA DDL - MYSQL 8 / MARIADB
-- SISTEM PEMESANAN KENDARAAN TAMBANG NIKEL (PT SEKAWAN MEDIA)
-- ========================================================

CREATE TABLE regions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type ENUM('head_office', 'branch', 'mine') NOT NULL,
    location VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'approver') NOT NULL,
    approval_level TINYINT UNSIGNED NULL COMMENT '1: Atasan Langsung, 2: GM Pool/Logistik',
    region_id BIGINT UNSIGNED NULL,
    position VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE vehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    model VARCHAR(150) NOT NULL,
    category ENUM('people', 'goods') NOT NULL COMMENT 'Orang (Hilux/HiAce) vs Barang (Dump Truck)',
    ownership ENUM('owned', 'rented') NOT NULL,
    rental_company VARCHAR(150) NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    odometer INT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('available', 'in_use', 'maintenance') NOT NULL DEFAULT 'available',
    fuel_type VARCHAR(50) DEFAULT 'Solar / Dex',
    fuel_capacity INT UNSIGNED NOT NULL DEFAULT 80,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_region FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB;

CREATE TABLE drivers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_type ENUM('SIM A', 'SIM B1', 'SIM B2 Umum') NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    status ENUM('available', 'on_duty') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drivers_region FOREIGN KEY (region_id) REFERENCES regions(id)
) ENGINE=InnoDB;

CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    driver_id BIGINT UNSIGNED NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    department VARCHAR(100) NOT NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    destination VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    region_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    start_odometer INT UNSIGNED NULL,
    end_odometer INT UNSIGNED NULL,
    fuel_filled_liters DECIMAL(8,2) NULL,
    fuel_cost DECIMAL(12,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT fk_bookings_driver FOREIGN KEY (driver_id) REFERENCES drivers(id),
    CONSTRAINT fk_bookings_creator FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT fk_bookings_region FOREIGN KEY (region_id) REFERENCES regions(id),
    INDEX idx_booking_schedule (vehicle_id, start_at, end_at),
    INDEX idx_booking_driver_schedule (driver_id, start_at, end_at),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB;

CREATE TABLE booking_approvals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    approver_id BIGINT UNSIGNED NOT NULL,
    level TINYINT UNSIGNED NOT NULL COMMENT '1: Atasan, 2: Pool',
    status ENUM('waiting', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'waiting',
    note TEXT NULL,
    acted_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_approval_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    CONSTRAINT fk_approval_approver FOREIGN KEY (approver_id) REFERENCES users(id),
    INDEX idx_approver_status (approver_id, status)
) ENGINE=InnoDB;

CREATE TABLE fuel_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL,
    liters DECIMAL(8,2) NOT NULL,
    cost DECIMAL(12,2) NOT NULL,
    filled_at DATETIME NOT NULL,
    odometer INT UNSIGNED NOT NULL,
    fuel_station VARCHAR(150) NOT NULL,
    CONSTRAINT fk_fuel_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
    CONSTRAINT fk_fuel_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE service_schedules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    scheduled_at DATE NOT NULL,
    service_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    cost_est DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('planned', 'in_progress', 'completed') NOT NULL DEFAULT 'planned',
    completed_at DATETIME NULL,
    CONSTRAINT fk_service_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
) ENGINE=InnoDB;

CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_activity_time (created_at)
) ENGINE=InnoDB;`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
            <span>Instruction Tambahan (a)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Database className="w-6 h-6 text-amber-500" />
            <span>Physical Data Model (PDM) &amp; Arsitektur Basis Data</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Rancangan skema relasional, primary/foreign keys, indeks komposit overlap, dan integritas data pemesanan
          </p>
        </div>

        <button
          onClick={() => handleCopy(activeTab === 'ddl' ? sqlDDL : mermaidCode)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Kode Skema'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('diagram')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'diagram'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Diagram Relasi Visual (ERD)</span>
        </button>

        <button
          onClick={() => setActiveTab('dictionary')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'dictionary'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="w-4 h-4" />
          <span>Kamus Data Tabel (Data Dictionary)</span>
        </button>

        <button
          onClick={() => setActiveTab('ddl')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'ddl'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>SQL DDL Schema (MySQL / MariaDB)</span>
        </button>

        <button
          onClick={() => setActiveTab('mermaid')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'mermaid'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Format Mermaid.js</span>
        </button>
      </div>

      {/* Tab 1: Interactive Visual Diagram */}
      {activeTab === 'diagram' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="text-xs text-slate-400">
            Diagram entitas relasional menyorot hubungan <span className="font-semibold text-white">bookings</span> dengan <span className="font-semibold text-amber-400">booking_approvals (1:N 2-Level)</span>, <span className="font-semibold text-blue-400">vehicles</span>, <span className="font-semibold text-emerald-400">drivers</span>, dan <span className="font-semibold text-purple-400">regions</span>:
          </div>

          {/* Graphical Node Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Entity: BOOKINGS (Centerpiece) */}
            <div className="md:col-span-3 bg-gradient-to-r from-amber-950/40 via-slate-850 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/30">
                <span className="font-mono font-bold text-amber-300 text-sm flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>TABLE: bookings (Entitas Utama Pemesanan)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                  InnoDB • Engine
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-amber-400 font-bold font-mono">id (PK)</span>
                  <p className="text-slate-400 text-[10px]">BIGINT UNSIGNED AUTO_INCREMENT</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-blue-400 font-bold font-mono">vehicle_id (FK)</span>
                  <p className="text-slate-400 text-[10px]">Relasi ke vehicles.id</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-emerald-400 font-bold font-mono">driver_id (FK)</span>
                  <p className="text-slate-400 text-[10px]">Relasi ke drivers.id</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-purple-400 font-bold font-mono">created_by (FK)</span>
                  <p className="text-slate-400 text-[10px]">Relasi ke users.id (Admin)</p>
                </div>
              </div>
            </div>

            {/* Entity: BOOKING_APPROVALS */}
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="font-mono font-bold text-emerald-350 text-xs">
                  booking_approvals (2-Level)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">1:N</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                Menyimpan tahapan persetujuan:
              </p>
              <ul className="space-y-1 text-[10px] text-slate-400 font-mono">
                <li>• id (PK)</li>
                <li>• booking_id (FK ke bookings)</li>
                <li>• approver_id (FK ke users)</li>
                <li>• level: TINYINT (1: Atasan, 2: Pool)</li>
                <li>• status: waiting|pending|approved|rejected</li>
                <li>• note: TEXT, acted_at: DATETIME</li>
              </ul>
            </div>

            {/* Entity: VEHICLES */}
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="font-mono font-bold text-blue-300 text-xs">
                  vehicles (Armada Tambang)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400">1:N</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                Master 12 unit kendaraan tambang:
              </p>
              <ul className="space-y-1 text-[10px] text-slate-400 font-mono">
                <li>• plate_number: VARCHAR UNIQUE</li>
                <li>• category: people | goods</li>
                <li>• ownership: owned | rented</li>
                <li>• rental_company: VARCHAR NULL</li>
                <li>• region_id: FK ke regions</li>
                <li>• odometer: INT, status: available|in_use</li>
              </ul>
            </div>

            {/* Entity: DRIVERS */}
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="font-mono font-bold text-emerald-300 text-xs">
                  drivers (Pengemudi Pool)
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">1:N</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                Driver resmi berlisensi:
              </p>
              <ul className="space-y-1 text-[10px] text-slate-400 font-mono">
                <li>• name: VARCHAR, phone: VARCHAR</li>
                <li>• license_number: VARCHAR UNIQUE</li>
                <li>• license_type: SIM A | B1 | B2 Umum</li>
                <li>• region_id: FK ke regions</li>
                <li>• status: available | on_duty</li>
              </ul>
            </div>

            {/* Entity: REGIONS */}
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="font-mono font-bold text-purple-300 text-xs">
                  regions (1 HQ + 1 Cabang + 6 Tambang)
                </span>
              </div>
              <ul className="space-y-1 text-[10px] text-slate-400 font-mono">
                <li>• name: VARCHAR (Kolaka, Morowali, Sorowako, dll.)</li>
                <li>• type: head_office | branch | mine</li>
                <li>• code: VARCHAR UNIQUE (KP-MKS, TB-KLK)</li>
              </ul>
            </div>

            {/* Entity: FUEL_LOGS */}
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="font-mono font-bold text-amber-400 text-xs">
                  fuel_logs (Konsumsi BBM)
                </span>
              </div>
              <ul className="space-y-1 text-[10px] text-slate-400 font-mono">
                <li>• vehicle_id (FK), booking_id (FK)</li>
                <li>• liters: DECIMAL, cost: DECIMAL</li>
                <li>• odometer: INT, fuel_station: VARCHAR</li>
              </ul>
            </div>

            {/* Entity: ACTIVITY_LOGS */}
            <div className="bg-slate-850 border border-slate-700 rounded-2xl p-4">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                <span className="font-mono font-bold text-rose-300 text-xs">
                  activity_logs (Audit Trail)
                </span>
              </div>
              <ul className="space-y-1 text-[10px] text-slate-400 font-mono">
                <li>• user_id (FK), action: VARCHAR</li>
                <li>• category: booking | approval | export</li>
                <li>• description: TEXT, ip_address: VARCHAR</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data Dictionary */}
      {activeTab === 'dictionary' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 font-bold text-white text-xs">
            Kamus Data Tabel Inti: Pemesanan &amp; Approval Berjenjang
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Tabel</th>
                  <th className="py-2.5 px-3">Kolom</th>
                  <th className="py-2.5 px-3">Tipe Data</th>
                  <th className="py-2.5 px-3">Key / Constraint</th>
                  <th className="py-2.5 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-amber-400">bookings</td>
                  <td className="py-2 px-3 font-mono">id</td>
                  <td className="py-2 px-3">BIGINT UNSIGNED</td>
                  <td className="py-2 px-3 text-amber-400 font-bold">PRIMARY KEY</td>
                  <td className="py-2 px-3">ID unik pemesanan</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-amber-400">bookings</td>
                  <td className="py-2 px-3 font-mono">code</td>
                  <td className="py-2 px-3">VARCHAR(50)</td>
                  <td className="py-2 px-3 text-blue-400">UNIQUE</td>
                  <td className="py-2 px-3">Kode invoice (BKG-2026-10-001)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-amber-400">bookings</td>
                  <td className="py-2 px-3 font-mono">vehicle_id</td>
                  <td className="py-2 px-3">BIGINT UNSIGNED</td>
                  <td className="py-2 px-3 text-purple-400">FOREIGN KEY</td>
                  <td className="py-2 px-3">Referensi ke vehicles.id</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-amber-400">bookings</td>
                  <td className="py-2 px-3 font-mono">driver_id</td>
                  <td className="py-2 px-3">BIGINT UNSIGNED</td>
                  <td className="py-2 px-3 text-purple-400">FOREIGN KEY</td>
                  <td className="py-2 px-3">Referensi ke drivers.id</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-amber-400">bookings</td>
                  <td className="py-2 px-3 font-mono">status</td>
                  <td className="py-2 px-3">ENUM</td>
                  <td className="py-2 px-3">INDEX</td>
                  <td className="py-2 px-3">pending, approved, rejected, cancelled, completed</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-400">booking_approvals</td>
                  <td className="py-2 px-3 font-mono">booking_id</td>
                  <td className="py-2 px-3">BIGINT UNSIGNED</td>
                  <td className="py-2 px-3 text-purple-400">FOREIGN KEY (Cascade)</td>
                  <td className="py-2 px-3">ID booking pemohon</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-emerald-400">booking_approvals</td>
                  <td className="py-2 px-3 font-mono">level</td>
                  <td className="py-2 px-3">TINYINT</td>
                  <td className="py-2 px-3">NOT NULL</td>
                  <td className="py-2 px-3">1 = Atasan Langsung, 2 = Kepala Pool</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono text-emerald-400">booking_approvals</td>
                  <td className="py-2 px-3 font-mono">status</td>
                  <td className="py-2 px-3">ENUM</td>
                  <td className="py-2 px-3">INDEX</td>
                  <td className="py-2 px-3">waiting, pending, approved, rejected</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: SQL DDL */}
      {activeTab === 'ddl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 bg-slate-950 rounded-xl leading-relaxed">
            {sqlDDL}
          </pre>
        </div>
      )}

      {/* Tab 4: Mermaid */}
      {activeTab === 'mermaid' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-4 bg-slate-950 rounded-xl leading-relaxed">
            {mermaidCode}
          </pre>
        </div>
      )}
    </div>
  );
};
