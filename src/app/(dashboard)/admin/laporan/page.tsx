'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface ReportRow {
  id: number;
  tanggal: string;
  name: string;
  nip: string;
  typeOrStatusOrAngsuran: string;
  nominal: number;
  keterangan?: string;
}

export default function AdminLaporan() {
  const [jenisLaporan, setJenisLaporan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [totalNominal, setTotalNominal] = useState(0);
  const [hasPulled, setHasPulled] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTarikData = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    setHasPulled(true);

    try {
      if (!jenisLaporan || !startDate || !endDate) {
        throw new Error('Semua input filter wajib diisi.');
      }

      if (jenisLaporan === 'simpanan') {
        const { data, error } = await supabase
          .from('simpanan')
          .select('*, users(name, nip)')
          .gte('tanggal_transaksi', startDate)
          .lte('tanggal_transaksi', endDate)
          .order('tanggal_transaksi', { ascending: true });

        if (error) throw error;

        const formatted = (data || []).map((s: any) => ({
          id: s.id,
          tanggal: s.tanggal_transaksi,
          name: s.users?.name || 'Anggota',
          nip: s.users?.nip || '-',
          typeOrStatusOrAngsuran: s.tipe_simpanan === 'wajib' ? 'Wajib' : 'Manasuka',
          nominal: parseFloat(s.nominal) || 0,
          keterangan: s.keterangan || ''
        }));

        setReports(formatted);
        setTotalNominal(formatted.reduce((sum, item) => sum + item.nominal, 0));

      } else if (jenisLaporan === 'pinjaman') {
        const { data, error } = await supabase
          .from('pinjaman')
          .select('*, users(name, nip)')
          .gte('tanggal_pengajuan', startDate)
          .lte('tanggal_pengajuan', endDate)
          .order('tanggal_pengajuan', { ascending: true });

        if (error) throw error;

        const formatted = (data || []).map((p: any) => ({
          id: p.id,
          tanggal: p.tanggal_pengajuan,
          name: p.users?.name || 'Anggota',
          nip: p.users?.nip || '-',
          typeOrStatusOrAngsuran: p.status,
          nominal: parseFloat(p.nominal_pinjaman) || 0,
          keterangan: `Tenor: ${p.lama_angsuran_bulan} Bulan, Bunga: ${p.bunga_persen}%`
        }));

        setReports(formatted);
        setTotalNominal(formatted.reduce((sum, item) => sum + item.nominal, 0));

      } else if (jenisLaporan === 'angsuran') {
        const { data, error } = await supabase
          .from('angsuran')
          .select('*, pinjaman(*, users(name, nip))')
          .gte('tanggal_bayar', startDate)
          .lte('tanggal_bayar', endDate)
          .order('tanggal_bayar', { ascending: true });

        if (error) throw error;

        const formatted = (data || []).map((a: any) => ({
          id: a.id,
          tanggal: a.tanggal_bayar,
          name: a.pinjaman?.users?.name || 'Anggota',
          nip: a.pinjaman?.users?.nip || '-',
          typeOrStatusOrAngsuran: `Ke-${a.angsuran_ke}`,
          nominal: parseFloat(a.nominal_bayar) || 0,
          keterangan: `Pinjaman ID: #${a.pinjaman_id}`
        }));

        setReports(formatted);
        setTotalNominal(formatted.reduce((sum, item) => sum + item.nominal, 0));
      }

    } catch (err: any) {
      console.error('Error loading report:', err);
      setErrorMsg('Gagal memuat laporan: ' + err.message);
    } finally {
      setLoading(false);
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
    if (!dateStr) return '-';
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

  const getMonthName = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2 d-print-none">
        <div>
          <h4 className="fw-bold text-navy mb-1">Laporan Keuangan</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/admin/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item active">Laporan Keuangan</li>
            </ol>
          </nav>
        </div>

        {hasPulled && reports.length > 0 && (
          <button 
            onClick={() => window.print()} 
            className="btn btn-navy d-flex align-items-center gap-2"
          >
            <i className="fa-solid fa-print"></i> Cetak Laporan
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="alert alert-danger border-0 small mb-4 d-print-none">
          <i className="fa-solid fa-circle-exclamation me-1"></i> {errorMsg}
        </div>
      )}

      {/* Filter Form */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 d-print-none bg-white">
        <h5 className="fw-semibold mb-3">Filter Laporan</h5>
        <form onSubmit={handleTarikData}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Jenis Laporan</label>
              <select 
                className="form-select" 
                value={jenisLaporan}
                onChange={(e) => setJenisLaporan(e.target.value)}
                required
              >
                <option value="" disabled>Pilih laporan...</option>
                <option value="simpanan">Laporan Simpanan</option>
                <option value="pinjaman">Laporan Pinjaman</option>
                <option value="angsuran">Laporan Angsuran</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Tanggal Mulai</label>
              <input 
                type="date" 
                className="form-control" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required 
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Tanggal Selesai</label>
              <input 
                type="date" 
                className="form-control" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required 
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className="btn btn-navy w-100" disabled={loading}>
                {loading ? 'Memuat...' : 'Tarik Data'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Report View Card */}
      {hasPulled ? (
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          {/* Kop Surat */}
          <div className="text-center border-bottom pb-3 mb-4">
            <h4 className="fw-bold mb-1">KOPERASI SIMPAN PINJAM GURU</h4>
            <span className="text-muted">SMA Negeri Kota Bandung</span>
          </div>

          <div className="row mb-4">
            <div className="col-6">
              <small className="text-muted">Judul Laporan</small>
              <h6 className="fw-bold">
                {jenisLaporan === 'simpanan' && 'Laporan Simpanan'}
                {jenisLaporan === 'pinjaman' && 'Laporan Pinjaman'}
                {jenisLaporan === 'angsuran' && 'Laporan Angsuran'}
              </h6>
            </div>

            <div className="col-6 text-end">
              <small className="text-muted">Periode</small>
              <h6 className="fw-bold">
                {formatDateShort(startDate)} - {formatDateShort(endDate)}
              </h6>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading data...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    {jenisLaporan === 'simpanan' && (
                      <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Nama</th>
                        <th>NIP</th>
                        <th>Jenis</th>
                        <th>Nominal</th>
                        <th>Keterangan</th>
                      </tr>
                    )}
                    {jenisLaporan === 'pinjaman' && (
                      <tr>
                        <th>No</th>
                        <th>Tanggal</th>
                        <th>Nama</th>
                        <th>NIP</th>
                        <th>Nominal</th>
                        <th>Bunga</th>
                        <th>Tenor</th>
                        <th>Status</th>
                      </tr>
                    )}
                    {jenisLaporan === 'angsuran' && (
                      <tr>
                        <th>No</th>
                        <th>Tanggal Bayar</th>
                        <th>Nama</th>
                        <th>Angsuran Ke</th>
                        <th>Nominal Bayar</th>
                      </tr>
                    )}
                  </thead>

                  <tbody>
                    {reports.map((rep, index) => (
                      <tr key={rep.id}>
                        <td>{index + 1}</td>
                        <td>{formatDateShort(rep.tanggal)}</td>
                        <td>{rep.name}</td>
                        {jenisLaporan === 'simpanan' && (
                          <>
                            <td>{rep.nip}</td>
                            <td>{rep.typeOrStatusOrAngsuran}</td>
                            <td className="fw-bold text-dark">{formatRupiah(rep.nominal)}</td>
                            <td className="small text-muted">{rep.keterangan || '-'}</td>
                          </>
                        )}
                        {jenisLaporan === 'pinjaman' && (
                          <>
                            <td>{rep.nip}</td>
                            <td className="fw-bold text-dark">{formatRupiah(rep.nominal)}</td>
                            <td>{rep.keterangan?.split('Bunga: ')[1] || '-'}</td>
                            <td>{rep.keterangan?.split(', Bunga: ')[0]?.replace('Tenor: ', '') || '-'}</td>
                            <td>
                              <span className={`badge ${
                                rep.typeOrStatusOrAngsuran === 'berjalan' ? 'bg-primary-subtle text-primary' :
                                rep.typeOrStatusOrAngsuran === 'lunas' ? 'bg-success-subtle text-success' :
                                rep.typeOrStatusOrAngsuran === 'ditolak' ? 'bg-danger-subtle text-danger' :
                                'bg-warning-subtle text-warning'
                              } px-2 py-1 rounded small`}>
                                {rep.typeOrStatusOrAngsuran.toUpperCase()}
                              </span>
                            </td>
                          </>
                        )}
                        {jenisLaporan === 'angsuran' && (
                          <>
                            <td>{rep.typeOrStatusOrAngsuran}</td>
                            <td className="fw-bold text-dark">{formatRupiah(rep.nominal)}</td>
                          </>
                        )}
                      </tr>
                    ))}

                    {reports.length === 0 && (
                      <tr>
                        <td 
                          colSpan={jenisLaporan === 'simpanan' ? 7 : (jenisLaporan === 'pinjaman' ? 8 : 5)} 
                          className="text-center py-5 text-muted"
                        >
                          <i className="fa-regular fa-folder-open fa-2x mb-2 d-block text-secondary"></i>
                          Tidak ada data pada periode tersebut.
                        </td>
                      </tr>
                    )}
                  </tbody>

                  {reports.length > 0 && (
                    <tfoot>
                      <tr className="table-light fw-bold">
                        {jenisLaporan === 'simpanan' && (
                          <>
                            <td colSpan={5} className="text-end">TOTAL</td>
                            <td colSpan={2} className="text-navy">{formatRupiah(totalNominal)}</td>
                          </>
                        )}
                        {jenisLaporan === 'pinjaman' && (
                          <>
                            <td colSpan={4} className="text-end">TOTAL</td>
                            <td colSpan={4} className="text-navy">{formatRupiah(totalNominal)}</td>
                          </>
                        )}
                        {jenisLaporan === 'angsuran' && (
                          <>
                            <td colSpan={4} className="text-end">TOTAL</td>
                            <td className="text-navy">{formatRupiah(totalNominal)}</td>
                          </>
                        )}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Signature section */}
              <div className="row mt-5">
                <div className="col-6 text-center">
                  Mengetahui,
                  <br /><br /><br />
                  <strong>Ketua Koperasi</strong>
                </div>

                <div className="col-6 text-center">
                  Bandung, {getTodayDateLong()}
                  <br /><br /><br />
                  <strong>Bendahara</strong>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <i className="fa-solid fa-file-lines fa-3x text-secondary mb-3"></i>
          <h5>Silakan pilih jenis laporan terlebih dahulu.</h5>
          <p className="text-muted">Gunakan filter di atas untuk menampilkan laporan.</p>
        </div>
      )}
    </div>
  );
}
