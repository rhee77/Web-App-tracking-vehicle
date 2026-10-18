# Aplikasi Pemesanan & Monitoring Kendaraan Tambang Nikel

Web aplikasi pemesanan kendaraan untuk operasional tambang, dengan approval berjenjang dua level, dashboard, laporan Excel, dan audit aktivitas.

## Teknologi

- Node.js 20+ dan TypeScript
- React 19, Vite, Tailwind CSS 4
- Express 4
- MySQL 8 / MariaDB 10.11+
- SheetJS untuk ekspor `.xlsx`

> Proyek ini **bukan** aplikasi PHP atau Laravel. Dokumentasi ini mencantumkan stack yang benar sesuai source code.

## Akun uji

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `password` |
| Approver level 1 | `approver1` | `password` |
| Approver level 2 | `approver2` | `password` |

## Instalasi

1. Buat database dan struktur tabel:

   ```powershell
   mysql -u root -p < database/schema.sql
   ```

2. Instal dependensi lalu isi data contoh:

   ```powershell
   npm install
   npm run db:seed
   ```

3. Jalankan aplikasi:

   ```powershell
   npm run dev
   ```

Antarmuka tersedia di `http://localhost:3000`; API tersedia di `http://localhost:5000`.

Konfigurasi database dapat diubah melalui `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME`. Nilai bawaan ditujukan untuk Laragon: `127.0.0.1:3306`, user `root`, password kosong, database `vehicle_booking`.

## Panduan penggunaan

1. Masuk sebagai Admin untuk membuat pemesanan, memilih kendaraan, driver, dan dua approver.
2. Server memvalidasi rentang tanggal, ketersediaan kendaraan/driver, serta kesesuaian approver dengan levelnya.
3. Masuk sebagai Approver level 1 untuk menyetujui atau menolak. Level 2 baru aktif sesudah persetujuan level 1.
4. Setelah level 2 menyetujui, Admin dapat menyelesaikan booking dan mengisi odometer serta BBM.
5. Gunakan menu Laporan untuk memfilter data dan mengunduh Excel. Log Aktivitas menampilkan jejak aksi sistem.

## Aturan keamanan dan integritas

- Login menggunakan sesi token di memori server; token wajib dikirim ke seluruh endpoint yang mengubah data.
- Hanya Admin dapat membuat, membatalkan, atau menyelesaikan booking.
- Hanya approver yang ditetapkan, berstatus `pending`, dan sedang mendapat giliran yang dapat memproses approval.
- Pengecekan konflik jadwal dilakukan kembali di server dalam transaksi database.
- Log untuk login, membuat, membatalkan, menyetujui/menolak, dan menyelesaikan booking dibuat oleh server, bukan dipercaya dari browser.

## Dokumentasi desain

- [Physical Data Model](docs/pdm.md)
- [Activity Diagram](docs/activity-diagram.md)
- [SQL schema](database/schema.sql)

## Pemeriksaan kualitas

```powershell
npm run lint
npm test
npm run build
```
