'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Sub-component wrapped in Suspense to prevent build-time prerender bailouts
function SearchParamsToast({ setToastMessage }: { setToastMessage: (msg: { text: string; type: 'success' | 'error' } | null) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      setToastMessage({ text: success, type: 'success' });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (error) {
      setToastMessage({ text: error, type: 'error' });
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams, setToastMessage]);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, logout, switchRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check redirects based on auth loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Auto hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (loading || !user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const role = profile?.role || 'anggota';
  const name = profile?.name || user.email || 'User';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div id="app-container">
      <React.Suspense fallback={null}>
        <SearchParamsToast setToastMessage={setToastMessage} />
      </React.Suspense>
      {/* Sidebar Overlay (for Mobile) */}
      <div
        id="sidebar-overlay"
        className={`d-print-none ${sidebarOpen ? 'show-overlay' : ''}`}
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside id="sidebar" className={`d-print-none ${sidebarOpen ? 'show-sidebar' : ''}`}>
        <div className="brand">
          <i className="fa-solid fa-graduation-cap brand-logo"></i>
          <span className="brand-name">Koperasi Guru</span>
        </div>

        <ul className="menu-list">
          {role === 'admin' ? (
            <>
              {/* Admin Menu */}
              <li className="menu-item">
                <Link
                  href="/admin/dashboard"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname === '/admin/dashboard' ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-chart-line"></i>
                  <span>Dashboard Admin</span>
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  href="/admin/anggota"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname.startsWith('/admin/anggota') ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-users"></i>
                  <span>Data Anggota</span>
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  href="/admin/simpanan"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname.startsWith('/admin/simpanan') ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-wallet"></i>
                  <span>Kelola Simpanan</span>
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  href="/admin/pinjaman"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname.startsWith('/admin/pinjaman') ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-hand-holding-dollar"></i>
                  <span>Kelola Pinjaman</span>
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  href="/admin/laporan"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname === '/admin/laporan' ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-file-invoice-dollar"></i>
                  <span>Cetak Laporan</span>
                </Link>
              </li>
            </>
          ) : (
            <>
              {/* Member Menu */}
              <li className="menu-item">
                <Link
                  href="/anggota/dashboard"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname === '/anggota/dashboard' ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-house"></i>
                  <span>Dashboard Saya</span>
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  href="/anggota/simpanan"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname === '/anggota/simpanan' ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-piggy-bank"></i>
                  <span>Simpanan Saya</span>
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  href="/anggota/pinjaman"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname === '/anggota/pinjaman' ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-clock-rotate-left"></i>
                  <span>Pinjaman Saya</span>
                </Link>
              </li>
              <li className="menu-item">
                <Link
                  href="/anggota/pinjaman/ajukan"
                  onClick={closeSidebar}
                  className={`menu-link ${pathname === '/anggota/pinjaman/ajukan' ? 'active' : ''}`}
                >
                  <i className="fa-solid fa-file-signature"></i>
                  <span>Ajukan Pinjaman</span>
                </Link>
              </li>
            </>
          )}

          <li className="menu-item">
            <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '0.75rem 0' }} />
          </li>

          <li className="menu-item">
            <Link
              href="/profil"
              onClick={closeSidebar}
              className={`menu-link ${pathname === '/profil' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-user-gear"></i>
              <span>Profil Saya</span>
            </Link>
          </li>

          <li className="menu-item">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              className="menu-link text-danger"
            >
              <i className="fa-solid fa-right-from-bracket text-danger"></i>
              <span className="text-danger">Keluar</span>
            </a>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <div id="main-content">
        {/* Navbar */}
        <header id="top-navbar" className="d-print-none">
          <button className="toggle-sidebar-btn" id="toggleSidebar" onClick={toggleSidebar}>
            <i className="fa-solid fa-bars-staggered"></i>
          </button>

          <div className="d-none d-md-flex align-items-center ms-3">
            <span className="text-muted small">Sistem Informasi Simpan Pinjam Sekolah</span>
          </div>

          <div className="nav-right ms-auto">
            {/* Role Switcher Badge */}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                switchRole();
              }}
              className="role-switcher-badge text-decoration-none"
              title="Klik untuk beralih mode cepat"
            >
              {role === 'admin' ? (
                <>
                  <i className="fa-solid fa-shuffle"></i> Admin Mode
                </>
              ) : (
                <>
                  <i className="fa-solid fa-shuffle"></i> Anggota Mode
                </>
              )}
            </a>

            <div className="vr text-slate-300 mx-2 d-none d-sm-block" style={{ height: '24px' }}></div>

            {/* User Dropdown */}
            <div className="dropdown">
              <div
                className="nav-profile dropdown-toggle d-flex align-items-center gap-2"
                id="profileDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: 'pointer' }}
              >
                <div
                  className="profile-avatar bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                >
                  {name.substring(0, 1).toUpperCase()}
                </div>
                <div className="profile-info d-none d-sm-block">
                  <div className="profile-name text-start">{name}</div>
                  <div className="profile-role text-start">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </div>
                </div>
              </div>
              <ul className="dropdown-menu dropdown-menu-end border-0 shadow mt-2" aria-labelledby="profileDropdown">
                <li>
                  <Link className="dropdown-item" href="/profil">
                    <i className="fa-solid fa-circle-user me-2 text-muted"></i>Profil Saya
                  </Link>
                </li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li>
                  <a
                    className="dropdown-item text-danger"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                    }}
                  >
                    <i className="fa-solid fa-right-from-bracket me-2"></i>Keluar
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* Page Body Pane */}
        <main className="page-body">{children}</main>
      </div>

      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div
            className={`toast show align-items-center text-white border-0 shadow ${
              toastMessage.type === 'success' ? 'bg-success' : 'bg-danger'
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="d-flex">
              <div className="toast-body">
                {toastMessage.type === 'success' ? (
                  <i className="fa-solid fa-circle-check me-2"></i>
                ) : (
                  <i className="fa-solid fa-triangle-exclamation me-2"></i>
                )}
                {toastMessage.text}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToastMessage(null)}
                aria-label="Close"
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
