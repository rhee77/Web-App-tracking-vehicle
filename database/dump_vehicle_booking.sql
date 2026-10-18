-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: vehicle_booking
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('auth','booking','approval','vehicle','export','service') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_activity_user` (`user_id`),
  KEY `idx_activity_time` (`created_at`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
INSERT INTO `activity_logs` VALUES ('log-001','usr-admin','Budi Pratama (Admin)','admin','CREATE_BOOKING','booking','Membuat pemesanan baru BKG-2026-10-005 untuk Divisi HSE di Tambang Konawe Utara','192.168.10.45','2026-10-16 14:00:00'),('log-002','usr-appr1','Ir. Hendra Gunawan','approver','APPROVE_LEVEL_1','approval','Menyetujui permohonan pemesanan BKG-2026-10-004 (Level 1). Status berlanjut ke Level 2.','10.20.1.12','2026-10-16 11:00:00'),('log-003','usr-admin','Budi Pratama (Admin)','admin','CREATE_BOOKING','booking','Membuat pemesanan BKG-2026-10-004 untuk mobilisasi shift di Sorowako','192.168.10.45','2026-10-16 10:00:00'),('log-004','usr-appr2','Bambang Soedirjo, M.T.','approver','APPROVE_LEVEL_2','approval','Menyetujui permohonan pemesanan BKG-2026-10-003 (Level 2 Final). Status pemesanan menjadi APPROVED.','192.168.1.5','2026-10-15 16:10:00'),('log-005','usr-admin','Budi Pratama (Admin)','admin','COMPLETE_BOOKING','vehicle','Menyelesaikan pemesanan BKG-2026-10-001: Odometer kembali 48.250 km, BBM 42 Liter','192.168.10.45','2026-10-10 17:15:00');
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_approvals`
--

