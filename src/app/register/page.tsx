'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/anggota/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== passwordConfirmation) {
      setErrorMsg('Kata sandi dan konfirmasi kata sandi tidak cocok!');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi harus minimal 6 karakter!');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Check if email or NIP is already registered in public profiles
      const { data: existingEmail } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingEmail) {
        throw new Error('Alamat email sudah terdaftar!');
      }

      if (nip) {
        const { data: existingNip } = await supabase
          .from('users')
          .select('nip')
          .eq('nip', nip)
          .maybeSingle();

        if (existingNip) {
          throw new Error('NIP sudah terdaftar!');
        }
      }

      // 2. Sign up user via Supabase Auth with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            nip,
            address,
            phone,
            role: 'anggota',
            status: 'aktif',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        // Trigger automatically created public profile!
        // To be absolutely safe and since Supabase email confirmation might be disabled or enabled:
        // If email confirmation is disabled, user is immediately logged in.
        router.push('/anggota/dashboard?success=Pendaftaran+berhasil!+Selamat+datang+di+Koperasi+Guru.');
      } else {
        setErrorMsg('Pendaftaran gagal. Hubungi admin.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat pendaftaran.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate d-flex align-items-center justify-content-center min-vh-100 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6">
            
            {/* Logo/Brand Header */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-navy text-white p-3 rounded-4 shadow-sm mb-3">
                <i className="fa-solid fa-graduation-cap fa-2x text-sky"></i>
              </div>
              <h3 className="fw-bold text-navy mb-1">Daftar Anggota Koperasi</h3>
              <p className="text-muted small">Pendaftaran guru anggota baru koperasi simpan pinjam</p>
            </div>
            
            {/* Register Card */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: '#ffffff' }}>
              <h5 className="fw-semibold mb-3 text-dark">Formulir Registrasi</h5>
              
              {errorMsg && (
                <div className="alert alert-danger border-0 small mb-3">
                  <i className="fa-solid fa-circle-exclamation me-1"></i> {errorMsg}
                </div>
              )}

              <form onSubmit={handleRegister}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="name" className="form-label small fw-medium">Nama Lengkap & Gelar</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Ani Rahmawati, S.Pd." 
                      required 
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="nip" className="form-label small fw-medium">NIP (Nomor Induk Pegawai)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="nip" 
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder="Contoh: 19870425..." 
                      required 
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="email" className="form-label small fw-medium">Alamat Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      id="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="guru@sekolah.sch.id" 
                      required 
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="phone" className="form-label small fw-medium">Nomor HP / WhatsApp</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="phone" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567..." 
                      required 
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="password" className="form-label small fw-medium">Kata Sandi Baru</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter" 
                      required 
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label htmlFor="password_confirmation" className="form-label small fw-medium">Konfirmasi Kata Sandi</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      id="password_confirmation" 
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Ketik ulang sandi" 
                      required 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="address" className="form-label small fw-medium">Alamat Rumah Lengkap</label>
                  <textarea 
                    className="form-control" 
                    id="address" 
                    rows={2} 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Tulis alamat tinggal sekarang..." 
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-navy w-100 py-2.5 rounded-3 fw-semibold mb-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : (
                    <i className="fa-solid fa-user-plus me-2"></i>
                  )}
                  Daftar Sekarang
                </button>

                <div className="text-center small">
                  <span className="text-muted">Sudah terdaftar sebagai anggota?</span>
                  <Link href="/login" className="text-navy fw-semibold ms-1">Masuk di sini</Link>
                </div>
              </form>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
