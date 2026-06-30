'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AnggotaAjukanPinjaman() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [totalWajib, setTotalWajib] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  // Form states
  const [nominal, setNominal] = useState('');
  const [tenor, setTenor] = useState('6');
  const [alasan, setAlasan] = useState('');

  // Simulation states
  const [showSim, setShowSim] = useState(false);
  const [simPokok, setSimPokok] = useState(0);
  const [simBunga, setSimBunga] = useState(0);
  const [simTotal, setSimTotal] = useState(0);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRequirementChecks = async () => {
      if (!user) return;
      try {
        setLoading(true);

        // 1. Check if user has active/pending loans
        const { data: activeLoans, error: activeErr } = await supabase
          .from('pinjaman')
          .select('status')
          .eq('user_id', user.id)
          .in('status', ['berjalan', 'disetujui', 'menunggu']);

        if (activeErr) throw activeErr;
        setHasActiveLoan((activeLoans || []).length > 0);

        // 2. Fetch savings for validation
        const { data: savings, error: savingsErr } = await supabase
          .from('simpanan')
          .select('nominal, tipe_simpanan')
          .eq('user_id', user.id);

        if (savingsErr) throw savingsErr;

        let wajib = 0;
        let total = 0;
        (savings || []).forEach((s) => {
          const val = parseFloat(s.nominal as any) || 0;
          total += val;
          if (s.tipe_simpanan === 'wajib') {
            wajib += val;
          }
        });

        setTotalWajib(wajib);
        setTotalSavings(total);

      } catch (err) {
        console.error('Error fetching loan requirement details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirementChecks();
  }, [user]);

  // Handle simulation calculation when inputs change
  useEffect(() => {
    const nominalNum = parseFloat(nominal);
    const tenorNum = parseInt(tenor);

    if (isNaN(nominalNum) || nominalNum < 50000) {
      setShowSim(false);
      return;
    }

    const pokok = nominalNum / tenorNum;
    const bunga = nominalNum * 0.015; // Estimate 1.5% interest
    const total = pokok + bunga;

    setSimPokok(pokok);
    setSimBunga(bunga);
    setSimTotal(total);
    setShowSim(true);
  }, [nominal, tenor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const nominalNum = parseFloat(nominal);
      const tenorNum = parseInt(tenor);

      // Validate inputs
      if (isNaN(nominalNum) || nominalNum < 50000 || nominalNum > 50000000) {
        throw new Error('Nominal pengajuan tidak valid. Batas nominal Rp 50.000 s/d Rp 50.000.000');
      }

      if (!alasan || alasan.trim().length === 0) {
        throw new Error('Alasan pengajuan wajib diisi.');
      }

      // Check rules:
      // Rule 1: Active Loan check
      if (hasActiveLoan) {
        throw new Error('Anda masih memiliki pengajuan aktif atau pinjaman berjalan.');
      }

      // Rule 2: Minimal Wajib check (Rp 500.000)
      if (totalWajib < 500000) {
        throw new Error('Minimal Simpanan Wajib Rp 500.000 sebelum mengajukan pinjaman.');
      }

      // Rule 3: Max loan size = 5x total savings
      const maxLoan = totalSavings * 5;
      if (nominalNum > maxLoan) {
        throw new Error(`Nominal pinjaman melebihi batas maksimal. Maksimal pinjaman Anda adalah ${formatRupiah(maxLoan)} (5x total simpanan).`);
      }

      // Submit to Supabase
      const { error: submitErr } = await supabase
        .from('pinjaman')
        .insert({
          user_id: user.id,
          nominal_pinjaman: nominalNum,
          lama_angsuran_bulan: tenorNum,
          sisa_angsuran_bulan: tenorNum,
          bunga_persen: 1.5, // Default estimate, admin will adjust
          status: 'menunggu',
          alasan: alasan,
          tanggal_pengajuan: new Date().toISOString().split('T')[0]
        });

      if (submitErr) throw submitErr;

      setSuccessMsg('Pengajuan pinjaman Anda berhasil dikirim dan sedang menunggu persetujuan admin.');
      
      setTimeout(() => {
        router.push('/anggota/pinjaman');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengirim pengajuan.');
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Memvalidasi persyaratan...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Form Pengajuan Pinjaman</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/anggota/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/anggota/pinjaman">Pinjaman Saya</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Pengajuan
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="row justify-content-start">
        <div className="col-12 col-md-8 col-lg-6">
          {successMsg && (
            <div className="alert alert-success shadow-sm rounded-3">
              <i className="fa-solid fa-circle-check me-2"></i> {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="alert alert-danger shadow-sm rounded-3">
              <i className="fa-solid fa-circle-exclamation me-2"></i> {errorMsg}
            </div>
          )}

          {hasActiveLoan ? (
            /* Warning: Already has active/pending loan */
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <div className="text-warning mb-3">
                <i className="fa-solid fa-triangle-exclamation fa-3x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Pengajuan Terkunci</h5>
              <p className="text-muted small mb-4">
                Anda tidak dapat mengajukan pinjaman baru saat ini karena Anda masih memiliki pinjaman aktif yang sedang berjalan atau pengajuan sebelumnya yang masih menunggu persetujuan admin.
              </p>
              <Link href="/anggota/pinjaman" className="btn btn-light border px-4 py-2 small fw-medium">
                <i className="fa-solid fa-clock-rotate-left me-1"></i> Periksa Riwayat Pinjaman
              </Link>
            </div>
          ) : totalWajib < 500000 ? (
            /* Warning: Wajib balance too low */
            <div className="card border-0 shadow-sm rounded-4 p-4 text-center bg-white">
              <div className="text-danger mb-3">
                <i className="fa-solid fa-circle-exclamation fa-3x"></i>
              </div>
              <h5 className="fw-bold text-dark mb-2">Syarat Simpanan Tidak Terpenuhi</h5>
              <p className="text-muted small mb-4">
                Total Simpanan Wajib Anda saat ini adalah <strong>{formatRupiah(totalWajib)}</strong>. 
                Sesuai aturan koperasi, Anda wajib memiliki minimal saldo Simpanan Wajib sebesar <strong>Rp 500.000</strong> sebelum mengajukan pinjaman.
              </p>
              <Link href="/anggota/simpanan" className="btn btn-navy px-4 py-2 small fw-medium">
                <i className="fa-solid fa-piggy-bank me-1"></i> Lihat Tabungan Saya
              </Link>
            </div>
          ) : (
            /* Form Page */
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-semibold text-navy mb-3 border-bottom pb-2">
                <i className="fa-solid fa-file-signature me-1"></i> Ajukan Kredit Baru
              </h5>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-medium">Nominal Pinjaman yang Diajukan (Rp)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted fw-semibold">Rp</span>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Contoh: 5000000" 
                      min="50000" 
                      max="50000000" 
                      value={nominal}
                      onChange={(e) => setNominal(e.target.value)}
                      required 
                    />
                  </div>
                  <span className="xsmall text-muted mt-1 d-block">
                    <i className="fa-solid fa-circle-info me-1"></i> 
                    Batas nominal pengajuan: <strong>Rp 50.000 s/d Rp 50.000.000</strong>. 
                    Maksimal plafon Anda: <strong>{formatRupiah(totalSavings * 5)}</strong> (5x total simpanan).
                  </span>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-medium">Tenor Angsuran (Jangka Waktu)</label>
                  <select 
                    className="form-select" 
                    value={tenor}
                    onChange={(e) => setTenor(e.target.value)}
                    required
                  >
                    <option value="3">3 Bulan</option>
                    <option value="6">6 Bulan</option>
                    <option value="12">12 Bulan</option>
                    <option value="18">18 Bulan</option>
                    <option value="24">24 Bulan</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-medium">Alasan Pengajuan Pinjaman</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Tulis alasan mendesak pengajuan pinjaman (misal: biaya sekolah anak, renovasi mendesak, pengobatan)..." 
                    required
                  />
                </div>

                {/* Interactive Calculation Summary */}
                {showSim && (
                  <div className="p-3 bg-light rounded-3 mb-4 small text-start border animate-fade-in">
                    <h6 className="fw-bold text-navy mb-2">
                      <i className="fa-solid fa-calculator me-1"></i> Estimasi Simulasi Cicilan
                    </h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Pokok Cicilan Bulanan:</span>
                      <span className="fw-semibold text-dark">{formatRupiah(simPokok)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted">Estimasi Bunga (1.5%):</span>
                      <span className="fw-semibold text-dark">{formatRupiah(simBunga)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between">
                      <strong className="text-dark">Estimasi Total Bayar Bulanan:</strong>
                      <strong className="text-navy">{formatRupiah(simTotal)}</strong>
                    </div>
                    <span className="xsmall text-muted d-block mt-2 italic">
                      *Suku bunga sesungguhnya akan ditentukan oleh admin koperasi saat persetujuan.
                    </span>
                  </div>
                )}

                <div className="d-flex gap-2 justify-content-end">
                  <Link href="/anggota/pinjaman" className="btn btn-light border">Batal</Link>
                  <button type="submit" className="btn btn-navy px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
