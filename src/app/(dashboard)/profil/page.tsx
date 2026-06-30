'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setNip(profile.nip || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
    }
  }, [profile]);

  if (!profile || !user) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. If email is changing, update auth.users
      if (email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email });
        if (emailError) throw emailError;
      }

      // 2. If password is set, update auth.users password
      if (password) {
        if (password.length < 6) {
          throw new Error('Kata sandi baru minimal harus 6 karakter!');
        }
        const { error: passError } = await supabase.auth.updateUser({ password });
        if (passError) throw passError;
      }

      // 3. Update public.users table
      const updateData: any = {
        name,
        email,
        phone,
        address,
        updated_at: new Date().toISOString(),
      };

      // Only admin can update NIP
      if (profile.role === 'admin') {
        updateData.nip = nip;
      }

      const { error: profileError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 4. Refresh profile and show success
      await refreshProfile();
      setSuccessMsg('Profil Anda berhasil diperbarui.');
      setPassword('');
      window.scrollTo(0, 0);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memperbarui profil.');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Pengaturan Profil Saya</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><a href="#" onClick={(e) => e.preventDefault()}>Home</a></li>
              <li className="breadcrumb-item active" aria-current="page">Profil</li>
            </ol>
          </nav>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-success border-0 small mb-4">
          <i className="fa-solid fa-circle-check me-1"></i> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger border-0 small mb-4">
          <i className="fa-solid fa-circle-exclamation me-1"></i> {errorMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Profile Card View */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
            <div 
              className="profile-avatar bg-navy text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" 
              style={{ width: '80px', height: '80px', fontSize: '2.2rem', borderRadius: '50%' }}
            >
              {profile.name ? profile.name.substring(0, 1).toUpperCase() : 'U'}
            </div>
            <h5 className="fw-bold text-dark mb-1">{profile.name}</h5>
            <span className="badge bg-secondary-subtle text-secondary px-3 py-1.5 rounded-pill mb-4">
              {profile.nip ? `NIP: ${profile.nip}` : 'NIP: -'}
            </span>
            
            <div className="text-start border-top pt-3 small">
              <div className="mb-2">
                <span className="text-muted d-block">Hak Akses:</span>
                <strong className="text-dark">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</strong>
              </div>
              <div className="mb-2">
                <span className="text-muted d-block">Status Akun:</span>
                <span className="badge bg-success-subtle text-success">
                  {profile.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="mb-0">
                <span className="text-muted d-block">Terdaftar Sejak:</span>
                <strong className="text-dark">{formatDate(profile.created_at)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-semibold text-navy mb-3 border-bottom pb-2">
              <i className="fa-solid fa-user-pen me-1"></i> Perbarui Informasi Personal
            </h5>
            
            <form onSubmit={handleUpdateProfile}>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">Nama Lengkap & Gelar</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">NIP (Nomor Induk Pegawai)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={nip} 
                    onChange={(e) => setNip(e.target.value)} 
                    readOnly={profile.role !== 'admin'} 
                  />
                  {profile.role !== 'admin' && (
                    <span className="xsmall text-muted mt-1 d-block">
                      <i className="fa-solid fa-circle-info me-1"></i> NIP hanya dapat diubah oleh administrator koperasi.
                    </span>
                  )}
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">Alamat Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-medium">No. Telepon / WhatsApp</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Alamat Lengkap Tinggal</label>
                <textarea 
                  className="form-control" 
                  rows={2} 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-medium">Ganti Kata Sandi (Kosongkan jika tidak ingin diubah)</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end">
                <button 
                  type="submit" 
                  className="btn btn-navy px-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  ) : null}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
