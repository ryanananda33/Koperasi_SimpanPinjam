'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend,
  Filler
);

interface RecentRequest {
  id: number;
  nominal_pinjaman: number;
  lama_angsuran_bulan: number;
  alasan: string;
  users: {
    name: string;
  } | null;
}

export default function AdminDashboard() {
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalSavings: 0,
    totalLoansDisbursed: 0,
    activeLoansCount: 0,
    paidLoansCount: 0,
  });
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([]);
  const [chartData, setChartData] = useState<{
    savingsTrend: number[];
    loansMonthly: number[];
  }>({
    savingsTrend: Array(12).fill(0),
    loansMonthly: Array(12).fill(0),
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingData(true);

        // 1. Total Members
        const { count: memberCount, error: memberErr } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'anggota');
        if (memberErr) throw memberErr;

        // 2. Savings sum & chart calculations
        const { data: simpananList, error: simpErr } = await supabase
          .from('simpanan')
          .select('nominal, tanggal_transaksi');
        if (simpErr) throw simpErr;

        let totalSavingsSum = 0;
        const savingsMonthly = Array(12).fill(0);

        simpananList?.forEach((s) => {
          const nominalVal = parseFloat(s.nominal as any) || 0;
          totalSavingsSum += nominalVal;

          // Parse transaction date for chart (only 2026)
          const date = new Date(s.tanggal_transaksi);
          if (date.getFullYear() === 2026) {
            const monthIndex = date.getMonth(); // 0-11
            savingsMonthly[monthIndex] += nominalVal;
          }
        });

        // Accumulate savings trend
        let accumulatedSavings = 0;
        const savingsTrend = savingsMonthly.map((val) => {
          accumulatedSavings += val;
          return accumulatedSavings;
        });

        // 3. Loans calculations
        const { data: pinjamanList, error: pinjErr } = await supabase
          .from('pinjaman')
          .select('id, nominal_pinjaman, status, tanggal_pengajuan, alasan, lama_angsuran_bulan, users(name)');
        if (pinjErr) throw pinjErr;

        let totalLoansDisbursedSum = 0;
        let activeLoans = 0;
        let paidLoans = 0;
        const loansMonthly = Array(12).fill(0);
        const waitingList: RecentRequest[] = [];

        pinjamanList?.forEach((p) => {
          const nominalVal = parseFloat(p.nominal_pinjaman as any) || 0;

          if (p.status === 'berjalan' || p.status === 'lunas') {
            totalLoansDisbursedSum += nominalVal;
          }
          if (p.status === 'berjalan') {
            activeLoans++;
          }
          if (p.status === 'lunas') {
            paidLoans++;
          }

          // Parse monthly disbursed (for berjalan/lunas) in 2026
          const date = new Date(p.tanggal_pengajuan);
          if (date.getFullYear() === 2026 && (p.status === 'berjalan' || p.status === 'lunas')) {
            const monthIndex = date.getMonth();
            loansMonthly[monthIndex] += nominalVal;
          }

          // Filter for recent requests (status = 'menunggu')
          if (p.status === 'menunggu') {
            // Typecast nested join safely
            const userRelation = p.users as any;
            waitingList.push({
              id: p.id,
              nominal_pinjaman: nominalVal,
              lama_angsuran_bulan: p.lama_angsuran_bulan,
              alasan: p.alasan || '',
              users: userRelation ? { name: userRelation.name } : null
            });
          }
        });

        // Sort waiting list by id desc (surrogate for chronological date)
        waitingList.sort((a, b) => b.id - a.id);

        setStats({
          totalMembers: memberCount || 0,
          totalSavings: totalSavingsSum,
          totalLoansDisbursed: totalLoansDisbursedSum,
          activeLoansCount: activeLoans,
          paidLoansCount: paidLoans,
        });

        setRecentRequests(waitingList.slice(0, 5));

        setChartData({
          savingsTrend,
          loansMonthly,
        });

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val).replace('IDR', 'Rp');
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Line Chart Configs
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'],
    datasets: [
      {
        label: 'Akumulasi Simpanan',
        data: chartData.savingsTrend,
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.05)',
        fill: true,
        tension: 0.3,
        borderWidth: 2.5,
      },
      {
        label: 'Penyaluran Pinjaman',
        data: chartData.loansMonthly,
        borderColor: '#f59e0b',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        borderWidth: 2.5,
        borderDash: [5, 5],
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Inter',
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return 'Rp ' + value.toLocaleString('id-ID');
          },
          font: {
            family: 'Inter',
            size: 10,
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Inter',
            size: 10,
          },
        },
      },
    },
  };

  return (
    <div className="container-fluid p-0">
      {/* Page Header & Breadcrumb */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold text-navy mb-1">Dashboard Admin</h4>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="#" onClick={(e) => e.preventDefault()}>Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Dashboard
              </li>
            </ol>
          </nav>
        </div>
        <div className="text-muted small">
          <i className="fa-regular fa-calendar-days me-1"></i> Hari ini: {getTodayDate()}
        </div>
      </div>

      {loadingData ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading data...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="row g-3 mb-4">
            {/* Card: Members */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats-card">
                <div className="card-data">
                  <h6>Jumlah Anggota</h6>
                  <h3>{stats.totalMembers.toLocaleString('id-ID')}</h3>
                </div>
                <div className="card-icon stats-icon-blue">
                  <i className="fa-solid fa-users"></i>
                </div>
              </div>
            </div>

            {/* Card: Savings */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats-card">
                <div className="card-data">
                  <h6>Total Simpanan</h6>
                  <h3>{formatRupiah(stats.totalSavings)}</h3>
                </div>
                <div className="card-icon stats-icon-green">
                  <i className="fa-solid fa-piggy-bank"></i>
                </div>
              </div>
            </div>

            {/* Card: Loans */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats-card">
                <div className="card-data">
                  <h6>Total Pinjaman</h6>
                  <h3>{formatRupiah(stats.totalLoansDisbursed)}</h3>
                </div>
                <div className="card-icon stats-icon-orange">
                  <i className="fa-solid fa-hand-holding-dollar"></i>
                </div>
              </div>
            </div>

            {/* Card: Status Counts */}
            <div className="col-12 col-sm-6 col-lg-3">
              <div className="stats-card">
                <div className="card-data">
                  <h6>Cicilan Berjalan</h6>
                  <h3>
                    {stats.activeLoansCount} / <span className="fs-6 text-muted">{stats.paidLoansCount} Lunas</span>
                  </h3>
                </div>
                <div className="card-icon stats-icon-purple">
                  <i className="fa-solid fa-arrow-trend-up"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Chart & Table Area */}
          <div className="row g-4 mb-4">
            {/* Graphic Chart */}
            <div className="col-12 col-xl-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <h5 className="fw-semibold mb-3 text-dark">Grafik Perkembangan Keuangan (2026)</h5>
                <div style={{ position: 'relative', height: '320px' }}>
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>
            </div>

            {/* Recent Pending Loans */}
            <div className="col-12 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-semibold mb-0 text-dark">Pengajuan Pinjaman</h5>
                  <span className="badge bg-warning-subtle text-warning px-2.5 py-1.5 rounded-pill small">
                    {recentRequests.length} Menunggu
                  </span>
                </div>

                <div className="list-group list-group-flush gap-3" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                  {recentRequests.map((req) => (
                    <div key={req.id} className="list-group-item border-0 p-0 d-flex flex-column gap-1 bg-transparent">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-medium text-dark">{req.users?.name || 'Anggota'}</span>
                        <span className="badge bg-warning-subtle text-warning text-xsmall uppercase px-2 py-1 rounded">
                          Menunggu
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center text-muted small">
                        <span>
                          Plafon: <strong>{formatRupiah(req.nominal_pinjaman)}</strong>
                        </span>
                        <span>{req.lama_angsuran_bulan} bln</span>
                      </div>
                      <span className="xsmall text-muted text-truncate italic">"{req.alasan}"</span>
                      <div className="d-flex gap-2 mt-1">
                        <Link
                          href={`/admin/pinjaman/${req.id}`}
                          className="btn btn-primary-subtle btn-sm flex-fill py-1"
                        >
                          <i className="fa-solid fa-circle-info"></i> Detail
                        </Link>
                      </div>
                      <hr className="my-2 text-slate-200" />
                    </div>
                  ))}

                  {recentRequests.length === 0 && (
                    <div className="text-center py-5 text-muted">
                      <i className="fa-regular fa-folder-open fa-2x mb-2 text-slate-400 d-block"></i>
                      <span className="small">Tidak ada pengajuan pinjaman pending.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
