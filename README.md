# Aplikasi Pemesanan & Monitoring Kendaraan Tambang Nikel

Aplikasi web Enterprise Resource Planning (ERP) & Fleet Management untuk monitoring operasional kendaraan tambang nikel, konsumsi BBM, jadwal pemeliharaan berkala, serta perizinan pemesanan kendaraan dengan **Persetujuan Berjenjang (Multi-level Approval 2-Level)**.

Dibuat sebagai pemenuhan Technical Test: **Fullstack Developer (Intern)** - PT Sekawan Media Informatika.

---

## 1. Daftar Akun & Kredensial Pengguna

Sistem memiliki otentikasi role-based (Admin Pool Fleet dan Pihak yang Menyetujui / Approver Level 1 & Level 2):

| Role | Username | Password | Nama & Jabatan | Level Approval | Penempatan Wilayah |
|------|----------|----------|----------------|----------------|-------------------|
| **Admin** | `admin` | `password` | Budi Pratama, S.T. (Fleet Administrator) | N/A (Penginput & Pengelola) | Kantor Pusat Makassar |
| **Approver L1** | `approver1` | `password` | Ir. Hendra Gunawan (Kepala Divisi Operasional) | **Level 1** (Atasan Langsung) | Tambang Kolaka |
| **Approver L2** | `approver2` | `password` | Bambang Soedirjo, M.T. (General Manager Pool & Logistik) | **Level 2** (Penyetuju Final Pool) | Kantor Pusat Makassar |

> **Catatan Pengujian:** Anda dapat beralih peran (switch role) secara instan melalui bilah navigasi atas (Navbar) tanpa perlu relogin manual untuk menguji seluruh siklus workflow pemesanan.

---

## 2. Spesifikasi Teknologi & Versi

Sesuai ketentuan soal technical test:

- **PHP Version:** PHP 8.2+ / 8.3 (Enterprise CLI & Web Runtime)
- **Framework Backend:** Laravel 11.x (Database Migrations, Eloquent ORM, Transactions, FormRequest Validation)
- **Database Engine:** MySQL 8.0.36 / MariaDB 10.11 LTS (InnoDB, Relational Foreign Keys, Indexing)
- **Frontend Applet:** React 19 + TypeScript + Vite + Tailwind CSS v4 + Motion
- **Spreadsheet / Reporting:** SheetJS (XLSX) & PhpSpreadsheet compatible engine
- **Icons & Visuals:** Lucide React, SVG Charting Engine, Mermaid-compatible PDM & Activity Diagram

---

## 3. Struktur Wilayah Tambang & Karakteristik Armada

Sesuai skenario soal:
1. **1 Kantor Pusat:** Kantor Pusat Makassar (Sulawesi Selatan)
2. **1 Kantor Cabang:** Kantor Cabang Kendari (Sulawesi Tenggara)
3. **6 Lokasi Tambang Nikel:**
   - Tambang Kolaka (Blok Pomalaa)
   - Tambang Morowali (Blok Bahodopi)
   - Tambang Sorowako (Blok Petea)
   - Tambang Konawe Utara (Blok Mandiodo)
   - Tambang Halmahera Timur (Blok Buli)
   - Tambang Morowali Utara (Blok Petasia)

### Kategori & Kepemilikan Armada:
- **Kategori Angkutan:**
  - *Angkutan Orang:* Toyota Hilux 4x4 Double Cabin, Mitsubishi Triton HD-X, Toyota HiAce Commuter, Isuzu Elf Crew Bus, Mitsubishi Pajero Sport Inspection.
  - *Angkutan Barang / Hauling:* Hino Ranger 500 Dump Tipper FM 260 JD, Isuzu Giga FVR Heavy Hauler, Scania P380 XT Mining Tipper, Mitsubishi Canter Logistik, Hino Profia 700 Ore Hauler.
- **Kepemilikan:**
  - *Milik Perusahaan (Owned)*
  - *Sewa (Rented)* dari penyedia seperti PT Rentalindo Mandiri Nusantara, PT Trans Nusantara Perkasa, dll.

---

## 4. Panduan Penggunaan Aplikasi (User Manual)

### A. Alur Pemesanan oleh Admin
1. Masuk ke aplikasi menggunakan akun `admin` (atau klik badge switch role di pojok kanan atas ke **Admin**).
2. Pilih menu **"Pemesanan Kendaraan"** -> klik tombol **"+ Buat Pemesanan Baru"**.
3. Isi formulir pemesanan:
   - Pilih armada kendaraan (sistem menampilkan status ketersediaan, kategori orang/barang, dan kepemilikan).
   - Pilih driver yang bertugas.
   - Tentukan rentang tanggal & jam (Mulai s/d Selesai). *Sistem otomatis memvalidasi jadwal agar tidak terjadi double-booking pada kendaraan maupun driver!*
   - Masukkan lokasi tujuan (misal: Pit 3 Blok Pomalaa) dan keperluan operasional.
   - Pilih **Approver Level 1** (Atasan Langsung) dan **Approver Level 2** (Kepala Pool/Logistik).
