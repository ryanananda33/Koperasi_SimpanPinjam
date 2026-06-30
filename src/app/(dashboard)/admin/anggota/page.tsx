'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface AnggotaUser {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  phone: string | null;
  status: 'aktif' | 'nonaktif';
  address: string | null;
  created_at: string;
}

export default function KelolaAnggota() {
  const [members, setMembers] = useState<AnggotaUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newNip, setNewNip] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPassword, setNewPassword] = useState('guru123');
  const [newStatus, setNewStatus] = useState<'aktif' | 'nonaktif'>('aktif');

  const [editingUser, setEditingUser] = useState<AnggotaUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AnggotaUser | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'anggota');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,nip.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;
      setMembers(data as AnggotaUser[] || []);
    } catch (err: any) {
      setErrorMsg('Gagal memuat data anggota: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    // Fetch immediately
    setTimeout(() => {
      fetchMembers();
    }, 50);
  };

  // Create member submit
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/anggota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          nip: newNip,
          email: newEmail,
          phone: newPhone,
          address: newAddress,
          password: newPassword,
          status: newStatus
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat menambahkan anggota.');
      }

      setSuccessMsg('Anggota guru baru berhasil ditambahkan.');
      setShowCreateModal(false);
      
      // Reset form
      setNewName('');
      setNewNip('');
      setNewEmail('');
      setNewPhone('');
      setNewAddress('');
      setNewPassword('guru123');
      setNewStatus('aktif');

      fetchMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit modal
  const openEditModal = (user: AnggotaUser) => {
    setEditingUser(user);
    setErrorMsg('');
    setSuccessMsg('');
    setShowEditModal(true);
  };

  // Edit member submit
  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/anggota', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          nip: editingUser.nip,
          phone: editingUser.phone,
          status: editingUser.status,
          address: editingUser.address
        })
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat memperbarui anggota.');
      }

      setSuccessMsg('Data anggota berhasil diperbarui.');
      setShowEditModal(false);
      setEditingUser(null);
      fetchMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (user: AnggotaUser) => {
    setDeletingUser(user);
    setErrorMsg('');
    setSuccessMsg('');
    setShowDeleteModal(true);
  };

  // Delete member submit
  const handleDeleteMember = async () => {
    if (!deletingUser) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/anggota?id=${deletingUser.id}`, {
        method: 'DELETE'
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Terjadi kesalahan saat menghapus anggota.');
      }

      setSuccessMsg('Data anggota berhasil dihapus.');
      setShowDeleteModal(false);
      setDeletingUser(null);
      fetchMembers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Data Anggota Guru</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Anggota
              </li>
            </ol>
          </nav>
        </div>
        <button 
          className="btn btn-navy d-flex align-items-center gap-2" 
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setShowCreateModal(true);
          }}
        >
          <i className="fa-solid fa-user-plus"></i> Tambah Anggota Baru
        </button>
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

      {/* Filter & Search Card */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-start-0 ps-0" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan nama, NIP, atau email..." 
              />
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-3">
            <select 
              className="form-select bg-light" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="col-12 col-sm-6 col-md-4 d-flex gap-2">
            <button type="submit" className="btn btn-navy flex-fill">
              <i className="fa-solid fa-filter me-1"></i> Filter
            </button>
            <button type="button" onClick={handleReset} className="btn btn-light border flex-fill">
              <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Members Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table align-middle mb-0">
              <thead className="table-navy">
                <tr>
                  <th className="ps-4">No</th>
                  <th>Foto & Nama</th>
                  <th>NIP</th>
                  <th>Email</th>
                  <th>No. Telepon</th>
                  <th>Status</th>
                  <th className="text-center pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, index) => (
                  <tr key={member.id}>
                    <td className="ps-4 text-muted">{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="profile-avatar bg-primary-subtle text-primary fw-semibold d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', borderRadius: '50%' }}>
                          {member.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="mb-0 text-dark fw-semibold">{member.name}</h6>
                          <span className="xsmall text-muted">Status: {member.status}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="text-secondary">{member.nip || '-'}</code>
                    </td>
                    <td>{member.email}</td>
                    <td>{member.phone || '-'}</td>
                    <td>
                      {member.status === 'aktif' ? (
                        <span className="badge bg-success-subtle text-success px-2 py-1 rounded">Aktif</span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger px-2 py-1 rounded">Nonaktif</span>
                      )}
                    </td>
                    <td className="pe-4">
                      <div className="d-flex justify-content-center gap-2">
                        <Link 
                          href={`/admin/anggota/${member.id}`} 
                          className="btn btn-light btn-sm text-primary" 
                          title="Buku Tabungan & Pinjaman"
                        >
                          <i className="fa-solid fa-book-open"></i> Detail
                        </Link>
                        <button 
                          className="btn btn-light btn-sm text-secondary" 
                          onClick={() => openEditModal(member)}
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button 
                          className="btn btn-light btn-sm text-danger" 
                          onClick={() => openDeleteModal(member)}
                          title="Hapus"
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {members.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <i className="fa-regular fa-folder-open fa-3x mb-2 text-slate-400 d-block"></i>
                      <span>Tidak ditemukan data guru anggota.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MEMBER MODAL */}
      {showCreateModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-navy">Tambah Anggota Guru Baru</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateMember}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Nama Lengkap & Gelar</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Budi Setiawan, S.Pd." 
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">NIP (Nomor Induk Pegawai)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: 198503122010011002"
                      value={newNip}
                      onChange={(e) => setNewNip(e.target.value)}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-medium">No. HP (WhatsApp)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Contoh: 08987654321"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">Status Keanggotaan</label>
                      <select 
                        className="form-select" 
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as 'aktif' | 'nonaktif')}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Alamat Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="Contoh: guru@sekolah.sch.id" 
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Kata Sandi Default</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Sandi masuk awal" 
                      required 
                    />
                    <span className="xsmall text-muted mt-1 d-block">
                      <i className="fa-solid fa-circle-info me-1"></i> Bawaan sandi awal anggota baru adalah: <strong>guru123</strong>
                    </span>
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-medium">Alamat Rumah</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      placeholder="Tulis alamat tempat tinggal lengkap..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light border" onClick={() => setShowCreateModal(false)}>Tutup</button>
                  <button type="submit" className="btn btn-navy px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : 'Tambahkan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {showEditModal && editingUser && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-navy">Edit Biodata Guru</h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setEditingUser(null); }}></button>
              </div>
              <form onSubmit={handleEditMember}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Nama Lengkap & Gelar</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">NIP (Nomor Induk Pegawai)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingUser.nip || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, nip: e.target.value || null })}
                    />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-medium">No. HP (WhatsApp)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={editingUser.phone || ''}
                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value || null })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">Status Keanggotaan</label>
                      <select 
                        className="form-select" 
                        value={editingUser.status}
                        onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'aktif' | 'nonaktif' })}
                      >
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Alamat Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="mb-0">
                    <label className="form-label small fw-medium">Alamat Rumah</label>
                    <textarea 
                      className="form-control" 
                      rows={2} 
                      value={editingUser.address || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value || null })}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light border" onClick={() => { setShowEditModal(false); setEditingUser(null); }}>Batal</button>
                  <button type="submit" className="btn btn-navy px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && deletingUser && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-body text-center py-4">
                <div className="text-danger mb-3">
                  <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
                </div>
                <h5 className="fw-bold text-dark mb-2">Hapus Anggota?</h5>
                <p className="text-muted small mb-0">
                  Tindakan ini akan menghapus permanen data guru <strong>{deletingUser.name}</strong> beserta seluruh riwayat simpanan/pinjaman.
                </p>
              </div>
              <div className="modal-footer border-top-0 pt-0 justify-content-center">
                <button type="button" className="btn btn-light border px-3" onClick={() => { setShowDeleteModal(false); setDeletingUser(null); }}>Batal</button>
                <button 
                  type="button" 
                  className="btn btn-danger px-3" 
                  onClick={handleDeleteMember}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
