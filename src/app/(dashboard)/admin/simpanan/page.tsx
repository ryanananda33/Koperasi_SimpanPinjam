'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface SimpananTrx {
  tipe_simpanan: 'pokok' | 'wajib' | 'sukarela' | 'manasuka';
  nominal: number;
}

interface MemberSavings {
  id: string;
  name: string;
  nip: string | null;
  status: string;
  simpanan: SimpananTrx[];
}

export default function AdminSimpanan() {
  const [members, setMembers] = useState<MemberSavings[]>([]);
  const [activeMembers, setActiveMembers] = useState<{ id: string; name: string; nip: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [tipeSimpanan, setTipeSimpanan] = useState<'wajib' | 'manasuka'>('wajib');
  const [nominal, setNominal] = useState('');
  const [tanggalTransaksi, setTanggalTransaksi] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSavingsData = async () => {
    try {
      setLoading(true);
      
      // Fetch members and their transactions
      let query = supabase
        .from('users')
        .select('id, name, nip, status, simpanan(tipe_simpanan, nominal)')
        .eq('role', 'anggota');

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,nip.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;

      const formatted = (data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        nip: m.nip,
        status: m.status,
        simpanan: (m.simpanan || []).map((s: any) => ({
          tipe_simpanan: s.tipe_simpanan,
          nominal: parseFloat(s.nominal) || 0
        }))
      }));

      setMembers(formatted);

      // Separate active members for form select
      const active = formatted
        .filter((m) => m.status === 'aktif')
        .map((m) => ({ id: m.id, name: m.name, nip: m.nip }));
      setActiveMembers(active);

    } catch (err: any) {
      console.error('Error fetching savings data:', err);
      setErrorMsg('Gagal memuat data simpanan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavingsData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSavingsData();
  };

  const handleReset = () => {
    setSearchTerm('');
    setTimeout(() => {
      fetchSavingsData();
    }, 50);
  };

  const handleRecordSaving = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!selectedUserId) {
      setErrorMsg('Silakan pilih anggota guru.');
      setIsSubmitting(false);
      return;
    }

    try {
      const nominalNum = parseFloat(nominal);
      if (isNaN(nominalNum) || nominalNum < 1000) {
        throw new Error('Nominal setoran minimal Rp 1.000');
      }

      // Map 'manasuka' form option to 'sukarela' or 'manasuka' inside database.
      // We allowed 'manasuka' and 'sukarela' in schema.sql enum constraints to prevent errors,
      // so inserting 'manasuka' works perfectly.
      const defaultKeterangan = keterangan || `Setoran Simpanan ${tipeSimpanan.charAt(0).toUpperCase() + tipeSimpanan.slice(1)}`;

      const { error } = await supabase
        .from('simpanan')
        .insert({
          user_id: selectedUserId,
          tipe_simpanan: tipeSimpanan,
          nominal: nominalNum,
          tanggal_transaksi: tanggalTransaksi,
          keterangan: defaultKeterangan
        });

      if (error) throw error;

      setSuccessMsg('Transaksi simpanan berhasil dicatat.');
      setShowRecordModal(false);
      
      // Reset form
      setSelectedUserId('');
      setTipeSimpanan('wajib');
      setNominal('');
      setTanggalTransaksi(new Date().toISOString().split('T')[0]);
      setKeterangan('');

      fetchSavingsData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan transaksi.');
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

  const getSum = (trxList: SimpananTrx[], type: string) => {
    return trxList
      .filter((s) => s.tipe_simpanan === type)
      .reduce((sum, item) => sum + item.nominal, 0);
  };

  const getManasukaSum = (trxList: SimpananTrx[]) => {
    return trxList
      .filter((s) => s.tipe_simpanan === 'manasuka' || s.tipe_simpanan === 'sukarela')
      .reduce((sum, item) => sum + item.nominal, 0);
  };

  const getTotalSum = (trxList: SimpananTrx[]) => {
    return trxList.reduce((sum, item) => sum + item.nominal, 0);
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Action */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Kelola Simpanan Anggota</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Simpanan
              </li>
            </ol>
          </nav>
        </div>
        <button 
          className="btn btn-navy d-flex align-items-center gap-2" 
          onClick={() => {
            setErrorMsg('');
            setSuccessMsg('');
            setShowRecordModal(true);
          }}
        >
          <i className="fa-solid fa-file-invoice"></i> Catat Setoran Baru
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

      {/* Search Form */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-3 align-items-center">
          <div className="col-12 col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input 
                type="text" 
                className="form-control bg-light border-start-0 ps-0" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan nama guru atau NIP..." 
              />
            </div>
          </div>
          <div className="col-12 col-md-4 d-flex gap-2">
            <button type="submit" className="btn btn-navy flex-fill">
              <i className="fa-solid fa-magnifying-glass me-1"></i> Cari
            </button>
            <button type="button" onClick={handleReset} className="btn btn-light border flex-fill">
              <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
            </button>
          </div>
        </form>
      </div>

      {/* Savings Table */}
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
                  <th>Simpanan Wajib</th>
                  <th>Simpanan Manasuka</th>
                  <th>Total Saldo</th>
                  <th className="text-center pe-4">Detail Simpanan</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, index) => (
                  <tr key={m.id}>
                    <td className="ps-4 text-muted">{index + 1}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="profile-avatar bg-primary-subtle text-primary fw-semibold d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', fontSize: '0.95rem', borderRadius: '50%' }}>
                          {m.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="mb-0 text-dark fw-semibold small">{m.name}</h6>
                          <span className="xsmall text-muted">NIP: {m.nip || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="fw-medium text-dark">
                      {formatRupiah(getSum(m.simpanan, 'wajib'))}
                    </td>
                    <td className="fw-medium text-dark">
                      {formatRupiah(getManasukaSum(m.simpanan))}
                    </td>
                    <td className="fw-bold text-navy">
                      {formatRupiah(getTotalSum(m.simpanan))}
                    </td>
                    <td className="pe-4 text-center">
                      <Link 
                        href={`/admin/simpanan/${m.id}`} 
                        className="btn btn-light btn-sm text-primary"
                      >
                        <i className="fa-solid fa-book-open"></i> Lihat Detail
                      </Link>
                    </td>
                  </tr>
                ))}

                {members.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <i className="fa-regular fa-folder-open fa-3x mb-2 text-slate-400 d-block"></i>
                      <span>Tidak ditemukan data saldo simpanan guru.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD SAVING MODAL */}
      {showRecordModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-navy">Catat Setoran Baru</h5>
                <button type="button" className="btn-close" onClick={() => setShowRecordModal(false)}></button>
              </div>
              <form onSubmit={handleRecordSaving}>
                <div className="modal-body py-3">
                  <div className="mb-3">
                    <label className="form-label small fw-medium">Nama Anggota Guru</label>
                    <select 
                      className="form-select" 
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                    >
                      <option value="" disabled>Pilih guru setoran...</option>
                      {activeMembers.map((am) => (
                        <option key={am.id} value={am.id}>
                          {am.name} (NIP: {am.nip || '-'})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="row g-3 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-medium">Jenis Simpanan</label>
                      <select 
                        className="form-select" 
                        value={tipeSimpanan}
                        onChange={(e) => setTipeSimpanan(e.target.value as 'wajib' | 'manasuka')}
                        required
                      >
                        <option value="wajib">Simpanan Wajib</option>
                        <option value="manasuka">Simpanan Manasuka</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-medium">Tanggal Transaksi</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={tanggalTransaksi}
                        onChange={(e) => setTanggalTransaksi(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-medium">Nominal Setoran (Rp)</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted fw-semibold">Rp</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Contoh: 250000" 
                        min="1000" 
                        value={nominal}
                        onChange={(e) => setNominal(e.target.value)}
                        required 
                      />
                    </div>
                  </div>

                  <div className="mb-0">
                    <label className="form-label small fw-medium">Keterangan Tambahan</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Contoh: Setoran Simpanan Manasuka"
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer border-top-0 pt-0">
                  <button type="button" className="btn btn-light border" onClick={() => setShowRecordModal(false)}>Tutup</button>
                  <button type="submit" className="btn btn-navy px-4" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Setoran'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
