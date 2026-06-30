'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface LoanUser {
  name: string;
  nip: string | null;
}

interface Loan {
  id: number;
  user_id: string;
  nominal_pinjaman: number;
  bunga_persen: number;
  lama_angsuran_bulan: number;
  tanggal_pengajuan: string;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'berjalan' | 'lunas';
  alasan: string | null;
  users: LoanUser | null;
}

export default function AdminPinjaman() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal control
  const [processingLoan, setProcessingLoan] = useState<Loan | null>(null);
  const [approvalAction, setApprovalAction] = useState<'setujui' | 'tolak'>('setujui');
  const [bungaPersen, setBungaPersen] = useState('1.5');
  
  // Calculate first due date: default is 1 month from now
  const getDefaultDueDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  };
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState(getDefaultDueDate());
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('pinjaman')
        .select('*, users(name, nip)');

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('tanggal_pengajuan', { ascending: false });

      if (error) throw error;

      // Safe mapping & typing
      let formatted: Loan[] = (data || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        nominal_pinjaman: parseFloat(p.nominal_pinjaman) || 0,
        bunga_persen: parseFloat(p.bunga_persen) || 0,
        lama_angsuran_bulan: p.lama_angsuran_bulan,
        tanggal_pengajuan: p.tanggal_pengajuan,
        status: p.status,
        alasan: p.alasan,
        users: p.users ? { name: p.users.name, nip: p.users.nip } : null
      }));

      // Apply client-side search filter for user fields (due to outer join searching limitations in simple REST queries)
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        formatted = formatted.filter((l) => {
          const nameMatch = l.users?.name?.toLowerCase().includes(lowerSearch);
          const nipMatch = l.users?.nip?.toLowerCase().includes(lowerSearch);
          return nameMatch || nipMatch;
        });
      }

      setLoans(formatted);
    } catch (err: any) {
      console.error('Error fetching loans:', err);
      setErrorMsg('Gagal memuat data pinjaman: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLoans();
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTimeout(() => {
      fetchLoans();
    }, 50);
  };

  const handleOpenProcessModal = (loan: Loan) => {
    setProcessingLoan(loan);
    setApprovalAction('setujui');
    setBungaPersen('1.5');
    setTanggalJatuhTempo(getDefaultDueDate());
    setAlasanPenolakan('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processingLoan) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let updateData: any = {};

      if (approvalAction === 'setujui') {
        const interest = parseFloat(bungaPersen);
        if (isNaN(interest) || interest < 0) {
          throw new Error('Suku bunga tidak valid');
        }

        updateData = {
          status: 'berjalan',
          bunga_persen: interest,
          tanggal_jatuh_tempo: tanggalJatuhTempo,
          sisa_angsuran_bulan: processingLoan.lama_angsuran_bulan,
          updated_at: new Date().toISOString()
        };
      } else {
        updateData = {
          status: 'ditolak',
          alasan: alasanPenolakan || 'Ditolak oleh admin.',
          updated_at: new Date().toISOString()
        };
      }

      const { error } = await supabase
        .from('pinjaman')
        .update(updateData)
        .eq('id', processingLoan.id);

      if (error) throw error;

      setSuccessMsg(approvalAction === 'setujui' ? 'Pengajuan pinjaman berhasil disetujui.' : 'Pengajuan pinjaman telah ditolak.');
      setProcessingLoan(null);
      fetchLoans();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses pinjaman.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val).replace('IDR', 'Rp');
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Kelola Pinjaman Koperasi</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Pinjaman
              </li>
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
                placeholder="Cari nama guru atau NIP..." 
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
              <option value="menunggu">Menunggu Persetujuan</option>
              <option value="berjalan">Aktif/Berjalan</option>
              <option value="lunas">Lunas</option>
              <option value="ditolak">Ditolak</option>
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

      {/* Loans Table Card */}
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
                  <th>Nama Anggota</th>
                  <th>Nominal Pinjaman</th>
                  <th>Bunga</th>
                  <th>Tenor</th>
                  <th>Tgl Pengajuan</th>
                  <th>Status</th>
                  <th className="text-center pe-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan, index) => (
                  <tr key={loan.id}>
                    <td className="ps-4 text-muted">{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="profile-avatar bg-primary-subtle text-primary fw-semibold d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '0.95rem', borderRadius: '50%' }}>
                          {loan.users?.name ? loan.users.name.substring(0, 1).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h6 className="mb-0 text-dark fw-semibold small">{loan.users?.name || 'Anggota'}</h6>
                          <span className="xsmall text-muted">NIP: {loan.users?.nip || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="fw-bold text-dark">{formatRupiah(loan.nominal_pinjaman)}</td>
                    <td>{loan.bunga_persen}%</td>
                    <td>{loan.lama_angsuran_bulan} Bulan</td>
                    <td>{formatDateShort(loan.tanggal_pengajuan)}</td>
                    <td>
                      {loan.status === 'menunggu' && (
                        <span className="badge bg-warning-subtle text-warning px-2.5 py-1.5 rounded small">Menunggu</span>
                      )}
                      {loan.status === 'berjalan' && (
                        <span className="badge bg-primary-subtle text-primary px-2.5 py-1.5 rounded small">Berjalan</span>
                      )}
                      {loan.status === 'lunas' && (
                        <span className="badge bg-success-subtle text-success px-2.5 py-1.5 rounded small">Lunas</span>
                      )}
                      {loan.status === 'ditolak' && (
                        <span className="badge bg-danger-subtle text-danger px-2.5 py-1.5 rounded small">Ditolak</span>
                      )}
                    </td>
                    <td className="pe-4 text-center">
                      {loan.status === 'menunggu' ? (
                        <button 
                          className="btn btn-navy btn-sm px-3 py-1" 
                          onClick={() => handleOpenProcessModal(loan)}
                        >
                          <i className="fa-solid fa-gavel"></i> Proses
                        </button>
                      ) : (
                        <Link href={`/admin/pinjaman/${loan.id}`} className="btn btn-light btn-sm text-primary">
                          <i className="fa-solid fa-circle-info"></i> Detail
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}

                {loans.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-5 text-muted">
                      <i className="fa-regular fa-folder-open fa-3x mb-2 text-slate-400 d-block"></i>
                      <span>Tidak ditemukan pengajuan pinjaman.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROCESS APPROVAL MODAL */}
      {processingLoan && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-navy">Persetujuan Pinjaman</h5>
                <button type="button" className="btn-close" onClick={() => setProcessingLoan(null)}></button>
              </div>
              <form onSubmit={handleProcessSubmit}>
                <div className="modal-body py-3">
                  <div className="p-3 bg-light rounded-3 mb-3 text-start small">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Nama Anggota:</span>
                      <span className="fw-semibold text-dark">{processingLoan.users?.name}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Nominal Kredit:</span>
                      <span className="fw-bold text-dark">{formatRupiah(processingLoan.nominal_pinjaman)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Tenor Angsuran:</span>
                      <span className="fw-semibold text-dark">{processingLoan.lama_angsuran_bulan} Bulan</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Alasan Pengajuan:</span>
                      <span className="fw-semibold text-navy text-end ms-2">"{processingLoan.alasan || '-'}"</span>
                    </div>
                  </div>

                  {approvalAction === 'setujui' ? (
                    <div>
                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <label className="form-label small fw-medium">Suku Bunga Koperasi (% / Bulan)</label>
                          <input 
                            type="number" 
                            className="form-control" 
                            value={bungaPersen}
                            onChange={(e) => setBungaPersen(e.target.value)}
                            step="0.1" 
                            min="0" 
                            max="100" 
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-medium">Jatuh Tempo Cicilan I</label>
                          <input 
                            type="date" 
                            className="form-control" 
                            value={tanggalJatuhTempo}
                            onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-0">
                      <label className="form-label small fw-medium text-danger">Alasan Penolakan Pinjaman</label>
                      <textarea 
                        className="form-control border-danger" 
                        rows={3} 
                        value={alasanPenolakan}
                        onChange={(e) => setAlasanPenolakan(e.target.value)}
                        placeholder="Tulis alasan mengapa pengajuan ditolak..."
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0 pt-0 justify-content-between">
                  <button type="button" className="btn btn-light border" onClick={() => setProcessingLoan(null)}>Tutup</button>
                  <div className="d-flex gap-2">
                    {approvalAction === 'setujui' ? (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-outline-danger" 
                          onClick={() => setApprovalAction('tolak')}
                        >
                          Tolak
                        </button>
                        <button type="submit" className="btn btn-success px-4" disabled={isSubmitting}>
                          {isSubmitting ? 'Memproses...' : 'Setujui & Cairkan'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          type="button" 
                          className="btn btn-outline-secondary" 
                          onClick={() => setApprovalAction('setujui')}
                        >
                          Batalkan Penolakan
                        </button>
                        <button type="submit" className="btn btn-danger px-4" disabled={isSubmitting}>
                          {isSubmitting ? 'Mengirim...' : 'Kirim Penolakan'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
