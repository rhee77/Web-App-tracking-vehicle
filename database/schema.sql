CREATE DATABASE IF NOT EXISTS `vehicle_booking`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `vehicle_booking`;

CREATE TABLE IF NOT EXISTS `regions` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `type` ENUM('head_office', 'branch', 'mine') NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(150) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'approver') NOT NULL,
    `approval_level` TINYINT UNSIGNED NULL,
    `region_id` VARCHAR(50) NULL,
    `position` VARCHAR(150) NOT NULL,
    `avatar` VARCHAR(10) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_region` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `vehicles` (
    `id` VARCHAR(50) PRIMARY KEY,
    `plate_number` VARCHAR(20) NOT NULL UNIQUE,
    `name` VARCHAR(150) NOT NULL,
    `model` VARCHAR(150) NOT NULL,
    `category` ENUM('people', 'goods') NOT NULL,
    `ownership` ENUM('owned', 'rented') NOT NULL,
    `rental_company` VARCHAR(150) NULL,
    `region_id` VARCHAR(50) NOT NULL,
    `odometer` INT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('available', 'in_use', 'maintenance') NOT NULL DEFAULT 'available',
    `fuel_type` VARCHAR(50) DEFAULT 'Solar / Dex',
    `fuel_capacity` INT UNSIGNED NOT NULL DEFAULT 80,
    `seat_capacity` INT UNSIGNED NULL,
    `cargo_capacity_tons` INT UNSIGNED NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_vehicles_region` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `drivers` (
    `id` VARCHAR(50) PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `license_number` VARCHAR(50) NOT NULL UNIQUE,
    `license_type` ENUM('SIM A', 'SIM B1', 'SIM B2 Umum') NOT NULL,
    `region_id` VARCHAR(50) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `status` ENUM('available', 'on_duty') NOT NULL DEFAULT 'available',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_drivers_region` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `bookings` (
    `id` VARCHAR(50) PRIMARY KEY,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `vehicle_id` VARCHAR(50) NOT NULL,
    `driver_id` VARCHAR(50) NOT NULL,
    `created_by_id` VARCHAR(50) NOT NULL,
    `created_by_name` VARCHAR(150) NOT NULL,
    `department` VARCHAR(100) NOT NULL,
    `start_at` DATETIME NOT NULL,
    `end_at` DATETIME NOT NULL,
    `destination` VARCHAR(255) NOT NULL,
    `purpose` TEXT NOT NULL,
    `region_id` VARCHAR(50) NOT NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    `start_odometer` INT UNSIGNED NULL,
    `end_odometer` INT UNSIGNED NULL,
    `fuel_filled_liters` DECIMAL(8,2) NULL,
    `fuel_cost` DECIMAL(12,2) NULL,
    `cancellation_reason` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`),
    CONSTRAINT `fk_bookings_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`),
    CONSTRAINT `fk_bookings_creator` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`),
    CONSTRAINT `fk_bookings_region` FOREIGN KEY (`region_id`) REFERENCES `regions`(`id`),
    INDEX `idx_booking_schedule` (`vehicle_id`, `start_at`, `end_at`),
    INDEX `idx_booking_driver_schedule` (`driver_id`, `start_at`, `end_at`),
    INDEX `idx_booking_status` (`status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `booking_approvals` (
    `id` VARCHAR(50) PRIMARY KEY,
    `booking_id` VARCHAR(50) NOT NULL,
    `approver_id` VARCHAR(50) NOT NULL,
    `approver_name` VARCHAR(150) NOT NULL,
    `approver_position` VARCHAR(150) NOT NULL,
    `level` TINYINT UNSIGNED NOT NULL,
    `status` ENUM('waiting', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'waiting',
    `note` TEXT NULL,
    `acted_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_approval_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_approval_approver` FOREIGN KEY (`approver_id`) REFERENCES `users`(`id`),
    INDEX `idx_approver_status` (`approver_id`, `status`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `fuel_logs` (
    `id` VARCHAR(50) PRIMARY KEY,
    `vehicle_id` VARCHAR(50) NOT NULL,
    `booking_id` VARCHAR(50) NULL,
    `liters` DECIMAL(8,2) NOT NULL,
    `cost` DECIMAL(12,2) NOT NULL,
    `filled_at` DATETIME NOT NULL,
    `odometer` INT UNSIGNED NOT NULL,
    `fuel_station` VARCHAR(150) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_fuel_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`),
    CONSTRAINT `fk_fuel_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `service_schedules` (
    `id` VARCHAR(50) PRIMARY KEY,
    `vehicle_id` VARCHAR(50) NOT NULL,
    `scheduled_at` DATE NOT NULL,
    `service_type` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `cost_est` DECIMAL(12,2) NOT NULL DEFAULT 0,
    `status` ENUM('planned', 'in_progress', 'completed') NOT NULL DEFAULT 'planned',
    `completed_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_service_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` VARCHAR(50) PRIMARY KEY,
    `user_id` VARCHAR(50) NULL,
    `user_name` VARCHAR(150) NOT NULL,
    `role` VARCHAR(50) NOT NULL,
    `action` VARCHAR(50) NOT NULL,
    `category` ENUM('auth', 'booking', 'approval', 'vehicle', 'export', 'service') NOT NULL,
    `description` TEXT NOT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX `idx_activity_time` (`created_at`)
) ENGINE=InnoDB;
