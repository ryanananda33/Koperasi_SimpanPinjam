'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

export default function LandingPage() {
  const { user, profile } = useAuth();
  const [tailwindLoaded, setTailwindLoaded] = useState(false);

  const dashboardUrl = profile?.role === 'admin' ? '/admin/dashboard' : '/anggota/dashboard';

  // Dynamically load Tailwind CDN on client mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).tailwind) {
      const script = document.createElement('script');
      script.src = 'https://cdn.tailwindcss.com';
      script.onload = () => {
        // Configure tailwind after load
        (window as any).tailwind.config = {
          darkMode: 'media',
          theme: {
            extend: {
              fontFamily: {
                sans: ['"Plus Jakarta Sans"', 'sans-serif'],
              },
            }
          }
        };
        setTailwindLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setTailwindLoaded(true);
    }
  }, []);

  // Also inject the Google Font
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existing = document.getElementById('plus-jakarta-font');
      if (!existing) {
        const link = document.createElement('link');
        link.id = 'plus-jakarta-font';
        link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    }
  }, []);

  if (!tailwindLoaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 500 }}>Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
          background-color: #f8fafc;
        }
        .glassmorphism {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .dark .glassmorphism {
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
      `}} />

      <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-300 overflow-x-hidden font-sans">
        
        {/* Navigation */}
        <nav className="sticky top-0 z-50 glassmorphism border-b border-slate-200/50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20">
              {/* Brand/Logo */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl shadow-md shadow-emerald-500/20 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253M12 4v16m0-16V3" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l3-3 3 3" />
                  </svg>
                </div>
                <div>
                  <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Koperasi<span className="text-emerald-600">Guru</span>
                  </span>
                  <span className="block text-[10px] sm:text-xs font-semibold text-slate-500 tracking-wider uppercase leading-none">Sistem Informasi</span>
                </div>
              </div>

              {/* Navigation Menu (Desktop) */}
              <div className="hidden md:flex items-center gap-8">
                <a href="#fitur" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Fitur</a>
                <a href="#keunggulan" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Keunggulan</a>
                <a href="#kontak" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Kontak</a>
              </div>

              {/* CTA Buttons / Auth Status */}
              <div className="flex items-center gap-3">
                {user ? (
                  <Link href={dashboardUrl} className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-600/30 transition-all duration-300 hover:-translate-y-0.5 group">
                    <span>Dashboard</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-all">
                      Masuk
                    </Link>
                    <Link href="/register" className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all duration-300">
                      Daftar Anggota
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-8 pb-16 sm:py-24 md:py-32 overflow-hidden">
          {/* Background Decorative Blobs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Content Left (7 Columns) */}
              <div className="lg:col-span-7 text-center lg:text-left space-y-6 sm:space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs sm:text-sm font-semibold border border-emerald-500/20">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Sistem Informasi Koperasi Digital Terpercaya</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] sm:leading-none">
                  Sistem Informasi <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent">Koperasi Guru</span>
                </h1>

                {/* Description */}
                <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                  Platform digital modern untuk mengelola simpanan, pinjaman, data anggota, serta seluruh transaksi keuangan Koperasi Guru secara terintegrasi, transparan, aman, dan mudah diakses.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  {user ? (
                    <Link href={dashboardUrl} className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/35 transition-all duration-300 hover:-translate-y-1">
                      Dashboard Utama
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-600/35 transition-all duration-300 hover:-translate-y-1">
                        Masuk ke Portal
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </Link>
                      <Link href="/register" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1">
                        Registrasi Anggota
                      </Link>
                    </>
                  )}
                </div>

                {/* Stats Highlights */}
                <div className="grid grid-cols-3 gap-4 pt-6 max-w-md mx-auto lg:mx-0 border-t border-slate-200/60">
                  <div>
                    <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aman & Terenkripsi</span>
                  </div>
                  <div className="border-x border-slate-200/60 px-2">
                    <span className="block text-2xl sm:text-3xl font-extrabold text-teal-600">Real-Time</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Informasi Saldo</span>
                  </div>
                  <div>
                    <span className="block text-2xl sm:text-3xl font-extrabold text-amber-500">Paperless</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanpa Dokumen Fisik</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual Right (5 Columns) */}
              <div className="lg:col-span-5 relative w-full max-w-md lg:max-w-none mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-3xl filter blur-2xl -z-10"></div>
                
                <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-6 transition-all duration-300 relative overflow-hidden group hover:border-emerald-500/30">
                  
                  {/* Header Mockup */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-xs text-emerald-600">
                        KG
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Kartu Dashboard Anggota</div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Koperasi Guru Mandiri</div>
                      </div>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  </div>

                  {/* Balance Card Mockup */}
                  <div className="mt-4 p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl"></div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Simpanan Guru</span>
                    <span className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 block">Rp 24.580.000</span>
                    <div className="flex justify-between items-center mt-4 text-[10px] text-slate-400">
                      <span>No. Anggota: KPG-202604</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">Aktif</span>
                    </div>
                  </div>

                  {/* Financial Mini Chart SVG */}
                  <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-slate-700">Grafik Simpanan (1 Tahun)</span>
                      <span className="text-[10px] font-semibold text-emerald-600">+12.5% SHU</span>
                    </div>
                    <svg viewBox="0 0 100 35" className="w-full h-16 text-emerald-500" fill="none" stroke="currentColor">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(16,185,129,0.3)"/>
                          <stop offset="100%" stopColor="rgba(16,185,129,0)"/>
                        </linearGradient>
                      </defs>
                      <path d="M 0 30 Q 15 28 25 18 T 50 15 T 75 8 T 100 2" strokeWidth="2" strokeLinecap="round" />
                      <path d="M 0 30 Q 15 28 25 18 T 50 15 T 75 8 T 100 2 L 100 35 L 0 35 Z" fill="url(#chartGrad)" stroke="none" />
                      <circle cx="25" cy="18" r="1.5" fill="#10b981" />
                      <circle cx="50" cy="15" r="1.5" fill="#10b981" />
                      <circle cx="75" cy="8" r="1.5" fill="#10b981" />
                      <circle cx="100" cy="2" r="2.5" fill="#10b981" />
                    </svg>
                  </div>

                  {/* List of Recent Transactions */}
                  <div className="mt-4 space-y-2.5">
                    <span className="text-xs font-bold text-slate-700 block">Aktivitas Terakhir</span>
                    
                    {/* Trx 1 */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-800">Setoran Simpanan Wajib</div>
                          <div className="text-[9px] text-slate-400">Hari ini, 08:30</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">+Rp 100.000</span>
                    </div>

                    {/* Trx 2 */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-slate-800">Pembayaran Cicilan Pinjaman</div>
                          <div className="text-[9px] text-slate-400">Kemarin, 14:15</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">-Rp 750.000</span>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="absolute -right-3 top-28 bg-emerald-500 text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce border border-emerald-400/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-[10px] font-bold tracking-wide uppercase">100% Aman</span>
                  </div>

                  <div className="absolute -left-4 bottom-24 bg-amber-500 text-slate-900 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce border border-amber-400/20">
                    <span className="text-[10px] font-extrabold tracking-wide uppercase">Bunga Rendah</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="py-20 sm:py-28 bg-white transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-600">Fitur Utama</h2>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Layanan Koperasi Digital Kami</h3>
              <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed">
                Kami menyediakan empat pilar fitur utama untuk memudahkan seluruh transaksi simpan-pinjam dan pengelolaan data administrasi para guru.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
              
              {/* Fitur 1: Data Anggota */}
              <div className="group bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/50 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-extrabold text-slate-800 mb-3">Manajemen Data Anggota</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Pendaftaran secara online yang praktis. Pengurus dapat memverifikasi berkas, mengelola profil guru, dan memantau keaktifan anggota secara digital.
                </p>
              </div>

              {/* Fitur 2: Simpanan */}
              <div className="group bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/50 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-extrabold text-slate-800 mb-3">Simpanan</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Pencatatan transparan untuk Simpanan Pokok, Simpanan Wajib, dan Simpanan Sukarela. Anggota dapat melihat mutasi dan perkembangan tabungan real-time.
                </p>
              </div>

              {/* Fitur 3: Pinjaman */}
              <div className="group bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/50 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-extrabold text-slate-800 mb-3">Pinjaman</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Kalkulator pengajuan cicilan otomatis, pengajuan pinjaman online secara efisien, serta transparansi bunga dan riwayat sisa cicilan anggota.
                </p>
              </div>

              {/* Fitur 4: Laporan */}
              <div className="group bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200/50 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1.5 transition-all duration-300">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-extrabold text-slate-800 mb-3">Laporan</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                  Laporan keuangan kas koperasi bulanan, grafik profitabilitas, data sisa hasil usaha (SHU), dan transparansi laporan tahunan bagi anggota.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Advantages Section */}
        <section id="keunggulan" className="py-20 sm:py-28 relative overflow-hidden bg-slate-50 transition-colors duration-300">
          <div className="absolute -right-40 top-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              {/* Left Columns (Visual Presentation) */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="absolute inset-0 bg-emerald-500/10 filter blur-3xl rounded-full -z-10"></div>
                
                <div className="p-8 sm:p-12 bg-white rounded-3xl shadow-xl border border-slate-200/50 max-w-sm text-center relative overflow-hidden group hover:border-emerald-500/20">
                  <div className="absolute -top-16 -right-16 w-32 h-32 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors"></div>
                  
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-extrabold text-slate-800 mb-2">Transparan & Aman</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Sistem kami memastikan semua proses keuangan terverifikasi otomatis dengan standard enkripsi terkini demi keamanan dana anggota.
                  </p>
                  
                  <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-full">
                    Verified Secure
                  </div>
                </div>
              </div>

              {/* Right Columns (Advantages Grid) */}
              <div className="lg:col-span-7 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-600">Keunggulan Sistem</h2>
                  <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Kelebihan Menggunakan Aplikasi Kami</h3>
                  <p className="text-slate-500 font-medium text-base sm:text-lg leading-relaxed">
                    Sistem Informasi Koperasi Guru dirancang untuk memberikan kemudahan pelayanan simpan pinjam digital yang transparan dan dapat dipantau langsung.
                  </p>
                </div>

                {/* Advantages Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                  
                  {/* Poin 1 */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500/20 text-emerald-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-slate-800">Transparan & Real-Time</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      Setiap nominal setoran simpanan atau potongan cicilan pinjaman tercatat instan pada profil dashboard Anda secara terbuka.
                    </p>
                  </div>

                  {/* Poin 2 */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500/20 text-emerald-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-slate-800">Keamanan Enkripsi Data</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      Keamanan transaksi terlindungi enkripsi end-to-end untuk memastikan privasi serta kerahasiaan nominal dana simpanan guru tetap aman.
                    </p>
                  </div>

                  {/* Poin 3 */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500/20 text-emerald-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-slate-800">Akses Fleksibel & Cepat</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      Dapat diakses kapan saja dan di mana saja melalui browser ponsel, tablet, maupun laptop secara cepat dan sangat responsif.
                    </p>
                  </div>

                  {/* Poin 4 */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500/20 text-emerald-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-slate-800">Paperless & Efisien</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                      Kurangi penumpukan berkas fisik. Seluruh pengajuan pinjaman dan persetujuan pengurus dilakukan secara online dan efisien.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="kontak" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pb-12 border-b border-slate-800">
              
              {/* Left Col (Brand) */}
              <div className="space-y-4 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2.5">
                  <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253M12 4v16m0-16V3" />
                    </svg>
                  </div>
                  <span className="font-extrabold text-lg text-white tracking-tight">Koperasi<span className="text-emerald-500">Guru</span></span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-sm mx-auto md:mx-0">
                  Sistem portal digital untuk mewujudkan tata kelola keuangan koperasi guru yang kredibel, aman, terpercaya, dan menyejahterakan anggota secara merata.
                </p>
              </div>

              {/* Center Col (Quick Links) */}
              <div className="text-center md:text-left space-y-4">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Akses Navigasi</h4>
                <ul className="space-y-2.5 text-xs sm:text-sm font-semibold">
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Beranda</a></li>
                  <li><a href="#fitur" className="hover:text-emerald-500 transition-colors">Fitur Utama</a></li>
                  <li><a href="#keunggulan" className="hover:text-emerald-500 transition-colors">Keunggulan Sistem</a></li>
                </ul>
              </div>

              {/* Right Col (Contact) */}
              <div className="text-center md:text-left space-y-4">
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">Hubungi Kami</h4>
                <ul className="space-y-3 text-xs sm:text-sm font-medium">
                  <li className="flex items-center justify-center md:justify-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>kontak@koperasiguru.org</span>
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>(021) 8765-4321</span>
                  </li>
                  <li className="flex items-start justify-center md:justify-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="max-w-[220px]">Gedung Guru Indonesia Lt. 2, Jl. Pendidikan No. 45, Jakarta</span>
                  </li>
                </ul>
              </div>

            </div>

            {/* Bottom Footer */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-xs text-slate-600">
              <p>&copy; 2026 Koperasi Guru Indonesia. Hak Cipta Dilindungi.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:underline">Syarat & Ketentuan</a>
                <a href="#" className="hover:underline">Kebijakan Privasi</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
