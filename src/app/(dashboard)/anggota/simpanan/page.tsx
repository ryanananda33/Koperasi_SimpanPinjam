'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface SimpananTrx {
  id: number;
  tipe_simpanan: 'pokok' | 'wajib' | 'sukarela' | 'manasuka';
  nominal: number;
  tanggal_transaksi: string;
  keterangan: string | null;
}

export default function AnggotaSimpanan() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<SimpananTrx[]>([]);
  
  // Totals
  const [wajib, setWajib] = useState(0);
  const [manasuka, setManasuka] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchPersonalSavings = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('simpanan')
          .select('*')
          .eq('user_id', user.id)
          .order('tanggal_transaksi', { ascending: false });

        if (error) throw error;

        const mapped = (data || []).map((s: any) => ({
          id: s.id,
          tipe_simpanan: s.tipe_simpanan,
          nominal: parseFloat(s.nominal) || 0,
          tanggal_transaksi: s.tanggal_transaksi,
          keterangan: s.keterangan
        }));

        setTransactions(mapped);

        // Sum aggregates
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
      } catch (err) {
        console.error('Error fetching personal savings ledger:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalSavings();
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
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Simpanan Saya</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/anggota/dashboard">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Simpanan Saya
              </li>
            </ol>
          </nav>
        </div>
      </div>

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
          <div className="card border border-primary shadow-sm p-3 rounded-4 text-center bg-white">
            <span className="small text-dark d-block mb-1">Total Simpanan</span>
            <h5 className="fw-bold text-primary mb-0">{formatRupiah(total)}</h5>
          </div>
        </div>
      </div>

      {/* Mutations Ledger Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white p-4">
        <h5 className="fw-semibold text-navy mb-3 border-bottom pb-2">
          <i className="fa-solid fa-receipt me-1"></i> Rincian Mutasi Setoran
        </h5>
        
        <div className="table-responsive">
          <table className="table custom-table align-middle mb-0 text-start small">
            <thead>
              <tr className="table-light text-muted">
                <th>No</th>
                <th>Tanggal Transaksi</th>
                <th>Kategori Simpanan</th>
                <th>Nominal Setoran</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((s, idx) => (
                <tr key={s.id}>
                  <td className="text-muted">{idx + 1}</td>
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
                  <td className="text-muted">{s.keterangan || '-'}</td>
                </tr>
              ))}

              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    <i className="fa-regular fa-folder-open fa-2x mb-2 text-slate-300"></i>
                    <p className="mb-0 small">Belum ada catatan mutasi tabungan Anda.</p>
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
