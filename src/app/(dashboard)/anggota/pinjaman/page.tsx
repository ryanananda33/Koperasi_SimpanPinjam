'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Installment {
  id: number;
  angsuran_ke: number;
  nominal_bayar: number;
  tanggal_bayar: string;
}

interface Loan {
  id: number;
  nominal_pinjaman: number;
  bunga_persen: number;
  lama_angsuran_bulan: number;
  sisa_angsuran_bulan: number;
  tanggal_pengajuan: string;
  tanggal_jatuh_tempo: string | null;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'berjalan' | 'lunas';
  alasan: string | null;
  angsuran: Installment[];
}

export default function AnggotaPinjaman() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loans, setLoans] = useState<Loan[]>([]);

  // Modal control
  const [activeAmortizationLoan, setActiveAmortizationLoan] = useState<Loan | null>(null);

  const fetchPersonalLoans = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pinjaman')
        .select('*, angsuran(*)')
        .eq('user_id', user.id)
        .order('tanggal_pengajuan', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((p: any) => ({
        id: p.id,
        nominal_pinjaman: parseFloat(p.nominal_pinjaman) || 0,
        bunga_persen: parseFloat(p.bunga_persen) || 0,
        lama_angsuran_bulan: p.lama_angsuran_bulan,
        sisa_angsuran_bulan: p.sisa_angsuran_bulan,
        tanggal_pengajuan: p.tanggal_pengajuan,
        tanggal_jatuh_tempo: p.tanggal_jatuh_tempo,
        status: p.status,
        alasan: p.alasan,
        angsuran: (p.angsuran || []).map((a: any) => ({
          id: a.id,
          angsuran_ke: a.angsuran_ke,
          nominal_bayar: parseFloat(a.nominal_bayar) || 0,
          tanggal_bayar: a.tanggal_bayar
        }))
      }));

      setLoans(formatted);
    } catch (err) {
      console.error('Error fetching personal loans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalLoans();
  }, [user]);

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

  const formatDateWithIncrement = (baseDateStr: string | null, monthsToAdd: number) => {
    if (!baseDateStr) return '-';
    const date = new Date(baseDateStr);
    date.setMonth(date.getMonth() + monthsToAdd);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Math calculators for modal
  let modalPokokBulanan = 0;
  let modalBungaBulanan = 0;
  let modalTotalBulanan = 0;
  let modalPaidIndices: number[] = [];

  if (activeAmortizationLoan) {
    modalPokokBulanan = activeAmortizationLoan.nominal_pinjaman / activeAmortizationLoan.lama_angsuran_bulan;
    modalBungaBulanan = activeAmortizationLoan.nominal_pinjaman * (activeAmortizationLoan.bunga_persen / 100);
    modalTotalBulanan = modalPokokBulanan + modalBungaBulanan;
    modalPaidIndices = activeAmortizationLoan.angsuran.map((a) => a.angsuran_ke);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Riwayat Pinjaman Saya</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/anggota/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Pinjaman Saya
              </li>
            </ol>
          </nav>
        </div>
        <Link href="/anggota/pinjaman/ajukan" className="btn btn-navy d-flex align-items-center gap-2">
          <i className="fa-solid fa-file-signature"></i> Ajukan Pinjaman Baru
        </Link>
      </div>

      {/* Personal Loans Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0 text-start small">
            <thead>
              <tr className="table-light text-muted">
                <th>No</th>
                <th>Tgl Pengajuan</th>
                <th>Nominal Pinjaman</th>
                <th>Bunga</th>
                <th>Tenor</th>
                <th>Status</th>
                <th>Jatuh Tempo</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, idx) => (
                <tr key={loan.id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td>{formatDateShort(loan.tanggal_pengajuan)}</td>
                  <td className="fw-bold text-dark">{formatRupiah(loan.nominal_pinjaman)}</td>
                  <td>{loan.bunga_persen}% / Bln</td>
                  <td>{loan.lama_angsuran_bulan} Bulan</td>
                  <td>
                    {loan.status === 'menunggu' && (
                      <span className="badge bg-warning-subtle text-warning px-2 py-1 rounded">Menunggu</span>
                    )}
                    {loan.status === 'berjalan' && (
                      <span className="badge bg-primary-subtle text-primary px-2 py-1 rounded">Berjalan</span>
                    )}
                    {loan.status === 'lunas' && (
                      <span className="badge bg-success-subtle text-success px-2 py-1 rounded">Lunas</span>
                    )}
                    {loan.status === 'ditolak' && (
                      <span className="badge bg-danger-subtle text-danger px-2 py-1 rounded">Ditolak</span>
                    )}
                  </td>
                  <td>
                    <span className="text-muted small">{loan.tanggal_jatuh_tempo ? formatDateShort(loan.tanggal_jatuh_tempo) : '-'}</span>
                  </td>
                  <td className="text-center">
                    {loan.status === 'berjalan' || loan.status === 'lunas' ? (
                      <button 
                        className="btn btn-light btn-sm text-primary"
                        onClick={() => setActiveAmortizationLoan(loan)}
                      >
                        <i className="fa-solid fa-calendar-days"></i> Jadwal Cicilan
                      </button>
                    ) : loan.status === 'ditolak' ? (
                      <span className="text-muted xsmall" title={loan.alasan || 'Ditolak'}>
                        {loan.alasan || 'Lihat Alasan Ditolak'}
                      </span>
                    ) : (
                      <span className="text-muted small">-</span>
                    )}
                  </td>
                </tr>
              ))}

              {loans.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <i className="fa-regular fa-folder-open fa-2x mb-2 text-slate-300"></i>
                    <p className="mb-0 small">Anda belum memiliki riwayat pengajuan pinjaman.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AMORTIZATION MODAL */}
      {activeAmortizationLoan && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-navy">
                  <i className="fa-solid fa-receipt me-1"></i> Rencana Pembayaran Kredit
                </h5>
                <button type="button" className="btn-close" onClick={() => setActiveAmortizationLoan(null)}></button>
              </div>
              <div className="modal-body py-3">
                <div className="row g-2 mb-3 bg-light p-3 rounded text-start xsmall">
                  <div className="col-6">
                    <span className="text-muted d-block">Nominal Pinjaman:</span>
                    <strong className="text-dark">{formatRupiah(activeAmortizationLoan.nominal_pinjaman)}</strong>
                  </div>
                  <div className="col-6 text-end">
                    <span className="text-muted d-block">Tagihan Bulanan:</span>
                    <strong className="text-navy">
                      {formatRupiah(modalTotalBulanan)} (Bunga: {activeAmortizationLoan.bunga_persen}%)
                    </strong>
                  </div>
                </div>

                <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table className="table custom-table align-middle mb-0 text-start xsmall">
                    <thead>
                      <tr className="table-light text-muted">
                        <th>Angsuran Ke-</th>
                        <th>Jatuh Tempo</th>
                        <th>Nominal Angsuran</th>
                        <th>Status</th>
                        <th>Tanggal Bayar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: activeAmortizationLoan.lama_angsuran_bulan }, (_, k) => {
                        const step = k + 1;
                        const isPaid = modalPaidIndices.includes(step);
                        const payment = activeAmortizationLoan.angsuran.find((a) => a.angsuran_ke === step);
                        const dueEst = formatDateWithIncrement(activeAmortizationLoan.tanggal_jatuh_tempo, k);

                        return (
                          <tr key={step}>
                            <td className="fw-semibold text-dark">#{step}</td>
                            <td>{dueEst}</td>
                            <td className="fw-semibold text-dark">{formatRupiah(modalTotalBulanan)}</td>
                            <td>
                              {isPaid ? (
                                <span className="badge bg-success-subtle text-success px-2 py-0.5 rounded">Lunas</span>
                              ) : (
                                <span className="badge bg-warning-subtle text-warning px-2 py-0.5 rounded">Belum Bayar</span>
                              )}
                            </td>
                            <td className="text-muted">
                              {isPaid && payment ? formatDateShort(payment.tanggal_bayar) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light border" onClick={() => setActiveAmortizationLoan(null)}>Tutup</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
