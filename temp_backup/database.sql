-- Database: koperasi_guru
-- Schema designed for MySQL & Laravel migrations compatibility

CREATE DATABASE IF NOT EXISTS `koperasi_guru`;
USE `koperasi_guru`;

-- 1. Table: users (Stores admins and cooperative members/teachers)
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `email_verified_at` TIMESTAMP NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'anggota') NOT NULL DEFAULT 'anggota',
    `nip` VARCHAR(50) NULL UNIQUE,
    `address` TEXT NULL,
    `phone` VARCHAR(20) NULL,
    `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `remember_token` VARCHAR(100) NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: simpanan (Records member savings: Pokok, Wajib, Sukarela)
CREATE TABLE IF NOT EXISTS `simpanan` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `tipe_simpanan` ENUM('pokok', 'wajib', 'sukarela') NOT NULL,
    `nominal` DECIMAL(15, 2) NOT NULL,
    `tanggal_transaksi` DATE NOT NULL,
    `keterangan` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: pinjaman (Records loan applications, rates, and current status)
CREATE TABLE IF NOT EXISTS `pinjaman` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `nominal_pinjaman` DECIMAL(15, 2) NOT NULL,
    `bunga_persen` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `lama_angsuran_bulan` INT NOT NULL,
    `sisa_angsuran_bulan` INT NOT NULL,
    `tanggal_pengajuan` DATE NOT NULL,
    `tanggal_jatuh_tempo` DATE NULL,
    `status` ENUM('menunggu', 'disetujui', 'ditolak', 'berjalan', 'lunas') NOT NULL DEFAULT 'menunggu',
    `alasan` TEXT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: angsuran (Records installment payments for active loans)
CREATE TABLE IF NOT EXISTS `angsuran` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `pinjaman_id` BIGINT UNSIGNED NOT NULL,
    `angsuran_ke` INT NOT NULL,
    `nominal_bayar` DECIMAL(15, 2) NOT NULL,
    `tanggal_bayar` DATE NOT NULL,
    `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`pinjaman_id`) REFERENCES `pinjaman`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed initial data for testing
-- Default Admin: admin@koperasi.id / password: admin (hashed in production, plain for reference)
-- Default Anggota: guru@koperasi.id / password: guru
INSERT INTO `users` (`name`, `email`, `password`, `role`, `nip`, `address`, `phone`, `status`) 
VALUES 
('Administrator Koperasi', 'admin@koperasi.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, 'Kantor Tata Usaha Sekolah', '081234567890', 'aktif'),
('Budi Setiawan, S.Pd.', 'guru@koperasi.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anggota', '198503122010011002', 'Jl. Pendidikan No. 45, Bandung', '089876543210', 'aktif'),
('Siti Aminah, M.Pd.', 'siti@koperasi.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'anggota', '198807242014022001', 'Jl. Merdeka No. 12, Bandung', '081223344556', 'aktif');

-- Seed Savings
INSERT INTO `simpanan` (`user_id`, `tipe_simpanan`, `nominal`, `tanggal_transaksi`, `keterangan`)
VALUES 
(2, 'pokok', 500000.00, '2026-01-05', 'Simpanan Pokok Awal'),
(2, 'wajib', 100000.00, '2026-02-05', 'Simpanan Wajib Februari'),
(2, 'wajib', 100000.00, '2026-03-05', 'Simpanan Wajib Maret'),
(2, 'sukarela', 250000.00, '2026-03-10', 'Tabungan Sukarela Tambahan'),
(3, 'pokok', 500000.00, '2026-02-15', 'Simpanan Pokok Awal'),
(3, 'wajib', 100000.00, '2026-03-15', 'Simpanan Wajib Maret');

-- Seed Loans
INSERT INTO `pinjaman` (`user_id`, `nominal_pinjaman`, `bunga_persen`, `lama_angsuran_bulan`, `sisa_angsuran_bulan`, `tanggal_pengajuan`, `tanggal_jatuh_tempo`, `status`, `alasan`)
VALUES
(2, 5000000.00, 1.50, 10, 8, '2026-02-01', '2026-12-01', 'berjalan', 'Biaya perbaikan rumah'),
(3, 3000000.00, 1.50, 6, 6, '2026-03-20', '2026-09-20', 'menunggu', 'Biaya pendidikan anak');

-- Seed Installments
INSERT INTO `angsuran` (`pinjaman_id`, `angsuran_ke`, `nominal_bayar`, `tanggal_bayar`)
VALUES
(1, 1, 575000.00, '2026-03-01'), -- (500000 pokok + 75000 bunga)
(1, 2, 575000.00, '2026-04-01');