DROP TABLE IF EXISTS `booking_approvals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `booking_approvals` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approver_position` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` tinyint unsigned NOT NULL COMMENT '1: Atasan Langsung, 2: Pool/Logistik',
  `status` enum('waiting','pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting',
  `note` text COLLATE utf8mb4_unicode_ci,
  `acted_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_approval_booking` (`booking_id`),
  KEY `idx_approver_status` (`approver_id`,`status`),
  CONSTRAINT `fk_approval_approver` FOREIGN KEY (`approver_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_approval_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_approvals`
--

LOCK TABLES `booking_approvals` WRITE;
/*!40000 ALTER TABLE `booking_approvals` DISABLE KEYS */;
INSERT INTO `booking_approvals` VALUES ('app-001-1','bkg-001','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'approved','Disetujui. Pastikan perlengkapan APD dan GPS tambang siap.','2026-10-09 16:15:00','2026-10-17 07:54:04'),('app-001-2','bkg-001','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'approved','Disetujui oleh Pool. Kendaraan telah di-check radiokomunikasi.','2026-10-09 17:00:00','2026-10-17 07:54:04'),('app-002-1','bkg-002','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'approved','Disetujui untuk pengawalan tim surveyor.','2026-10-15 18:45:00','2026-10-17 07:54:04'),('app-002-2','bkg-002','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'approved','Approved. Kendaraan dalam kondisi prima.','2026-10-15 20:20:00','2026-10-17 07:54:04'),('app-003-1','bkg-003','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'approved','Suku cadang sangat urgen untuk excavator yang standby.','2026-10-15 22:00:00','2026-10-17 07:54:04'),('app-003-2','bkg-003','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'approved','Disetujui. Pastikan lashing dan pengikatan muatan aman.','2026-10-15 23:10:00','2026-10-17 07:54:04'),('app-004-1','bkg-004','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'approved','Shift change mingguan telah diverifikasi.','2026-10-16 18:00:00','2026-10-17 07:54:04'),('app-004-2','bkg-004','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'pending',NULL,NULL,'2026-10-17 07:54:04'),('app-005-1','bkg-005','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'pending',NULL,NULL,'2026-10-17 07:54:04'),('app-005-2','bkg-005','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'waiting',NULL,NULL,'2026-10-17 07:54:04'),('app-006-1','bkg-006','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'rejected','Ditolak: Jadwal bentrok dengan agenda direksi, disarankan menggunakan taksi operasional.','2026-10-11 17:30:00','2026-10-17 07:54:04'),('app-006-2','bkg-006','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'waiting',NULL,NULL,'2026-10-17 07:54:04'),('app-007-1','bkg-007','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'approved','Disetujui target muatan 250 ton per shift.','2026-09-21 15:30:00','2026-10-17 07:54:04'),('app-007-2','bkg-007','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'approved','Approved oleh Pool Kendaraan Berat.','2026-09-21 16:00:00','2026-10-17 07:54:04'),('app-008-1','bkg-008','usr-appr1','Ir. Hendra Gunawan','Kepala Divisi Operasional (L1)',1,'approved',NULL,'2026-08-14 18:00:00','2026-10-17 07:54:04'),('app-008-2','bkg-008','usr-appr2','Bambang Soedirjo, M.T.','GM Pool & Logistik (L2)',2,'approved',NULL,'2026-08-14 18:30:00','2026-10-17 07:54:04');
/*!40000 ALTER TABLE `booking_approvals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `driver_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `destination` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `region_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected','cancelled','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `start_odometer` int unsigned DEFAULT NULL,
  `end_odometer` int unsigned DEFAULT NULL,
  `fuel_filled_liters` decimal(8,2) DEFAULT NULL,
  `fuel_cost` decimal(12,2) DEFAULT NULL,
  `cancellation_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `fk_bookings_creator` (`created_by_id`),
  KEY `fk_bookings_region` (`region_id`),
  KEY `idx_booking_schedule` (`vehicle_id`,`start_at`,`end_at`),
  KEY `idx_booking_driver_schedule` (`driver_id`,`start_at`,`end_at`),
  KEY `idx_booking_status` (`status`),
  CONSTRAINT `fk_bookings_creator` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_bookings_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`),
  CONSTRAINT `fk_bookings_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`),
  CONSTRAINT `fk_bookings_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES ('bkg-001','BKG-2026-10-001','veh-1','drv-1','usr-admin','Budi Pratama (Admin)','Geology & Exploration','2026-10-10 15:00:00','2026-10-11 00:00:00','Site Pit 3 Blok Pomalaa Kolaka','Inspeksi Titik Pengeboran Bijih Nikel dan Pengambilan Sampel Core','reg-mine-1','completed',47900,48250,42.00,630000.00,NULL,'2026-10-09 08:30:00'),('bkg-002','BKG-2026-10-002','veh-2','drv-2','usr-admin','Budi Pratama (Admin)','Mine Engineering','2026-10-16 14:00:00','2026-10-18 03:00:00','Jetty Pelabuhan Muat Morowali - Smelter IMIP','Monitoring Jalur Hauling dan Koordinasi Pengapalan Nickel Pig Iron','reg-mine-2','approved',32200,NULL,NULL,NULL,NULL,'2026-10-15 11:00:00'),('bkg-003','BKG-2026-10-003','veh-7','drv-7','usr-admin','Budi Pratama (Admin)','Logistik & Supply Chain','2026-10-17 13:00:00','2026-10-18 01:00:00','Gudang Bahan Peledak & Spareparts Pit Morowali','Pengangkutan Suku Cadang Excavator Komatsu PC2000 & Oli Pelumas Drum','reg-mine-2','approved',54000,NULL,NULL,NULL,NULL,'2026-10-15 14:30:00'),('bkg-004','BKG-2026-10-004','veh-3','drv-3','usr-admin','Budi Pratama (Admin)','HR & GA Tambang Sorowako','2026-10-18 14:30:00','2026-10-18 23:30:00','Mess Karyawan Blok Petea ke Basecamp Utama','Mobilisasi Antar Shift Regu Operator Tambang Sorowako (14 Personel)','reg-mine-3','pending',NULL,NULL,NULL,NULL,NULL,'2026-10-16 10:00:00'),('bkg-005','BKG-2026-10-005','veh-4','drv-8','usr-admin','Budi Pratama (Admin)','Health, Safety & Environment (HSE)','2026-10-19 15:00:00','2026-10-20 00:00:00','Pit Disposal & Sediment Pond Blok Mandiodo','Audit Kepatuhan Lingkungan & Uji Kualitas Air Limpasan Tambang','reg-mine-4','pending',NULL,NULL,NULL,NULL,NULL,'2026-10-16 14:00:00'),('bkg-006','BKG-2026-10-006','veh-5','drv-6','usr-admin','Budi Pratama (Admin)','Corporate Secretariat & Legal','2026-10-12 16:00:00','2026-10-12 22:00:00','Dinas ESDM & Kantor Gubernur Sulawesi Selatan','Kunjungan Kerja Pembaruan Dokumen RKAB Tambang Nikel','reg-ho','rejected',NULL,NULL,NULL,NULL,NULL,'2026-10-11 09:00:00'),('bkg-007','BKG-2026-09-021','veh-6','drv-4','usr-admin','Budi Pratama (Admin)','Produksi Hauling Kolaka','2026-09-22 14:00:00','2026-09-23 02:00:00','Stockpile Pelabuhan Pomalaa','Pengangkutan Bijih Nikel Kadar Tinggi (Saprolit 1.8%) ke Kapal Tongkang','reg-mine-1','completed',78500,78900,95.00,1425000.00,NULL,'2026-09-21 08:00:00'),('bkg-008','BKG-2026-08-015','veh-10','drv-1','usr-admin','Budi Pratama (Admin)','Safety & Rescue','2026-08-15 15:00:00','2026-08-16 00:00:00','Blok Buli Halmahera Timur Area Barat','Simulasi Tanggap Darurat Bencana Banjir & Longsor Lereng Tambang','reg-mine-5','completed',30800,31050,35.00,525000.00,NULL,'2026-08-14 10:00:00');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `drivers`
--

DROP TABLE IF EXISTS `drivers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `drivers` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_type` enum('SIM A','SIM B1','SIM B2 Umum') COLLATE utf8mb4_unicode_ci NOT NULL,
  `region_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `status` enum('available','on_duty') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `license_number` (`license_number`),
  KEY `fk_drivers_region` (`region_id`),
  CONSTRAINT `fk_drivers_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `drivers`
--

LOCK TABLES `drivers` WRITE;
/*!40000 ALTER TABLE `drivers` DISABLE KEYS */;
INSERT INTO `drivers` VALUES ('drv-1','Agus Salim S.','0812-4411-9821','SIM-A-8712903','SIM A','reg-mine-1',1,'available','2026-10-17 07:54:04'),('drv-2','Rahmat Hidayat','0821-9033-1122','SIM-B2-9901452','SIM B2 Umum','reg-mine-2',1,'on_duty','2026-10-17 07:54:04'),('drv-3','Dedi Kurniawan','0852-7711-4455','SIM-A-7782190','SIM A','reg-mine-3',1,'available','2026-10-17 07:54:04'),('drv-4','Supardi Mansyur','0813-8822-6633','SIM-B2-8871201','SIM B2 Umum','reg-mine-1',1,'available','2026-10-17 07:54:04'),('drv-5','Faisal Basri','0822-5500-1199','SIM-B1-6623019','SIM B1','reg-branch',1,'available','2026-10-17 07:54:04'),('drv-6','Yanto Wahyudi','0811-9021-3344','SIM-A-9912044','SIM A','reg-ho',1,'available','2026-10-17 07:54:04'),('drv-7','Mansur Efendi','0853-2211-7788','SIM-B2-5561023','SIM B2 Umum','reg-mine-2',1,'on_duty','2026-10-17 07:54:04'),('drv-8','Lukman Hakim','0812-3344-5566','SIM-A-8821904','SIM A','reg-mine-4',1,'available','2026-10-17 07:54:04');
/*!40000 ALTER TABLE `drivers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fuel_logs`
--

DROP TABLE IF EXISTS `fuel_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fuel_logs` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `booking_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `liters` decimal(8,2) NOT NULL,
  `cost` decimal(12,2) NOT NULL,
  `filled_at` datetime NOT NULL,
  `odometer` int unsigned NOT NULL,
  `fuel_station` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_fuel_vehicle` (`vehicle_id`),
  KEY `fk_fuel_booking` (`booking_id`),
  CONSTRAINT `fk_fuel_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_fuel_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fuel_logs`
--

LOCK TABLES `fuel_logs` WRITE;
/*!40000 ALTER TABLE `fuel_logs` DISABLE KEYS */;
INSERT INTO `fuel_logs` VALUES ('fl-1','veh-1','bkg-001',42.00,630000.00,'2026-10-10 23:30:00',48250,'SPBU Internal Pool Tambang Kolaka','2026-10-17 07:54:04'),('fl-2','veh-6','bkg-007',95.00,1425000.00,'2026-09-23 01:45:00',78900,'Fuel Dispenser Utama Pit Pomalaa','2026-10-17 07:54:04'),('fl-3','veh-10','bkg-008',35.00,525000.00,'2026-08-15 23:40:00',31050,'SPBU Pertamina Buli Halmahera','2026-10-17 07:54:04'),('fl-4','veh-7',NULL,80.00,1200000.00,'2026-10-15 16:00:00',54000,'Fuel Storage Blok Bahodopi Morowali','2026-10-17 07:54:04'),('fl-5','veh-2',NULL,50.00,750000.00,'2026-10-15 00:00:00',32200,'SPBU Morowali Kota','2026-10-17 07:54:04');
/*!40000 ALTER TABLE `fuel_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regions`
--

DROP TABLE IF EXISTS `regions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regions` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('head_office','branch','mine') COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regions`
--

