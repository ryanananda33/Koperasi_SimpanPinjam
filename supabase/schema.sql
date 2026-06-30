-- ========================================================
-- SCHEMA & SEED FOR KOPERASI SIMPAN PINJAM GURU (SUPABASE)
-- ========================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and triggers if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.angsuran CASCADE;
DROP TABLE IF EXISTS public.pinjaman CASCADE;
DROP TABLE IF EXISTS public.simpanan CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Create public.users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'anggota' CHECK (role IN ('admin', 'anggota')),
    nip VARCHAR(50) UNIQUE,
    address TEXT,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'nonaktif')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable Row Level Security (RLS) to simplify demo deployment,
-- or configure it to allow public read/write since it is a local/demo sandbox.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Create public.simpanan table
CREATE TABLE public.simpanan (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tipe_simpanan VARCHAR(50) NOT NULL CHECK (tipe_simpanan IN ('pokok', 'wajib', 'sukarela', 'manasuka')),
    nominal DECIMAL(15,2) NOT NULL,
    tanggal_transaksi DATE NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.simpanan DISABLE ROW LEVEL SECURITY;

-- 3. Create public.pinjaman table
CREATE TABLE public.pinjaman (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    nominal_pinjaman DECIMAL(15,2) NOT NULL,
    bunga_persen DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    lama_angsuran_bulan INT NOT NULL,
    sisa_angsuran_bulan INT NOT NULL,
    tanggal_pengajuan DATE NOT NULL,
    tanggal_jatuh_tempo DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'disetujui', 'ditolak', 'berjalan', 'lunas')),
    alasan TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pinjaman DISABLE ROW LEVEL SECURITY;

-- 4. Create public.angsuran table
CREATE TABLE public.angsuran (
    id BIGSERIAL PRIMARY KEY,
    pinjaman_id BIGINT NOT NULL REFERENCES public.pinjaman(id) ON DELETE CASCADE,
    angsuran_ke INT NOT NULL,
    nominal_bayar DECIMAL(15,2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.angsuran DISABLE ROW LEVEL SECURITY;

-- 5. Trigger for automatically adding user profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role, nip, address, phone, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User Baru'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'anggota'),
    new.raw_user_meta_data->>'nip',
    new.raw_user_meta_data->>'address',
    new.raw_user_meta_data->>'phone',
    COALESCE(new.raw_user_meta_data->>'status', 'aktif')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

