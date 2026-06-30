'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // 2. Fetch the corresponding profile from public.users to check status and role
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profileData) {
          console.error('Error fetching profile on login:', profileError);
          // Fallback if public profile is somehow missing
          router.push('/anggota/dashboard');
          return;
        }

        // 3. Check if active
        if (profileData.status !== 'aktif') {
          // Log out immediately
          await supabase.auth.signOut();
          setErrorMsg('Akun Anda dinonaktifkan. Hubungi admin.');
          setIsSubmitting(false);
          return;
        }

        // 4. Redirect based on role
        if (profileData.role === 'admin') {
          router.push('/admin/dashboard?success=Selamat+datang,+Administrator!');
        } else {
          router.push('/anggota/dashboard?success=Selamat+datang+di+Koperasi+Guru!');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message === 'Invalid login credentials' ? 'Email atau password salah!' : err.message);
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    // Trigger submit shortly
    setTimeout(() => {
      const form = document.getElementById('loginForm') as HTMLFormElement;
      if (form) form.requestSubmit();
    }, 100);
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
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            
            {/* Logo/Brand Header */}
            <div className="text-center mb-4">
              <div className="login-logo mx-auto mb-4" style={{ width: '80px', height: '80px', overflow: 'hidden' }}>
                <img src="/images/LOGO.png" alt="Logo Koperasi Guru" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <h4 className="fw-bold text-dark mb-1">
                Koperasi Guru
              </h4>
              <p className="text-muted small mb-0">
                Sistem Informasi Koperasi Simpan Pinjam Sekolah
              </p>
            </div>
            
            {/* Login Card */}
            <div className="card login-card border-0 shadow rounded-4 mb-4" style={{ backgroundColor: '#ffffff' }}>
              <div className="card-body p-5">
                <h5 className="fw-bold mb-1">
                  Selamat Datang Kembali
                </h5>
                <p className="text-muted small mb-4">
                  Silakan masuk menggunakan akun Anda.
                </p>
                
                {errorMsg && (
                  <div className="alert alert-danger border-0 small mb-3">
                    <i className="fa-solid fa-circle-exclamation me-1"></i> {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="alert alert-success border-0 small mb-3">
                    <i className="fa-solid fa-circle-check me-1"></i> {successMsg}
                  </div>
                )}

                <form onSubmit={handleLogin} id="loginForm">
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold" style={{ fontSize: '13px' }}>Alamat Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted"><i className="fa-solid fa-envelope"></i></span>
                      <input 
                        type="email" 
                        className="form-control bg-light border-start-0 py-2" 
                        id="email" 
                        name="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@sekolah.sch.id" 
                        required 
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold" style={{ fontSize: '13px' }}>Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="fa-solid fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-start-0 py-2" 
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ fontSize: '14px' }}
                        required
                      />
                    </div>
                  </div>
                                          
                  <button 
                    type="submit" 
                    className="btn btn-navy w-100 py-2 rounded-3 fw-semibold shadow-sm mb-3" 
                    style={{ fontSize: '15px' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      <i className="fa-solid fa-right-to-bracket me-2"></i>
                    )}
                    Masuk ke Sistem
                  </button>
                  
                  <div className="text-center" style={{ fontSize: '13px' }}>
                    <span className="text-muted">Belum terdaftar sebagai anggota?</span>
                    <Link href="/register" className="text-navy fw-semibold ms-1">Daftar di sini</Link>
                  </div>
                </form>
              </div>
            </div>
            
            {/* Quick Login Help */}
            <div className="card border-0 shadow rounded-4 p-4 bg-white">
              <span className="text-muted xsmall uppercase fw-semibold tracking-wider mb-3 d-block">Akun Demo</span>
              <div className="d-flex gap-2">
                <button 
                  type="button"
                  className="btn btn-outline-primary flex-fill rounded-3 py-2 small fw-medium text-nowrap" 
                  onClick={() => handleQuickLogin('admin@koperasi.id', 'admin123')}
                >
                  <i className="fa-solid fa-user-shield me-1"></i> Admin Koperasi
                </button>
                <button 
                  type="button"
                  className="btn btn-outline-success flex-fill rounded-3 py-2 small fw-medium text-nowrap" 
                  onClick={() => handleQuickLogin('guru@koperasi.id', 'guru123')}
                >
                  <i className="fa-solid fa-chalkboard-user me-1"></i> Anggota Guru
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