LOCK TABLES `regions` WRITE;
/*!40000 ALTER TABLE `regions` DISABLE KEYS */;
INSERT INTO `regions` VALUES ('reg-branch','Kantor Cabang Kendari','branch','Kendari, Sulawesi Tenggara','KC-KDI','2026-10-17 07:54:04'),('reg-ho','Kantor Pusat Makassar','head_office','Makassar, Sulawesi Selatan','KP-MKS','2026-10-17 07:54:04'),('reg-mine-1','Tambang Kolaka (Blok Pomalaa)','mine','Kolaka, Sulawesi Tenggara','TB-KLK','2026-10-17 07:54:04'),('reg-mine-2','Tambang Morowali (Blok Bahodopi)','mine','Morowali, Sulawesi Tengah','TB-MRW','2026-10-17 07:54:04'),('reg-mine-3','Tambang Sorowako (Blok Petea)','mine','Luwu Timur, Sulawesi Selatan','TB-SRW','2026-10-17 07:54:04'),('reg-mine-4','Tambang Konawe Utara (Blok Mandiodo)','mine','Konawe Utara, Sulawesi Tenggara','TB-KNU','2026-10-17 07:54:04'),('reg-mine-5','Tambang Halmahera Timur (Blok Buli)','mine','Halmahera Timur, Maluku Utara','TB-HLM','2026-10-17 07:54:04'),('reg-mine-6','Tambang Morowali Utara (Blok Petasia)','mine','Morowali Utara, Sulawesi Tengah','TB-MRU','2026-10-17 07:54:04');
/*!40000 ALTER TABLE `regions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_schedules`
--

DROP TABLE IF EXISTS `service_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_schedules` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_at` date NOT NULL,
  `service_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `cost_est` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('planned','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'planned',
  `completed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_service_vehicle` (`vehicle_id`),
  CONSTRAINT `fk_service_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_schedules`
--

LOCK TABLES `service_schedules` WRITE;
/*!40000 ALTER TABLE `service_schedules` DISABLE KEYS */;
INSERT INTO `service_schedules` VALUES ('srv-1','veh-9','2026-10-18','Overhaul Mesin','Perbaikan hidrolik tipper dan kalibrasi turbo dump truck hauler 30 ton',18500000.00,'in_progress',NULL,'2026-10-17 07:54:04'),('srv-2','veh-1','2026-10-28','Servis Berkala','Servis rutin 50.000 KM (Ganti oli gardan, filter solar, spooring baling roda tambang)',2750000.00,'planned',NULL,'2026-10-17 07:54:04'),('srv-3','veh-6','2026-10-05','Ganti Ban Tambang','Penggantian 4 ban belakang tipe Lug Heavy Mining 11.00R20',14200000.00,'completed','2026-10-05 23:00:00','2026-10-17 07:54:04'),('srv-4','veh-3','2026-11-02','Inspeksi Rem & Kaki','Pengecekan brake shoe, suspensi daun, dan kelistrikan AC mikrobus',3400000.00,'planned',NULL,'2026-10-17 07:54:04');
/*!40000 ALTER TABLE `service_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','approver') COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_level` tinyint unsigned DEFAULT NULL COMMENT '1: Atasan Langsung, 2: GM Pool/Logistik',
  `region_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_users_region` (`region_id`),
  CONSTRAINT `fk_users_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('usr-admin','Budi Pratama, S.T.','admin','admin.pool@sekawan-nikel.co.id','f687136f47b0fa76a3a26df3bacbfa89ab46c06c71a42ab582b3e8f03e75adbddc0e7ec78ed43a99ee040a0984bfb63e67cb087d9fb2e7767c0d9e8a35804a32','admin',NULL,'reg-ho','Fleet & Pool Administrator','BP','2026-10-17 07:54:04'),('usr-appr1','Ir. Hendra Gunawan','approver1','hendra.gunawan@sekawan-nikel.co.id','f687136f47b0fa76a3a26df3bacbfa89ab46c06c71a42ab582b3e8f03e75adbddc0e7ec78ed43a99ee040a0984bfb63e67cb087d9fb2e7767c0d9e8a35804a32','approver',1,'reg-mine-1','Kepala Divisi Operasional Tambang (Approver L1)','HG','2026-10-17 07:54:04'),('usr-appr2','Bambang Soedirjo, M.T.','approver2','bambang.soedirjo@sekawan-nikel.co.id','f687136f47b0fa76a3a26df3bacbfa89ab46c06c71a42ab582b3e8f03e75adbddc0e7ec78ed43a99ee040a0984bfb63e67cb087d9fb2e7767c0d9e8a35804a32','approver',2,'reg-ho','General Manager Pool & Logistik Tambang (Approver L2)','BS','2026-10-17 07:54:04');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plate_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` enum('people','goods') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Orang vs Barang',
  `ownership` enum('owned','rented') COLLATE utf8mb4_unicode_ci NOT NULL,
  `rental_company` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `region_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `odometer` int unsigned NOT NULL DEFAULT '0',
  `status` enum('available','in_use','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `fuel_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Solar / Dex',
  `fuel_capacity` int unsigned NOT NULL DEFAULT '80',
  `seat_capacity` int unsigned DEFAULT NULL,
  `cargo_capacity_tons` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `plate_number` (`plate_number`),
  KEY `fk_vehicles_region` (`region_id`),
  CONSTRAINT `fk_vehicles_region` FOREIGN KEY (`region_id`) REFERENCES `regions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES ('veh-1','DD 8421 MN','Toyota Hilux 4x4 Double Cabin E','Hilux D-Cab 2.4 V 4x4','people','owned',NULL,'reg-mine-1',48250,'available','Solar / Dex',80,5,NULL,'2026-10-17 07:54:04'),('veh-10','DG 7122 NK','Toyota Fortuner 4x4 Safety Patrol','Fortuner 2.8 VRZ 4x4 HSE Rescue','people','owned',NULL,'reg-mine-5',31050,'available','Solar / Dex',80,7,NULL,'2026-10-17 07:54:04'),('veh-11','DT 8301 CB','Isuzu Elf NQR 71 Microbus Crew Shift','Elf NQR 71 29 Seat Mining Bus','people','rented','PT Sulawesi Rental Armada','reg-mine-6',45600,'available','Solar / Dex',100,29,NULL,'2026-10-17 07:54:04'),('veh-12','DD 9912 HG','Scania P380 Heavy Mining Tipper','Scania P380 XT 6x4 Nickel Ore Body','goods','owned',NULL,'reg-mine-3',61500,'available','Solar / Dex',350,NULL,35,'2026-10-17 07:54:04'),('veh-2','DT 9012 NA','Mitsubishi Triton HD-X 4WD','Triton Single/Double Cab 4x4 Site Spec','people','owned',NULL,'reg-mine-2',32410,'in_use','Solar / Dex',75,5,NULL,'2026-10-17 07:54:04'),('veh-3','DT 7145 NK','Toyota HiAce Commuter 16 Seat','HiAce Commuter 2.5 M/T Bus Karyawan','people','owned',NULL,'reg-mine-3',64200,'available','Solar / Dex',70,16,NULL,'2026-10-17 07:54:04'),('veh-4','B 9234 XKA','Isuzu D-Max 4x4 Heavy Duty','D-Max Rodeo 1.9 Ddi BluePower','people','rented','PT Rentalindo Mandiri Nusantara','reg-mine-4',28150,'available','Solar / Dex',76,5,NULL,'2026-10-17 07:54:04'),('veh-5','B 9811 MTR','Mitsubishi Pajero Sport 4x4 Dakar','Pajero Sport 4x4 Site VIP Inspection','people','rented','PT Trans Nusantara Perkasa','reg-ho',19800,'available','Solar / Dex',68,7,NULL,'2026-10-17 07:54:04'),('veh-6','DD 7701 TN','Hino Ranger 500 Dump Tipper FM 260 JD','Hino 500 Series 6x4 260PS Ore Tipper','goods','owned',NULL,'reg-mine-1',78900,'available','Solar / Dex',200,NULL,20,'2026-10-17 07:54:04'),('veh-7','DT 8820 TR','Isuzu Giga FVR 34 P Heavy Hauler','Giga 6-Wheel Heavy Nickel Cargo','goods','owned',NULL,'reg-mine-2',54120,'in_use','Solar / Dex',200,NULL,16,'2026-10-17 07:54:04'),('veh-8','DT 6321 LG','Mitsubishi Fuso Canter FE 74 HD Logistik','Colt Diesel Canter 125 PS Box Logistik','goods','owned',NULL,'reg-branch',89400,'available','Solar / Dex',100,NULL,8,'2026-10-17 07:54:04'),('veh-9','B 9043 ORN','Hino Profia 700 Ore Hauler 8x4','Hino 700 Heavy Mining 30 Ton Dump','goods','rented','PT Morowali Trans Logistik','reg-mine-2',42100,'maintenance','Solar / Dex',300,NULL,32,'2026-10-17 07:54:04');
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-17 14:54:14
