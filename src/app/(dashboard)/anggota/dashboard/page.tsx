'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';

interface ActiveLoan {
  id: number;
  nominal_pinjaman: number;
  lama_angsuran_bulan: number;
  sisa_angsuran_bulan: number;
  bunga_persen: number;
  status: string;
}

interface MiniTransaction {
  date: string;
  type: 'simpanan' | 'pinjaman';
  label: string;
  amount: number;
  status: string;
}

export default function AnggotaDashboard() {
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [totalSavings, setTotalSavings] = useState(0);
  const [wajibSum, setWajibSum] = useState(0);
  const [manasukaSum, setManasukaSum] = useState(0);

  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [latestLoan, setLatestLoan] = useState<{ status: string } | null>(null);
  
  const [recentTransactions, setRecentTransactions] = useState<MiniTransaction[]>([]);

  useEffect(() => {
    const fetchMemberDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);

        // 1. Fetch personal savings
        const { data: savingsList, error: savingsErr } = await supabase
          .from('simpanan')
          .select('nominal, tipe_simpanan, tanggal_transaksi, keterangan')
          .eq('user_id', user.id);

        if (savingsErr) throw savingsErr;

        let total = 0;
        let wajib = 0;
        let manasuka = 0;
        const savingsTrxMapped: MiniTransaction[] = [];

        (savingsList || []).forEach((s) => {
          const nominalVal = parseFloat(s.nominal as any) || 0;
          total += nominalVal;

          if (s.tipe_simpanan === 'wajib') {
            wajib += nominalVal;
          } else if (s.tipe_simpanan === 'manasuka' || s.tipe_simpanan === 'sukarela') {
            manasuka += nominalVal;
          }

          savingsTrxMapped.push({
            date: s.tanggal_transaksi,
            type: 'simpanan',
            label: s.tipe_simpanan === 'wajib' ? 'Simpanan Wajib' : 'Simpanan Manasuka',
            amount: nominalVal,
            status: 'sukses',
          });
        });

        setTotalSavings(total);
        setWajibSum(wajib);
        setManasukaSum(manasuka);

        // 2. Fetch personal loans
        const { data: loansList, error: loansErr } = await supabase
          .from('pinjaman')
          .select('id, nominal_pinjaman, status, tanggal_pengajuan, lama_angsuran_bulan, sisa_angsuran_bulan, bunga_persen')
          .eq('user_id', user.id)
          .order('tanggal_pengajuan', { ascending: false });

        if (loansErr) throw loansErr;

        let active: ActiveLoan | null = null;
        const loansTrxMapped: MiniTransaction[] = [];

        (loansList || []).forEach((p, idx) => {
          const nominalVal = parseFloat(p.nominal_pinjaman as any) || 0;
          const bungaVal = parseFloat(p.bunga_persen as any) || 0;

          // Set latest loan status check
          if (idx === 0) {
            setLatestLoan({ status: p.status });
          }

          // Active loan is the most recent 'berjalan' loan
          if (p.status === 'berjalan' && !active) {
            active = {
              id: p.id,
              nominal_pinjaman: nominalVal,
              lama_angsuran_bulan: p.lama_angsuran_bulan,
              sisa_angsuran_bulan: p.sisa_angsuran_bulan,
              bunga_persen: bungaVal,
              status: p.status,
            };
          }

          loansTrxMapped.push({
            date: p.tanggal_pengajuan,
            type: 'pinjaman',
            label: 'Pinjaman Baru',
            amount: nominalVal,
            status: p.status,
          });
        });

        setActiveLoan(active);

        // 3. Merge and sort transactions
        const merged = [...savingsTrxMapped, ...loansTrxMapped]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        setRecentTransactions(merged);

      } catch (err) {
        console.error('Error fetching member dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberDashboardData();
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

  const getTodayDateLong = () => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Active Loan Math
  let activeLoanRemaining = 0;
  let activeLoanMonthly = 0;
  let activePercentPaid = 0;

  if (activeLoan) {
    const pokokBulanan = activeLoan.nominal_pinjaman / activeLoan.lama_angsuran_bulan;
    const bungaBulanan = activeLoan.nominal_pinjaman * (activeLoan.bunga_persen / 100);
    activeLoanMonthly = pokokBulanan + bungaBulanan;
    activeLoanRemaining = activeLoanMonthly * activeLoan.sisa_angsuran_bulan;
    activePercentPaid = ((activeLoan.lama_angsuran_bulan - activeLoan.sisa_angsuran_bulan) / activeLoan.lama_angsuran_bulan) * 100;
  }

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Dashboard Anggota</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Dashboard Saya
              </li>
            </ol>
          </nav>
        </div>
        <div className="text-muted small">
          <i className="fa-regular fa-calendar-days me-1"></i> Hari ini: {getTodayDateLong()}
        </div>
      </div>

      {/* Savings Breakdown Overview Card */}
      <div className="row g-4 mb-4">
        {/* Main Balance Card */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 text-white h-100" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <span className="xsmall text-white-50 uppercase fw-semibold mb-1 d-block">
              Total Simpanan Saya
            </span>
            <h2 className="fw-bold mb-4">{formatRupiah(totalSavings)}</h2>
            
            <div className="row g-2 text-start">
              <div className="col-6 border-end border-slate-700">
                <span className="xsmall text-white-50 d-block">Simpanan Wajib</span>
                <span className="fw-semibold text-white small">{formatRupiah(wajibSum)}</span>
              </div>
              <div className="col-6 ps-3">
                <span className="xsmall text-white-50 d-block">Simpanan Manasuka</span>
                <span className="fw-semibold text-white small">{formatRupiah(manasukaSum)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Loan details */}
        <div className="col-12 col-md-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-semibold text-dark mb-3">
                <i className="fa-solid fa-hand-holding-dollar me-1 text-warning"></i> Pinjaman Aktif Saya
              </h5>
              {activeLoan ? (
                <div className="row g-2 small text-muted">
                  <div className="col-6">
                    <span className="d-block">Sisa Pinjaman Berjalan:</span>
                    <strong className="text-navy fs-5">{formatRupiah(activeLoanRemaining)}</strong>
                  </div>
                  <div className="col-6 text-end">
                    <span className="d-block">Angsuran Bulanan:</span>
                    <strong className="text-dark">{formatRupiah(activeLoanMonthly)}</strong>
                  </div>
                  <div className="col-12 mt-3">
                    <span className="d-block mb-1">
                      Masa Sisa Angsuran: <strong>{activeLoan.sisa_angsuran_bulan} dari {activeLoan.lama_angsuran_bulan} Bulan</strong>
                    </span>
                    <div className="progress rounded-pill" style={{ height: '8px' }}>
                      <div className="progress-bar bg-success" style={{ width: `${activePercentPaid}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted small">
                  <i className="fa-solid fa-face-smile fa-2x text-slate-300 mb-2"></i>
                  <p className="mb-0">Anda tidak memiliki tagihan pinjaman aktif saat ini.</p>
                  {latestLoan && latestLoan.status === 'menunggu' && (
                    <div className="mt-2 alert alert-warning py-1.5 border-0 rounded small mb-0">
                      <i className="fa-solid fa-circle-notch fa-spin me-1"></i> Pengajuan pinjaman Anda sebelumnya sedang direview admin.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent personal logs */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <h5 className="fw-semibold text-navy mb-3 border-bottom pb-2">
          <i className="fa-solid fa-clock-rotate-left me-1"></i> Transaksi Terakhir Saya
        </h5>
        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0 small text-start">
            <thead>
              <tr className="table-light text-muted">
                <th>Tanggal</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th>Nominal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((tx, idx) => (
                <tr key={idx}>
                  <td>{formatDateShort(tx.date)}</td>
                  <td>
                    {tx.type === 'simpanan' ? (
                      <span className="badge bg-success-subtle text-success text-xsmall uppercase px-2 py-0.5 rounded">Setoran</span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning text-xsmall uppercase px-2 py-0.5 rounded">Pinjaman</span>
                    )}
                  </td>
                  <td className="text-muted">{tx.label}</td>
                  <td className="fw-semibold text-dark">{formatRupiah(tx.amount)}</td>
                  <td>
                    {(tx.status === 'sukses' || tx.status === 'berjalan' || tx.status === 'lunas') && (
                      <span className="badge bg-success-subtle text-success text-xsmall px-2 py-0.5 rounded">Sukses</span>
                    )}
                    {tx.status === 'menunggu' && (
                      <span className="badge bg-warning-subtle text-warning text-xsmall px-2 py-0.5 rounded">Menunggu</span>
                    )}
                    {tx.status === 'ditolak' && (
                      <span className="badge bg-danger-subtle text-danger text-xsmall px-2 py-0.5 rounded">Ditolak</span>
                    )}
                  </td>
                </tr>
              ))}

              {recentTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    <i className="fa-regular fa-folder-open fa-2x mb-2 text-slate-300"></i>
                    <p className="mb-0 small">Belum ada aktivitas transaksi terdaftar.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