4. Klik **"Kirim Pengajuan Pemesanan"**. Status awal pemesanan otomatis menjadi **PENDING**, dengan Approval Level 1 berstatus `pending` dan Level 2 berstatus `waiting`.
5. Aktivitas tercatat seketika di **Log Aktivitas**.

### B. Alur Persetujuan Berjenjang (Multi-Level Approval)
1. **Langkah Persetujuan Level 1:**
   - Beralih peran ke **Approver L1 (Ir. Hendra Gunawan)**.
   - Buka menu **"Persetujuan Saya"**. Pengajuan baru akan tampil dengan badge status **Perlu Tindakan Anda (Level 1)**.
   - Klik **"Setujui"** atau **"Tolak"** (dapat menyertakan catatan/instruksi).
   - Jika *Disetujui*: Level 1 berubah menjadi `approved`, dan status approval Level 2 otomatis dibuka menjadi `pending`.
   - Jika *Ditolak*: Pemesanan langsung berstatus `rejected` dan alur berhenti.
2. **Langkah Persetujuan Level 2 (Kepala Pool):**
   - Beralih peran ke **Approver L2 (Bambang Soedirjo, M.T.)**.
   - Buka menu **"Persetujuan Saya"**. Approver L2 kini dapat memberikan keputusan akhir.
   - **Aturan Integritas:** Jika Level 1 belum menyetujui, tombol aksi di Level 2 terkunci (*Menunggu Level 1*).
   - Klik **"Setujui"**: Seluruh permohonan pemesanan resmi menjadi **APPROVED** dan siap bertugas.

### C. Penyelesaian Pemesanan & Monitoring BBM / Service
1. Setelah armada selesai beroperasi, Admin dapat mengklik tombol **"Selesai"** pada daftar pemesanan.
2. Masukkan angka **Odometer Akhir (KM)** dan jumlah **Pengisian BBM (Liter & Biaya Rupiah)**.
3. Status pemesanan berubah menjadi **COMPLETED**.
4. Data otomatis memperbarui grafik dashboard konsumsi BBM, efisiensi km/liter, dan riwayat pemakaian.
5. Menu **"Monitoring BBM & Service"** menampilkan jadwal servis rutin dan peringatan pemeliharaan.

### D. Dashboard Analitik & Grafik
- Menampilkan metrik utama: Total Armada, Pemesanan Aktif, Menunggu Approval, Kendaraan Operasional, Total BBM, dan Biaya.
- Grafik visual interaktif:
  - *Tren Pemakaian Bulanan (Bar/Area Chart)*
  - *Distribusi Kategori (Angkutan Orang vs Angkutan Barang)*
  - *Sebaran Pemakaian per Wilayah Tambang & Kantor*
  - *Konsumsi BBM per Armada*
- Dilengkapi filter rentang waktu dan wilayah operasional.

### E. Laporan & Export Excel (.xlsx)
1. Buka menu **"Laporan & Export Excel"**.
2. Tentukan filter rentang tanggal (atau pilih Semua), filter status, dan kategori.
3. Klik tombol hijau **"Export ke Excel (.xlsx)"**.
4. File spreadsheet resmi akan terunduh langsung ke komputer Anda dengan 3 lembar kerja (sheets):
   - *Data Pemesanan* (detail lengkap dengan kolom approver, status, catatan, jarak tempuh, bbm)
   - *Ringkasan Eksekutif* (rekapitulasi angka)
   - *Master Armada* (inventaris lengkap kendaraan)

---

## 5. Nilai Tambah (Instruction Bonus Points)

- **a. Physical Data Model (PDM):** Tersedia tab interaktif **"Arsitektur & PDM"** yang menampilkan ERD visual lengkap, kamus data tabel (primary key, foreign key, index, tipe data), dan script SQL DDL.
- **b. Activity Diagram:** Tersedia tab **"Activity Diagram"** dengan diagram swimlane interaktif (Admin -> Sistem -> Approver 1 -> Approver 2 -> Pool) dan visualisasi alur bertahap.
- **c. Log Aplikasi Menyeluruh:** Setiap proses (Login, Create Booking, Approve L1, Approve L2, Reject, Selesai, Export Excel) tercatat di tabel audit trail dengan User, Role, Action, IP Address, dan Timestamp.
- **d. UI/UX Profesional & Responsif:** Desain tema industri pertambangan nikel modern dengan palet warna slate-amber-emerald, tipografi terstruktur, badge status yang jelas, dialog konfirmasi aman, serta navigasi yang adaptif untuk desktop maupun perangkat mobile.
