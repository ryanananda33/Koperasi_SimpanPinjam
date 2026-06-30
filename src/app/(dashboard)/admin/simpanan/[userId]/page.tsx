'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface UserDetail {
  id: string;
  name: string;
  nip: string | null;
}

interface SimpananTrx {
  id: number;
  tipe_simpanan: 'pokok' | 'wajib' | 'sukarela' | 'manasuka';
  nominal: number;
  tanggal_transaksi: string;
  keterangan: string | null;
}

export default function AdminSimpananDetail({ params }: { params: { userId: string } }) {
  const memberId = params.userId;

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [transactions, setTransactions] = useState<SimpananTrx[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Summaries
  const [wajib, setWajib] = useState(0);
  const [manasuka, setManasuka] = useState(0);
  const [total, setTotal] = useState(0);

  // Modal control
  const [deletingTrx, setDeletingTrx] = useState<SimpananTrx | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLedger = async () => {
    try {
      setLoading(true);

      // 1. Fetch User details
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id, name, nip')
        .eq('id', memberId)
        .single();

      if (userErr) throw userErr;
      setUser(userData as UserDetail);

      // 2. Fetch Simpanan transactions
      const { data: simpData, error: simpErr } = await supabase
        .from('simpanan')
        .select('*')
        .eq('user_id', memberId)
        .order('tanggal_transaksi', { ascending: false });

      if (simpErr) throw simpErr;

      const mapped = (simpData || []).map((s: any) => ({
        id: s.id,
        tipe_simpanan: s.tipe_simpanan,
        nominal: parseFloat(s.nominal) || 0,
        tanggal_transaksi: s.tanggal_transaksi,
        keterangan: s.keterangan
      }));

      setTransactions(mapped);

      // Calculate totals
      let sumWajib = 0;
      let sumManasuka = 0;
      let sumTotal = 0;

      mapped.forEach((s) => {
        sumTotal += s.nominal;
        if (s.tipe_simpanan === 'wajib') {
          sumWajib += s.nominal;
        } else if (s.tipe_simpanan === 'manasuka' || s.tipe_simpanan === 'sukarela') {
          sumManasuka += s.nominal;
        }
      });

      setWajib(sumWajib);
      setManasuka(sumManasuka);
      setTotal(sumTotal);

    } catch (err: any) {
      console.error('Error fetching savings ledger:', err);
      setErrorMsg('Gagal memuat detail ledger simpanan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId) {
      fetchLedger();
    }
  }, [memberId]);

  const handleDeleteTrx = async () => {
    if (!deletingTrx) return;
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase
        .from('simpanan')
        .delete()
        .eq('id', deletingTrx.id);

      if (error) throw error;

      setSuccessMsg('Transaksi simpanan berhasil dihapus.');
      setDeletingTrx(null);
      fetchLedger();
    } catch (err: any) {
      setErrorMsg('Gagal menghapus transaksi: ' + err.message);
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

  if (loading && !user) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading ledger data...</span>
        </div>
      </div>
    );
  }

  if (errorMsg && !user) {
    return (
      <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4 mt-3">
        <i className="fa-solid fa-circle-exclamation fa-2x mb-3 d-block"></i>
        <h5>Gagal Memuat Ledger</h5>
        <p className="small mb-4">{errorMsg}</p>
        <Link href="/admin/simpanan" className="btn btn-light border btn-sm">
          <i className="fa-solid fa-arrow-left"></i> Kembali ke Rekap
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Detail Simpanan: {user?.name}</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/admin/simpanan">Simpanan</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Detail Simpanan
              </li>
            </ol>
          </nav>
        </div>
        <Link href="/admin/simpanan" className="btn btn-light border d-flex align-items-center gap-2">
          <i className="fa-solid fa-arrow-left"></i> Kembali ke Rekap
        </Link>
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

      {/* Savings Ledger Summary Grid */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="xsmall text-muted d-block mb-1">Simpanan Wajib</span>
            <h5 className="fw-bold text-dark mb-0">{formatRupiah(wajib)}</h5>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-white text-center">
            <span className="xsmall text-muted d-block mb-1">Simpanan Manasuka</span>
            <h5 className="fw-bold text-dark mb-0">{formatRupiah(manasuka)}</h5>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm p-3 rounded-4 bg-navy text-center">
            <span className="xsmall text-white-50 d-block mb-1">Total Saldo Simpanan</span>
            <h5 className="fw-bold text-white mb-0">{formatRupiah(total)}</h5>
          </div>
        </div>
      </div>

      {/* Savings Mutation Ledger Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
        <h5 className="fw-semibold text-navy mb-3 border-bottom pb-2">
          <i className="fa-solid fa-receipt me-1"></i> Riwayat Transaksi Simpanan
        </h5>
        
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading transactions...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table custom-table align-middle mb-0">
              <thead>
                <tr className="table-light text-muted small">
                  <th>No</th>
                  <th>Tanggal Transaksi</th>
                  <th>Jenis Simpanan</th>
                  <th>Nominal</th>
                  <th>Keterangan</th>
                  <th className="text-center">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="text-muted small">{idx + 1}</td>
                    <td>{formatDateShort(s.tanggal_transaksi)}</td>
                    <td>
                      {s.tipe_simpanan === 'wajib' ? (
                        <span className="badge bg-success-subtle text-success text-xsmall uppercase px-2 py-1 rounded">
                          Wajib
                        </span>
                      ) : s.tipe_simpanan === 'pokok' ? (
                        <span className="badge bg-primary-subtle text-primary text-xsmall uppercase px-2 py-1 rounded">
                          Pokok
                        </span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning text-xsmall uppercase px-2 py-1 rounded">
                          Manasuka
                        </span>
                      )}
                    </td>
                    <td className="fw-bold text-dark">{formatRupiah(s.nominal)}</td>
                    <td className="small text-muted">{s.keterangan || '-'}</td>
                    <td className="text-center">
                      <button 
                        className="btn btn-light btn-sm text-danger" 
                        onClick={() => setDeletingTrx(s)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}

                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <i className="fa-regular fa-folder-open fa-2x mb-2 text-slate-400 d-block"></i>
                      <span className="small">Belum ada mutasi buku untuk guru ini.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deletingTrx && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-body text-center py-4">
                <div className="text-danger mb-3">
                  <i className="fa-solid fa-circle-exclamation fa-3x"></i>
                </div>
                <h6 className="fw-bold text-dark mb-2">Hapus Transaksi Simpanan?</h6>
                <p className="text-muted small mb-0">
                  Apakah Anda yakin ingin menghapus transaksi senilai <strong>{formatRupiah(deletingTrx.nominal)}</strong>?
                  Tindakan ini akan mengurangi saldo simpanan anggota secara permanen.
                </p>
              </div>
              <div className="modal-footer border-top-0 pt-0 justify-content-center">
                <button type="button" className="btn btn-light border px-3" onClick={() => setDeletingTrx(null)}>Batal</button>
                <button 
                  type="button" 
                  className="btn btn-danger px-3" 
                  onClick={handleDeleteTrx}
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
