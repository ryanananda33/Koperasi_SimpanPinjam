'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface LoanDetail {
  id: number;
  user_id: string;
  nominal_pinjaman: number;
  bunga_persen: number;
  lama_angsuran_bulan: number;
  sisa_angsuran_bulan: number;
  tanggal_pengajuan: string;
  tanggal_jatuh_tempo: string | null;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'berjalan' | 'lunas';
  alasan: string | null;
  users: {
    name: string;
    nip: string | null;
  } | null;
}

interface Installment {
  id: number;
  pinjaman_id: number;
  angsuran_ke: number;
  nominal_bayar: number;
  tanggal_bayar: string;
}

export default function AdminPinjamanDetail({ params }: { params: { id: string } }) {
  const loanId = params.id;

  const [loading, setLoading] = useState(true);
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [angsuranList, setAngsuranList] = useState<Installment[]>([]);
  
  const [isPaying, setIsPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLoanData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Loan Details
      const { data: loanData, error: loanErr } = await supabase
        .from('pinjaman')
        .select('*, users(name, nip)')
        .eq('id', loanId)
        .single();

      if (loanErr) throw loanErr;

      const formattedLoan: LoanDetail = {
        ...loanData,
        nominal_pinjaman: parseFloat(loanData.nominal_pinjaman) || 0,
        bunga_persen: parseFloat(loanData.bunga_persen) || 0,
        users: loanData.users ? { name: loanData.users.name, nip: loanData.users.nip } : null
      };

      setLoan(formattedLoan);

      // 2. Fetch Installments Paid
      const { data: angsuranData, error: angsErr } = await supabase
        .from('angsuran')
        .select('*')
        .eq('pinjaman_id', loanId)
        .order('angsuran_ke', { ascending: true });

      if (angsErr) throw angsErr;

      setAngsuranList(
        (angsuranData || []).map((a: any) => ({
          ...a,
          nominal_bayar: parseFloat(a.nominal_bayar) || 0
        }))
      );

    } catch (err: any) {
      console.error('Error fetching loan detail:', err);
      setErrorMsg('Gagal memuat detail pinjaman: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loanId) {
      fetchLoanData();
    }
  }, [loanId]);

  const handlePayInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan) return;
    setIsPaying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (loan.status !== 'berjalan' || loan.sisa_angsuran_bulan <= 0) {
        throw new Error('Pinjaman ini tidak dalam masa cicilan aktif.');
      }

      const pokokBulanan = loan.nominal_pinjaman / loan.lama_angsuran_bulan;
      const bungaBulanan = loan.nominal_pinjaman * (loan.bunga_persen / 100);
      const nominalBayar = pokokBulanan + bungaBulanan;

      const angsuranKe = loan.lama_angsuran_bulan - loan.sisa_angsuran_bulan + 1;

      // 1. Record installment payment in angsuran
      const { error: insError } = await supabase
        .from('angsuran')
        .insert({
          pinjaman_id: loan.id,
          angsuran_ke: angsuranKe,
          nominal_bayar: nominalBayar,
          tanggal_bayar: new Date().toISOString().split('T')[0]
        });

      if (insError) throw insError;

      // 2. Update remaining months & status in pinjaman
      const nextRemaining = loan.sisa_angsuran_bulan - 1;
      const nextStatus = nextRemaining <= 0 ? 'lunas' : 'berjalan';

      const { error: updateError } = await supabase
        .from('pinjaman')
        .update({
          sisa_angsuran_bulan: nextRemaining,
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', loan.id);

      if (updateError) throw updateError;

      setSuccessMsg(`Pembayaran angsuran ke-${angsuranKe} berhasil dicatat.`);
      
      // Refresh
      fetchLoanData();

    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setIsPaying(false);
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val).replace('IDR', 'Rp');
  };

  const formatDateShort = (dateStr?: string | null) => {
    if (!dateStr) return '-';
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

  if (loading && !loan) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading detail data...</span>
        </div>
      </div>
    );
  }

  if (errorMsg && !loan) {
    return (
      <div className="alert alert-danger border-0 shadow-sm rounded-4 p-4 mt-3">
        <i className="fa-solid fa-circle-exclamation fa-2x mb-3 d-block"></i>
        <h5>Gagal Memuat Detail</h5>
        <p className="small mb-4">{errorMsg}</p>
        <Link href="/admin/pinjaman" className="btn btn-light border btn-sm">
          <i className="fa-solid fa-arrow-left"></i> Kembali ke List
        </Link>
      </div>
    );
  }

  if (!loan) return null;

  // Calculators
  const pokokBulanan = loan.nominal_pinjaman / loan.lama_angsuran_bulan;
  const bungaBulanan = loan.nominal_pinjaman * (loan.bunga_persen / 100);
  const totalBulanan = pokokBulanan + bungaBulanan;

  const totalPaid = angsuranList.reduce((sum, item) => sum + item.nominal_bayar, 0);
  const totalRemaining = (totalBulanan * loan.lama_angsuran_bulan) - totalPaid;
  const paidIndices = angsuranList.map((a) => a.angsuran_ke);

  const percentPaid = loan.lama_angsuran_bulan > 0 
    ? ((loan.lama_angsuran_bulan - loan.sisa_angsuran_bulan) / loan.lama_angsuran_bulan) * 100 
    : 0;

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Ledger Pinjaman: {loan.users?.name}</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/admin/pinjaman">Pinjaman</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Amortisasi
              </li>
            </ol>
          </nav>
        </div>
        <Link href="/admin/pinjaman" className="btn btn-light border d-flex align-items-center gap-2">
          <i className="fa-solid fa-arrow-left"></i> Kembali ke List
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

      {/* Loan details summary */}
      <div className="row g-4 mb-4">
        {/* Debtor Details Card */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <span className="text-muted xsmall uppercase fw-semibold mb-3 d-block border-bottom pb-1">Detail Kredit & Debitur</span>
            
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="profile-avatar bg-navy text-white fw-semibold d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', fontSize: '1.1rem', borderRadius: '50%' }}>
                {loan.users?.name ? loan.users.name.substring(0, 1).toUpperCase() : 'U'}
              </div>
              <div>
                <h6 className="mb-0 text-dark fw-bold small">{loan.users?.name || 'Anggota'}</h6>
                <span className="xsmall text-muted">NIP: {loan.users?.nip || '-'}</span>
              </div>
            </div>

            <div className="d-flex flex-column gap-2 small">
              <div className="d-flex justify-content-between">
                <span className="text-muted">Tanggal Pinjam:</span>
                <span className="fw-semibold text-dark">{formatDateShort(loan.tanggal_pengajuan)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Tenor Waktu:</span>
                <span className="fw-semibold text-dark">{loan.lama_angsuran_bulan} Bulan</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Suku Bunga:</span>
                <span className="fw-semibold text-dark">{loan.bunga_persen}% / Bulan</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Status Kredit:</span>
                {loan.status === 'berjalan' && (
                  <span className="badge bg-primary-subtle text-primary px-2 py-1 rounded small">Berjalan</span>
                )}
                {loan.status === 'lunas' && (
                  <span className="badge bg-success-subtle text-success px-2 py-1 rounded small">Lunas</span>
                )}
                {loan.status === 'ditolak' && (
                  <span className="badge bg-danger-subtle text-danger px-2 py-1 rounded small">Ditolak</span>
                )}
                {loan.status === 'menunggu' && (
                  <span className="badge bg-warning-subtle text-warning px-2 py-1 rounded small">Menunggu</span>
                )}
              </div>
              {loan.alasan && (
                <div className="mt-2 p-2 bg-light rounded italic xsmall text-muted">
                  "{loan.alasan}"
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Repayments progress summary */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted xsmall uppercase fw-semibold border-bottom pb-1 d-block flex-fill">Statistik Angsuran</span>
                {loan.status === 'berjalan' && (
                  <form onSubmit={handlePayInstallment}>
                    <button 
                      type="submit" 
                      className="btn btn-success btn-sm px-3 fw-medium"
                      disabled={isPaying}
                    >
                      {isPaying ? (
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="fa-solid fa-wallet me-1"></i>
                      )}
                      Bayar Cicilan
                    </button>
                  </form>
                )}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-4">
                  <div className="p-2 border-start border-primary border-4 bg-light rounded">
                    <span className="xsmall text-muted d-block">Cicilan Bulanan</span>
                    <span className="fw-bold text-dark small">{formatRupiah(totalBulanan)}</span>
                    <span className="xsmall text-muted d-block mt-0.5" style={{ fontSize: '0.75rem' }}>
                      (Bunga: {formatRupiah(bungaBulanan)})
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 border-start border-success border-4 bg-light rounded">
                    <span className="xsmall text-muted d-block">Total Terbayar</span>
                    <span className="fw-bold text-dark small">{formatRupiah(totalPaid)}</span>
                    <span className="xsmall text-muted d-block mt-0.5" style={{ fontSize: '0.75rem' }}>
                      ({angsuranList.length} kali bayar)
                    </span>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 border-start border-warning border-4 bg-light rounded">
                    <span className="xsmall text-muted d-block">Sisa Pinjam</span>
                    <span className="fw-bold text-dark small">
                      {formatRupiah(totalRemaining > 0 ? totalRemaining : 0)}
                    </span>
                    <span className="xsmall text-muted d-block mt-0.5" style={{ fontSize: '0.75rem' }}>
                      ({loan.sisa_angsuran_bulan} bln sisa)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-2">
              <div className="d-flex justify-content-between small text-muted mb-1">
                <span>Kemajuan Pelunasan</span>
                <span className="fw-semibold text-dark">{percentPaid.toFixed(1)}%</span>
              </div>
              <div className="progress rounded-pill" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-success animate-all" 
                  role="progressbar" 
                  style={{ width: `${percentPaid}%` }} 
                  aria-valuenow={percentPaid} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
        <h5 className="fw-semibold text-navy mb-3 border-bottom pb-2">
          <i className="fa-solid fa-calendar-check me-1"></i> Rencana Amortisasi & Cicilan Bulanan
        </h5>
        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0 text-start">
            <thead>
              <tr className="table-light text-muted small">
                <th>Cicilan Ke-</th>
                <th>Jatuh Tempo Estimasi</th>
                <th>Nominal Angsuran</th>
                <th>Bunga ({loan.bunga_persen}%)</th>
                <th>Status</th>
                <th>Tanggal Bayar</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: loan.lama_angsuran_bulan }, (_, k) => {
                const step = k + 1;
                const isPaid = paidIndices.includes(step);
                const payment = angsuranList.find((a) => a.angsuran_ke === step);
                const dueEst = formatDateWithIncrement(loan.tanggal_jatuh_tempo, k);

                return (
                  <tr key={step}>
                    <td className="fw-medium text-dark">#{step}</td>
                    <td>{dueEst}</td>
                    <td className="fw-semibold text-dark">{formatRupiah(totalBulanan)}</td>
                    <td className="text-muted">{formatRupiah(bungaBulanan)}</td>
                    <td>
                      {isPaid ? (
                        <span className="badge bg-success-subtle text-success px-2 py-1 rounded small">Lunas</span>
                      ) : (
                        <span className="badge bg-warning-subtle text-warning px-2 py-1 rounded small">Belum Bayar</span>
                      )}
                    </td>
                    <td>
                      <span className="small text-muted">
                        {isPaid && payment ? formatDateShort(payment.tanggal_bayar) : '-'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
