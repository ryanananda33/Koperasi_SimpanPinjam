'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  nip: string | null;
  phone: string | null;
  status: 'aktif' | 'nonaktif';
  address: string | null;
  created_at: string;
  role: string;
}

interface SimpananTrx {
  id: number;
  tipe_simpanan: 'pokok' | 'wajib' | 'sukarela' | 'manasuka';
  nominal: number;
  tanggal_transaksi: string;
  keterangan: string | null;
}

interface PinjamanTrx {
  id: number;
  nominal_pinjaman: number;
  lama_angsuran_bulan: number;
  tanggal_pengajuan: string;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'berjalan' | 'lunas';
}

export default function AnggotaDetail({ params }: { params: { id: string } }) {
  const userId = params.id;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [simpanan, setSimpanan] = useState<SimpananTrx[]>([]);
  const [pinjaman, setPinjaman] = useState<PinjamanTrx[]>([]);
  const [activeTab, setActiveTab] = useState<'simpanan' | 'pinjaman'>('simpanan');
  const [errorMsg, setErrorMsg] = useState('');

  // Summaries
  const [pokok, setPokok] = useState(0);
  const [wajib, setWajib] = useState(0);
  const [sukarela, setSukarela] = useState(0);

  useEffect(() => {
    const fetchMemberDetail = async () => {
      try {
        setLoading(true);

        // 1. Fetch user biodata
        const { data: userData, error: userErr } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (userErr) throw userErr;
        setUser(userData as UserDetail);

        // 2. Fetch savings history
        const { data: simpananData, error: simpErr } = await supabase
          .from('simpanan')
          .select('*')
          .eq('user_id', userId)
          .order('tanggal_transaksi', { ascending: false });

        if (simpErr) throw simpErr;
        const mappedSimpanan = (simpananData || []).map((s: any) => ({
          ...s,
          nominal: parseFloat(s.nominal) || 0
        }));
        setSimpanan(mappedSimpanan);

        // Calculate summaries
        let sumPokok = 0;
        let sumWajib = 0;
        let sumSukarela = 0;

        mappedSimpanan.forEach((s) => {
          if (s.tipe_simpanan === 'pokok') {
            sumPokok += s.nominal;
          } else if (s.tipe_simpanan === 'wajib') {
            sumWajib += s.nominal;
          } else if (s.tipe_simpanan === 'sukarela' || s.tipe_simpanan === 'manasuka') {
            sumSukarela += s.nominal;
          }
        });

        setPokok(sumPokok);
        setWajib(sumWajib);
        setSukarela(sumSukarela);

        // 3. Fetch loans history
        const { data: pinjamanData, error: pinjErr } = await supabase
          .from('pinjaman')
          .select('*')
          .eq('user_id', userId)
          .order('tanggal_pengajuan', { ascending: false });

        if (pinjErr) throw pinjErr;
        setPinjaman((pinjamanData || []).map((p: any) => ({
          ...p,
          nominal_pinjaman: parseFloat(p.nominal_pinjaman) || 0
        })));

      } catch (err: any) {
        console.error('Error loading detail data:', err);
        setErrorMsg('Data anggota tidak ditemukan atau gagal dimuat: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchMemberDetail();
    }
  }, [userId]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val).replace('IDR', 'Rp');
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

  const formatDateShort = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading detail data...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !user) {
    return (
      <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4 mt-3">
        <i className="fa-solid fa-circle-exclamation fa-2x mb-3 d-block"></i>
        <h5>Gagal Memuat Detail</h5>
        <p className="small mb-4">{errorMsg || 'Data anggota tidak ditemukan.'}</p>
        <Link href="/admin/anggota" className="btn btn-light border btn-sm">
          <i className="fa-solid fa-arrow-left"></i> Kembali ke List
        </Link>
      </div>
    );
  }

  const totalSimpanan = pokok + wajib + sukarela;

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Detail Anggota: {user.name}</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/admin/anggota">Anggota</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Detail
              </li>
            </ol>
          </nav>
        </div>
        <Link href="/admin/anggota" className="btn btn-light border d-flex align-items-center gap-2">
          <i className="fa-solid fa-arrow-left"></i> Kembali ke List
        </Link>
      </div>

      <div className="row g-4">
        {/* Sidebar Profile Card */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-center mb-4 bg-white">
            <div 
              className="profile-avatar bg-navy text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold" 
              style={{ width: '80px', height: '80px', fontSize: '2.2rem', borderRadius: '50%' }}
            >
              {user.name.substring(0, 1).toUpperCase()}
            </div>
            <h5 className="fw-bold text-dark mb-1">{user.name}</h5>
            <span className="badge bg-secondary-subtle text-secondary px-3 py-1.5 rounded-pill mb-4">
              {user.nip ? `NIP: ${user.nip}` : 'NIP: -'}
            </span>
            
            <div className="text-start">
              <span className="text-muted xsmall uppercase fw-semibold mb-3 d-block border-bottom pb-1">
                Biodata Anggota
              </span>
              <div className="mb-3">
                <label className="text-muted small d-block">Status Keanggotaan</label>
                {user.status === 'aktif' ? (
                  <span className="badge bg-success-subtle text-success px-2.5 py-1.5 rounded small">
                    <i className="fa-solid fa-circle-check me-1"></i> Aktif
                  </span>
                ) : (
                  <span className="badge bg-danger-subtle text-danger px-2.5 py-1.5 rounded small">
                    <i className="fa-solid fa-circle-xmark me-1"></i> Nonaktif
                  </span>
                )}
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">Email</label>
                <span className="small text-dark fw-medium">{user.email}</span>
              </div>
              <div className="mb-3">
                <label className="text-muted small d-block">WhatsApp / Telp</label>
                <span className="small text-dark fw-medium">{user.phone || '-'}</span>
              </div>
              <div className="mb-0">
                <label className="text-muted small d-block">Alamat Tinggal</label>
                <span className="small text-dark fw-medium">{user.address || '-'}</span>
              </div>
            </div>
          </div>
          
          {/* Account Savings Aggregate Summary */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <span className="text-muted xsmall uppercase fw-semibold mb-3 d-block border-bottom pb-1">
              Ringkasan Tabungan
            </span>
            <div className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  <i className="fa-solid fa-circle text-primary me-2 xsmall"></i> Simpanan Pokok
                </span>
                <span className="small fw-semibold text-dark">{formatRupiah(pokok)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  <i className="fa-solid fa-circle text-success me-2 xsmall"></i> Simpanan Wajib
                </span>
                <span className="small fw-semibold text-dark">{formatRupiah(wajib)}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  <i className="fa-solid fa-circle text-warning me-2 xsmall"></i> Simpanan Sukarela
                </span>
                <span className="small fw-semibold text-dark">{formatRupiah(sukarela)}</span>
              </div>
              <hr className="my-1" />
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Total Saldo</span>
                <span className="fw-bold text-navy">{formatRupiah(totalSimpanan)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger & Loan tabs */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 bg-white">
            <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
              <ul className="nav nav-tabs border-bottom" id="memberTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link fw-semibold text-navy py-2.5 px-3 ${activeTab === 'simpanan' ? 'active' : ''}`}
                    onClick={() => setActiveTab('simpanan')}
                    type="button" 
                  >
                    <i className="fa-solid fa-piggy-bank me-2"></i> Mutasi Simpanan
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link fw-semibold text-navy py-2.5 px-3 ${activeTab === 'pinjaman' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pinjaman')}
                    type="button" 
                  >
                    <i className="fa-solid fa-clock-rotate-left me-2"></i> Riwayat Pinjaman
                  </button>
                </li>
              </ul>
            </div>
            
            <div className="tab-content p-4" id="memberTabsContent">
              
              {/* Panel: Savings Mutations */}
              {activeTab === 'simpanan' && (
                <div className="tab-pane fade show active">
                  <div className="table-responsive">
                    <table className="table custom-table align-middle mb-0">
                      <thead>
                        <tr className="table-light text-muted small">
                          <th>Tanggal</th>
                          <th>Tipe Simpanan</th>
                          <th>Nominal</th>
                          <th>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simpanan.map((s) => (
                          <tr key={s.id}>
                            <td>{formatDateShort(s.tanggal_transaksi)}</td>
                            <td>
                              {s.tipe_simpanan === 'pokok' && (
                                <span className="badge bg-primary-subtle text-primary text-xsmall uppercase px-2 py-1 rounded">Pokok</span>
                              )}
                              {s.tipe_simpanan === 'wajib' && (
                                <span className="badge bg-success-subtle text-success text-xsmall uppercase px-2 py-1 rounded">Wajib</span>
                              )}
                              {(s.tipe_simpanan === 'sukarela' || s.tipe_simpanan === 'manasuka') && (
                                <span className="badge bg-warning-subtle text-warning text-xsmall uppercase px-2 py-1 rounded">Sukarela</span>
                              )}
                            </td>
                            <td className="fw-semibold text-dark">{formatRupiah(s.nominal)}</td>
                            <td className="small text-muted">{s.keterangan || '-'}</td>
                          </tr>
                        ))}

                        {simpanan.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-5 text-muted">
                              <i className="fa-regular fa-folder-open fa-2x mb-2 text-slate-400 d-block"></i>
                              <span className="small">Belum ada transaksi simpanan tercatat.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* Panel: Loans History */}
              {activeTab === 'pinjaman' && (
                <div className="tab-pane fade show active">
                  <div className="table-responsive">
                    <table className="table custom-table align-middle mb-0">
                      <thead>
                        <tr className="table-light text-muted small">
                          <th>Tanggal</th>
                          <th>Plafon</th>
                          <th>Tenor</th>
                          <th>Status</th>
                          <th className="text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pinjaman.map((p) => (
                          <tr key={p.id}>
                            <td>{formatDateShort(p.tanggal_pengajuan)}</td>
                            <td className="fw-semibold text-dark">{formatRupiah(p.nominal_pinjaman)}</td>
                            <td>{p.lama_angsuran_bulan} bln</td>
                            <td>
                              {p.status === 'menunggu' && (
                                <span className="badge bg-warning-subtle text-warning text-xsmall uppercase px-2 py-1 rounded">Menunggu</span>
                              )}
                              {p.status === 'berjalan' && (
                                <span className="badge bg-primary-subtle text-primary text-xsmall uppercase px-2 py-1 rounded">Berjalan</span>
                              )}
                              {p.status === 'lunas' && (
                                <span className="badge bg-success-subtle text-success text-xsmall uppercase px-2 py-1 rounded">Lunas</span>
                              )}
                              {p.status === 'ditolak' && (
                                <span className="badge bg-danger-subtle text-danger text-xsmall uppercase px-2 py-1 rounded">Ditolak</span>
                              )}
                              {p.status === 'disetujui' && (
                                <span className="badge bg-info-subtle text-info text-xsmall uppercase px-2 py-1 rounded">Disetujui</span>
                              )}
                            </td>
                            <td className="text-center">
                              <Link 
                                href={`/admin/pinjaman/${p.id}`} 
                                className="btn btn-light btn-sm text-primary"
                              >
                                <i className="fa-solid fa-circle-info"></i> Rincian
                              </Link>
                            </td>
                          </tr>
                        ))}

                        {pinjaman.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center py-5 text-muted">
                              <i className="fa-regular fa-folder-open fa-2x mb-2 text-slate-400 d-block"></i>
                              <span className="small">Belum ada pengajuan pinjaman.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
