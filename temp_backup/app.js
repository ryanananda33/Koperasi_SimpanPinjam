/* app.js - Koperasi Simpan Pinjam Guru */

// ================= DATA SEEDING & DATABASE SYSTEM =================
const DEFAULT_USERS = [
    { id: 1, name: "Administrator Koperasi", email: "admin@koperasi.id", password: "admin123", role: "admin", nip: "ADMIN-01", address: "Kantor Tata Usaha Sekolah", phone: "081234567890", status: "aktif" },
    { id: 2, name: "Budi Setiawan, S.Pd.", email: "guru@koperasi.id", password: "guru123", role: "anggota", nip: "198503122010011002", address: "Jl. Pendidikan No. 45, Bandung", phone: "089876543210", status: "aktif" },
    { id: 3, name: "Siti Aminah, M.Pd.", email: "siti@koperasi.id", password: "guru123", role: "anggota", nip: "198807242014022001", address: "Jl. Merdeka No. 12, Bandung", phone: "081223344556", status: "aktif" },
    { id: 4, name: "Drs. Ahmad Subagja", email: "ahmad@koperasi.id", password: "guru123", role: "anggota", nip: "197211051998031003", address: "Komp. Pendidik Blok C2, Bandung", phone: "085712345678", status: "aktif" },
    { id: 5, name: "Rina Wijaya, S.Si.", email: "rina@koperasi.id", password: "guru123", role: "anggota", nip: "199209152019032011", address: "Jl. Cihampelas No. 102, Bandung", phone: "082198765432", status: "nonaktif" }
];

const DEFAULT_SIMPANAN = [
    { id: 1, user_id: 2, tipe_simpanan: "pokok", nominal: 500000, tanggal_transaksi: "2026-01-05", keterangan: "Simpanan Pokok Awal Keanggotaan" },
    { id: 2, user_id: 2, tipe_simpanan: "wajib", nominal: 100000, tanggal_transaksi: "2026-02-05", keterangan: "Simpanan Wajib Februari 2026" },
    { id: 3, user_id: 2, tipe_simpanan: "wajib", nominal: 100000, tanggal_transaksi: "2026-03-05", keterangan: "Simpanan Wajib Maret 2026" },
    { id: 4, user_id: 2, tipe_simpanan: "sukarela", nominal: 250000, tanggal_transaksi: "2026-03-10", keterangan: "Simpanan Sukarela Kegiatan Guru" },
    { id: 5, user_id: 3, tipe_simpanan: "pokok", nominal: 500000, tanggal_transaksi: "2026-02-15", keterangan: "Simpanan Pokok Awal Keanggotaan" },
    { id: 6, user_id: 3, tipe_simpanan: "wajib", nominal: 100000, tanggal_transaksi: "2026-03-15", keterangan: "Simpanan Wajib Maret 2026" },
    { id: 7, user_id: 4, tipe_simpanan: "pokok", nominal: 500000, tanggal_transaksi: "2026-01-10", keterangan: "Simpanan Pokok Awal Keanggotaan" },
    { id: 8, user_id: 4, tipe_simpanan: "wajib", nominal: 100000, tanggal_transaksi: "2026-02-10", keterangan: "Simpanan Wajib Februari 2026" },
    { id: 9, user_id: 4, tipe_simpanan: "wajib", nominal: 100000, tanggal_transaksi: "2026-03-10", keterangan: "Simpanan Wajib Maret 2026" },
    { id: 10, user_id: 4, tipe_simpanan: "sukarela", nominal: 1500000, tanggal_transaksi: "2026-03-25", keterangan: "Simpanan Sukarela THR" }
];

const DEFAULT_PINJAMAN = [
    { id: 1, user_id: 2, nominal_pinjaman: 5000000, bunga_persen: 1.5, lama_angsuran_bulan: 10, sisa_angsuran_bulan: 8, tanggal_pengajuan: "2026-02-01", tanggal_jatuh_tempo: "2026-12-01", status: "berjalan", alasan: "Biaya perbaikan atap rumah bocor" },
    { id: 2, user_id: 3, nominal_pinjaman: 3000000, bunga_persen: 1.5, lama_angsuran_bulan: 6, sisa_angsuran_bulan: 6, tanggal_pengajuan: "2026-06-20", tanggal_jatuh_tempo: null, status: "menunggu", alasan: "Biaya pendaftaran sekolah anak" },
    { id: 3, user_id: 4, nominal_pinjaman: 10000000, bunga_persen: 1.2, lama_angsuran_bulan: 12, sisa_angsuran_bulan: 0, tanggal_pengajuan: "2025-05-10", tanggal_jatuh_tempo: "2026-05-10", status: "lunas", alasan: "Kebutuhan mendesak pengobatan keluarga" },
    { id: 4, user_id: 2, nominal_pinjaman: 2000000, bunga_persen: 0.0, lama_angsuran_bulan: 4, sisa_angsuran_bulan: 4, tanggal_pengajuan: "2026-05-12", tanggal_jatuh_tempo: null, status: "ditolak", alasan: "Pengajuan pinjaman ditolak karena sisa pinjaman sebelumnya masih aktif" }
];

const DEFAULT_ANGSURAN = [
    { id: 1, pinjaman_id: 1, angsuran_ke: 1, nominal_bayar: 575000, tanggal_bayar: "2026-03-01" }, // (5,000,000 / 10) + 1.5% of 5,000,000
    { id: 2, pinjaman_id: 1, angsuran_ke: 2, nominal_bayar: 575000, tanggal_bayar: "2026-04-01" }
];

class Database {
    static init() {
        if (!localStorage.getItem("kop_users")) localStorage.setItem("kop_users", JSON.stringify(DEFAULT_USERS));
        if (!localStorage.getItem("kop_simpanan")) localStorage.setItem("kop_simpanan", JSON.stringify(DEFAULT_SIMPANAN));
        if (!localStorage.getItem("kop_pinjaman")) localStorage.setItem("kop_pinjaman", JSON.stringify(DEFAULT_PINJAMAN));
        if (!localStorage.getItem("kop_angsuran")) localStorage.setItem("kop_angsuran", JSON.stringify(DEFAULT_ANGSURAN));
    }

    static get(table) {
        return JSON.parse(localStorage.getItem(`kop_${table}`));
    }

    static save(table, data) {
        localStorage.setItem(`kop_${table}`, JSON.stringify(data));
    }
}

// Initialize on load
Database.init();

// ================= GLOBAL STATE =================
let currentUser = JSON.parse(sessionStorage.getItem("kop_current_user")) || null;
let currentChart = null;

// ================= UTILITIES =================
function formatRupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;
    
    let icon = "fa-check-circle";
    if (type === "error") icon = "fa-times-circle";
    if (type === "warning") icon = "fa-exclamation-circle";

    toast.innerHTML = `
        <i class="fas ${icon} toast-icon"></i>
        <div>
            <div style="font-weight: 600; font-size: 0.9rem;">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${message}</div>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 50);

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ================= USER ROUTING SYSTEM =================
const routes = {
    "login": { title: "Masuk", section: "section-login", breadcrumb: [] },
    
    // Admin Routes
    "admin-dashboard": { title: "Dashboard Admin", section: "section-admin-dashboard", breadcrumb: ["Dashboard"] },
    "data-anggota": { title: "Data Anggota", section: "section-data-anggota", breadcrumb: ["Dashboard", "Data Anggota"] },
    "detail-anggota": { title: "Detail Anggota", section: "section-detail-anggota", breadcrumb: ["Dashboard", "Data Anggota", "Detail"] },
    "simpanan": { title: "Kelola Simpanan", section: "section-simpanan", breadcrumb: ["Dashboard", "Simpanan"] },
    "detail-simpanan": { title: "Detail Simpanan", section: "section-detail-simpanan", breadcrumb: ["Dashboard", "Simpanan", "Detail"] },
    "pinjaman": { title: "Kelola Pinjaman", section: "section-pinjaman", breadcrumb: ["Dashboard", "Pinjaman"] },
    "detail-pinjaman": { title: "Detail Pinjaman", section: "section-detail-pinjaman", breadcrumb: ["Dashboard", "Pinjaman", "Detail"] },
    "laporan": { title: "Laporan", section: "section-laporan", breadcrumb: ["Dashboard", "Laporan"] },

    // Anggota Routes
    "anggota-dashboard": { title: "Dashboard Anggota", section: "section-anggota-dashboard", breadcrumb: ["Dashboard"] },
    "anggota-simpanan": { title: "Riwayat Simpanan Saya", section: "section-anggota-simpanan", breadcrumb: ["Dashboard", "Simpanan Saya"] },
    "anggota-pinjaman": { title: "Riwayat Pinjaman Saya", section: "section-anggota-pinjaman", breadcrumb: ["Dashboard", "Pinjaman Saya"] },
    "pengajuan-pinjaman": { title: "Pengajuan Pinjaman Baru", section: "section-pengajuan-pinjaman", breadcrumb: ["Dashboard", "Ajukan Pinjaman"] },
    
    // Shared Routes
    "profil": { title: "Profil Pengguna", section: "section-profil", breadcrumb: ["Dashboard", "Profil"] }
};

function navigateTo(routeKey, param = null) {
    const route = routes[routeKey];
    if (!route) return;

    // Check Auth
    if (routeKey !== "login" && !currentUser) {
        navigateTo("login");
        return;
    }

    // Role Guard Check
    if (currentUser) {
        if (currentUser.role === "admin" && routeKey.startsWith("anggota-")) {
            navigateTo("admin-dashboard");
            return;
        }
        if (currentUser.role === "anggota" && ["data-anggota", "simpanan", "pinjaman", "laporan"].includes(routeKey)) {
            navigateTo("anggota-dashboard");
            return;
        }
    }

    // Toggle Content Sections
    document.querySelectorAll(".content-section").forEach(s => s.classList.add("d-none"));
    document.getElementById(route.section).classList.remove("d-none");

    // Hide/Show Sidebars/Navbars based on Login status
    if (routeKey === "login") {
        document.getElementById("sidebar").classList.add("d-none");
        document.getElementById("main-content").style.marginLeft = "0";
        document.getElementById("top-navbar").classList.add("d-none");
    } else {
        document.getElementById("sidebar").classList.remove("d-none");
        if (window.innerWidth > 991.98) {
            document.getElementById("main-content").style.marginLeft = "var(--sidebar-width)";
        } else {
            document.getElementById("main-content").style.marginLeft = "0";
        }
        document.getElementById("top-navbar").classList.remove("d-none");
    }

    // Update Sidebar Active state
    document.querySelectorAll("#sidebar .menu-link").forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("data-route") === routeKey) {
            link.classList.add("active");
        }
    });

    // Update Top Navbar Profile & Breadcrumbs
    updateTopNavbar(route);

    // Call Screen Initializers
    if (routeKey === "admin-dashboard") initAdminDashboard();
    if (routeKey === "anggota-dashboard") initAnggotaDashboard();
    if (routeKey === "data-anggota") renderDataAnggotaTable();
    if (routeKey === "detail-anggota") renderDetailAnggota(param);
    if (routeKey === "simpanan") renderSimpananTable();
    if (routeKey === "detail-simpanan") renderDetailSimpanan(param);
    if (routeKey === "pinjaman") renderPinjamanTable();
    if (routeKey === "detail-pinjaman") renderDetailPinjaman(param);
    if (routeKey === "laporan") initLaporanScreen();
    if (routeKey === "anggota-simpanan") renderAnggotaSimpananTable();
    if (routeKey === "anggota-pinjaman") renderAnggotaPinjamanTable();
    if (routeKey === "pengajuan-pinjaman") document.getElementById("form-pengajuan-pinjaman-el").reset();
    if (routeKey === "profil") renderUserProfile();

    // Scroll to top
    window.scrollTo(0, 0);

    // Hide mobile drawer if shown
    document.getElementById("sidebar").classList.remove("show-sidebar");
    document.getElementById("sidebar-overlay").classList.remove("show-overlay");
}

function updateTopNavbar(route) {
    if (!currentUser) return;
    
    // Profile info
    document.getElementById("nav-profile-name").textContent = currentUser.name;
    document.getElementById("nav-profile-role").textContent = currentUser.role === "admin" ? "Administrator" : "Anggota Koperasi";
    document.getElementById("nav-role-badge-text").textContent = currentUser.role === "admin" ? "Admin Mode" : "Anggota Mode";
    
    // Breadcrumbs
    const container = document.getElementById("navbar-breadcrumb");
    container.innerHTML = "";
    
    // Home/Dashboard Link
    const liHome = document.createElement("li");
    const dashboardRoute = currentUser.role === "admin" ? "admin-dashboard" : "anggota-dashboard";
    liHome.innerHTML = `<a href="#" onclick="navigateTo('${dashboardRoute}'); return false;">Koperasi</a>`;
    container.appendChild(liHome);

    route.breadcrumb.forEach((crumb, index) => {
        const li = document.createElement("li");
        if (index === route.breadcrumb.length - 1) {
            li.textContent = crumb;
        } else {
            // Find key of the crumb if possible, or link to dashboard
            li.innerHTML = `<a href="#" onclick="navigateTo('${dashboardRoute}'); return false;">${crumb}</a>`;
        }
        container.appendChild(li);
    });
}

// ================= AUTHENTICATION LOGIC =================
document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const users = Database.get("users");
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (user) {
        if (user.status !== "aktif") {
            showToast("Akun Anda dinonaktifkan. Hubungi admin untuk mengaktifkan kembali.", "error");
            return;
        }
        
        currentUser = user;
        sessionStorage.setItem("kop_current_user", JSON.stringify(currentUser));
        
        // Show correct sidebar options based on role
        document.querySelectorAll("#sidebar .admin-only").forEach(el => {
            currentUser.role === "admin" ? el.classList.remove("d-none") : el.classList.add("d-none");
        });
        document.querySelectorAll("#sidebar .anggota-only").forEach(el => {
            currentUser.role === "anggota" ? el.classList.remove("d-none") : el.classList.add("d-none");
        });

        showToast(`Selamat datang kembali, ${user.name}!`, "success");
        if (user.role === "admin") {
            navigateTo("admin-dashboard");
        } else {
            navigateTo("anggota-dashboard");
        }
    } else {
        showToast("Email atau password salah!", "error");
    }
});

function handleLogout() {
    currentUser = null;
    sessionStorage.removeItem("kop_current_user");
    showToast("Anda telah keluar dari sistem.", "warning");
    navigateTo("login");
}

function switchRoleDemo() {
    if (!currentUser) return;
    const users = Database.get("users");
    if (currentUser.role === "admin") {
        // Switch to Anggota (Budi Setiawan)
        currentUser = users.find(u => u.role === "anggota");
    } else {
        // Switch to Admin
        currentUser = users.find(u => u.role === "admin");
    }
    sessionStorage.setItem("kop_current_user", JSON.stringify(currentUser));
    
    // Reload menu visibility
    document.querySelectorAll("#sidebar .admin-only").forEach(el => {
        currentUser.role === "admin" ? el.classList.remove("d-none") : el.classList.add("d-none");
    });
    document.querySelectorAll("#sidebar .anggota-only").forEach(el => {
        currentUser.role === "anggota" ? el.classList.remove("d-none") : el.classList.add("d-none");
    });
    
    showToast(`Beralih peran ke: ${currentUser.name} (${currentUser.role})`, "success");
    navigateTo(currentUser.role === "admin" ? "admin-dashboard" : "anggota-dashboard");
}

function handleQuickLogin(role) {
    if (role === "admin") {
        document.getElementById("login-email").value = "admin@koperasi.id";
        document.getElementById("login-password").value = "admin123";
    } else {
        document.getElementById("login-email").value = "guru@koperasi.id";
        document.getElementById("login-password").value = "guru123";
    }
    document.getElementById("login-form").dispatchEvent(new Event("submit"));
}

// ================= SCREEN 1: ADMIN DASHBOARD =================
function initAdminDashboard() {
    const users = Database.get("users").filter(u => u.role === "anggota");
    const simpanan = Database.get("simpanan");
    const pinjaman = Database.get("pinjaman");
    const angsuran = Database.get("angsuran");

    // Compute Stat Metrics
    const totalMembers = users.length;
    const totalSavings = simpanan.reduce((sum, item) => sum + item.nominal, 0);
    
    // Net loans disbursed (exclude status=ditolak or menunggu)
    const activeLoansCount = pinjaman.filter(p => p.status === "berjalan").length;
    const paidLoansCount = pinjaman.filter(p => p.status === "lunas").length;
    
    // Total loan amount disbursed
    const totalLoansDisbursed = pinjaman
        .filter(p => ["berjalan", "lunas"].includes(p.status))
        .reduce((sum, p) => sum + p.nominal_pinjaman, 0);

    // Update metrics UI
    document.getElementById("admin-stat-members").textContent = totalMembers;
    document.getElementById("admin-stat-savings").textContent = formatRupiah(totalSavings);
    document.getElementById("admin-stat-loans").textContent = formatRupiah(totalLoansDisbursed);
    document.getElementById("admin-stat-loans-active").textContent = activeLoansCount;
    document.getElementById("admin-stat-loans-paid").textContent = paidLoansCount;

    // Render recent pinjaman requests table in dashboard
    const recentRequests = pinjaman.filter(p => p.status === "menunggu").slice(0, 5);
    const tableBody = document.getElementById("admin-dashboard-recent-requests");
    tableBody.innerHTML = "";
    
    if (recentRequests.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Tidak ada pengajuan pinjaman menunggu persetujuan.</td></tr>`;
    } else {
        recentRequests.forEach(req => {
            const member = Database.get("users").find(u => u.id === req.user_id);
            tableBody.innerHTML += `
                <tr>
                    <td>${member ? member.name : "N/A"}</td>
                    <td>${formatRupiah(req.nominal_pinjaman)}</td>
                    <td>${req.lama_angsuran_bulan} Bulan</td>
                    <td>${req.tanggal_pengajuan}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="navigateTo('pinjaman')">
                            Proses <i class="fas fa-arrow-right ms-1"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    // Render Chart
    renderDashboardCharts(simpanan, pinjaman);
}

function renderDashboardCharts(simpanan, pinjaman) {
    const ctx = document.getElementById("savingsLoansChart").getContext("2d");
    if (currentChart) {
        currentChart.destroy();
    }

    // Map monthly data for 2026
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const savingsMonthly = Array(12).fill(0);
    const loansMonthly = Array(12).fill(0);

    // Group savings by month
    simpanan.forEach(s => {
        const date = new Date(s.tanggal_transaksi);
        if (date.getFullYear() === 2026) {
            savingsMonthly[date.getMonth()] += s.nominal;
        }
    });

    // Group loans by month (using approved/disbursed loans)
    pinjaman.forEach(p => {
        if (["berjalan", "lunas"].includes(p.status)) {
            const date = new Date(p.tanggal_pengajuan);
            if (date.getFullYear() === 2026) {
                loansMonthly[date.getMonth()] += p.nominal_pinjaman;
            }
        }
    });

    // We accumulate savings to show savings balance growth over time
    let accumulatedSavings = 0;
    const savingsTrend = savingsMonthly.map(val => {
        accumulatedSavings += val;
        return accumulatedSavings;
    });

    currentChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: months,
            datasets: [
                {
                    label: "Perkembangan Simpanan (Akumulatif)",
                    data: savingsTrend,
                    borderColor: "#2563eb",
                    backgroundColor: "rgba(37, 99, 235, 0.05)",
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: "Pinjaman Disalurkan (Bulanan)",
                    data: loansMonthly,
                    borderColor: "#0ea5e9",
                    backgroundColor: "rgba(14, 165, 233, 0.05)",
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        font: { family: "Inter", size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return formatRupiah(value);
                        }
                    }
                }
            }
        }
    });
}

// ================= SCREEN 2: ANGGOTA DASHBOARD =================
function initAnggotaDashboard() {
    const simpanan = Database.get("simpanan").filter(s => s.user_id === currentUser.id);
    const pinjaman = Database.get("pinjaman").filter(p => p.user_id === currentUser.id);
    
    // Calculations
    const totalSavings = simpanan.reduce((sum, item) => sum + item.nominal, 0);
    const activeLoan = pinjaman.find(p => p.status === "berjalan");
    const totalLoans = pinjaman.reduce((sum, item) => sum + item.nominal_pinjaman, 0);
    
    document.getElementById("member-stat-savings").textContent = formatRupiah(totalSavings);
    
    if (activeLoan) {
        document.getElementById("member-stat-loan-active").textContent = formatRupiah(activeLoan.nominal_pinjaman);
        document.getElementById("member-stat-loan-remaining").textContent = `${activeLoan.sisa_angsuran_bulan} bulan`;
        document.getElementById("member-stat-loan-status").innerHTML = `<span class="badge badge-soft-berjalan">Berjalan</span>`;
    } else {
        document.getElementById("member-stat-loan-active").textContent = "-";
        document.getElementById("member-stat-loan-remaining").textContent = "-";
        
        const latestLoan = pinjaman[pinjaman.length - 1];
        if (latestLoan) {
            let badgeClass = `badge-soft-${latestLoan.status}`;
            document.getElementById("member-stat-loan-status").innerHTML = `<span class="badge ${badgeClass}">${latestLoan.status.toUpperCase()}</span>`;
        } else {
            document.getElementById("member-stat-loan-status").textContent = "Tidak ada pinjaman";
        }
    }

    // Personal savings breakups
    const pok = simpanan.filter(s => s.tipe_simpanan === "pokok").reduce((sum, item) => sum + item.nominal, 0);
    const waj = simpanan.filter(s => s.tipe_simpanan === "wajib").reduce((sum, item) => sum + item.nominal, 0);
    const suk = simpanan.filter(s => s.tipe_simpanan === "sukarela").reduce((sum, item) => sum + item.nominal, 0);

    document.getElementById("member-breakdown-pokok").textContent = formatRupiah(pok);
    document.getElementById("member-breakdown-wajib").textContent = formatRupiah(waj);
    document.getElementById("member-breakdown-sukarela").textContent = formatRupiah(suk);

    // Render recent personal transactions
    const transactions = [...simpanan.map(s => ({...s, type: 'simpanan'})), ...pinjaman.map(p => ({...p, type: 'pinjaman'}))];
    transactions.sort((a,b) => new Date(b.tanggal_transaksi || b.tanggal_pengajuan) - new Date(a.tanggal_transaksi || a.tanggal_pengajuan));
    
    const tableBody = document.getElementById("member-dashboard-recent");
    tableBody.innerHTML = "";
    
    const recents = transactions.slice(0, 5);
    if (recents.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada riwayat transaksi.</td></tr>`;
    } else {
        recents.forEach(t => {
            let label = "";
            let amount = 0;
            let statusBadge = "";
            let date = t.tanggal_transaksi || t.tanggal_pengajuan;

            if (t.type === "simpanan") {
                label = `Simpanan ${t.tipe_simpanan.charAt(0).toUpperCase() + t.tipe_simpanan.slice(1)}`;
                amount = t.nominal;
                statusBadge = `<span class="badge badge-soft-aktif">Sukses</span>`;
            } else {
                label = `Pinjaman Baru`;
                amount = t.nominal_pinjaman;
                let badgeClass = `badge-soft-${t.status}`;
                statusBadge = `<span class="badge ${badgeClass}">${t.status.toUpperCase()}</span>`;
            }

            tableBody.innerHTML += `
                <tr>
                    <td>${date}</td>
                    <td>${label}</td>
                    <td class="fw-bold text-dark">${formatRupiah(amount)}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });
    }
}

// ================= SCREEN 3: DATA ANGGOTA CRUD =================
function renderDataAnggotaTable() {
    const search = document.getElementById("anggota-search").value.trim().toLowerCase();
    const filter = document.getElementById("anggota-filter-status").value;
    const users = Database.get("users").filter(u => u.role === "anggota");

    const filtered = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search) || (u.nip && u.nip.toLowerCase().includes(search)) || u.email.toLowerCase().includes(search);
        const matchesFilter = filter === "all" || u.status === filter;
        return matchesSearch && matchesFilter;
    });

    const tbody = document.getElementById("anggota-table-body");
    tbody.innerHTML = "";

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Data anggota tidak ditemukan.</td></tr>`;
        return;
    }

    filtered.forEach(u => {
        const badgeClass = `badge-soft-${u.status}`;
        tbody.innerHTML += `
            <tr>
                <td>${u.nip || '-'}</td>
                <td>
                    <div class="fw-bold">${u.name}</div>
                    <div class="text-muted" style="font-size: 0.8rem;">${u.email}</div>
                </td>
                <td>${u.phone || '-'}</td>
                <td>${u.address || '-'}</td>
                <td><span class="badge ${badgeClass}">${u.status.toUpperCase()}</span></td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="navigateTo('detail-anggota', ${u.id})" title="Detail">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary mx-1" onclick="openEditAnggotaModal(${u.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteAnggota(${u.id})" title="Hapus">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// Trigger filters
document.getElementById("anggota-search").addEventListener("input", renderDataAnggotaTable);
document.getElementById("anggota-filter-status").addEventListener("change", renderDataAnggotaTable);

function openAddAnggotaModal() {
    document.getElementById("anggota-modal-title").textContent = "Tambah Anggota Guru Baru";
    document.getElementById("anggota-form-id").value = "";
    document.getElementById("anggota-form-name").value = "";
    document.getElementById("anggota-form-email").value = "";
    document.getElementById("anggota-form-nip").value = "";
    document.getElementById("anggota-form-phone").value = "";
    document.getElementById("anggota-form-address").value = "";
    document.getElementById("anggota-form-status").value = "aktif";
    document.getElementById("anggota-form-password-wrapper").classList.remove("d-none");
    document.getElementById("anggota-form-password").setAttribute("required", "required");

    const modal = new bootstrap.Modal(document.getElementById("anggota-modal"));
    modal.show();
}

function openEditAnggotaModal(id) {
    const user = Database.get("users").find(u => u.id === id);
    if (!user) return;

    document.getElementById("anggota-modal-title").textContent = "Edit Data Anggota";
    document.getElementById("anggota-form-id").value = user.id;
    document.getElementById("anggota-form-name").value = user.name;
    document.getElementById("anggota-form-email").value = user.email;
    document.getElementById("anggota-form-nip").value = user.nip || "";
    document.getElementById("anggota-form-phone").value = user.phone || "";
    document.getElementById("anggota-form-address").value = user.address || "";
    document.getElementById("anggota-form-status").value = user.status;
    document.getElementById("anggota-form-password-wrapper").classList.add("d-none");
    document.getElementById("anggota-form-password").removeAttribute("required");

    const modal = new bootstrap.Modal(document.getElementById("anggota-modal"));
    modal.show();
}

document.getElementById("anggota-form-el").addEventListener("submit", function(e) {
    e.preventDefault();
    const id = document.getElementById("anggota-form-id").value;
    const name = document.getElementById("anggota-form-name").value.trim();
    const email = document.getElementById("anggota-form-email").value.trim();
    const nip = document.getElementById("anggota-form-nip").value.trim();
    const phone = document.getElementById("anggota-form-phone").value.trim();
    const address = document.getElementById("anggota-form-address").value.trim();
    const status = document.getElementById("anggota-form-status").value;

    const users = Database.get("users");

    if (id) {
        // Edit Action
        const idx = users.findIndex(u => u.id === parseInt(id));
        if (idx !== -1) {
            // Check email/nip uniqueness
            if (users.some((u, i) => i !== idx && u.email.toLowerCase() === email.toLowerCase())) {
                showToast("Email sudah digunakan oleh anggota lain!", "error");
                return;
            }
            if (nip && users.some((u, i) => i !== idx && u.nip === nip)) {
                showToast("NIP sudah terdaftar!", "error");
                return;
            }

            users[idx] = { ...users[idx], name, email, nip, phone, address, status };
            Database.save("users", users);
            showToast("Data anggota berhasil diperbarui.", "success");
        }
    } else {
        // Add Action
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast("Email sudah terdaftar!", "error");
            return;
        }
        if (nip && users.some(u => u.nip === nip)) {
            showToast("NIP sudah terdaftar!", "error");
            return;
        }

        const password = document.getElementById("anggota-form-password").value;
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        users.push({
            id: newId, name, email, password, role: "anggota", nip, phone, address, status
        });
        
        Database.save("users", users);
        showToast("Anggota baru berhasil ditambahkan.", "success");
    }

    bootstrap.Modal.getInstance(document.getElementById("anggota-modal")).hide();
    renderDataAnggotaTable();
});

let deleteTargetId = null;
function confirmDeleteAnggota(id) {
    deleteTargetId = id;
    const user = Database.get("users").find(u => u.id === id);
    if (!user) return;
    
    document.getElementById("confirm-delete-body").innerHTML = `Apakah Anda yakin ingin menghapus data anggota <strong>${user.name}</strong>? Tindakan ini tidak dapat dibatalkan.`;
    const modal = new bootstrap.Modal(document.getElementById("confirm-delete-modal"));
    modal.show();
}

function executeDeleteAnggota() {
    if (!deleteTargetId) return;
    
    let users = Database.get("users");
    users = users.filter(u => u.id !== deleteTargetId);
    Database.save("users", users);

    // Cleanup saving & loans related to that user too
    let simpanan = Database.get("simpanan").filter(s => s.user_id !== deleteTargetId);
    Database.save("simpanan", simpanan);
    
    let pinjaman = Database.get("pinjaman").filter(p => p.user_id !== deleteTargetId);
    Database.save("pinjaman", pinjaman);

    showToast("Data anggota beserta riwayatnya telah dihapus.", "warning");
    bootstrap.Modal.getInstance(document.getElementById("confirm-delete-modal")).hide();
    renderDataAnggotaTable();
}

// ================= SCREEN 4: DETAIL ANGGOTA =================
function renderDetailAnggota(id) {
    const user = Database.get("users").find(u => u.id === parseInt(id));
    if (!user) {
        navigateTo("data-anggota");
        return;
    }

    // Render Basic Profile Info
    document.getElementById("detail-ang-name").textContent = user.name;
    document.getElementById("detail-ang-nip").textContent = user.nip || "-";
    document.getElementById("detail-ang-email").textContent = user.email;
    document.getElementById("detail-ang-phone").textContent = user.phone || "-";
    document.getElementById("detail-ang-address").textContent = user.address || "-";
    
    const badgeClass = `badge-soft-${user.status}`;
    document.getElementById("detail-ang-status").innerHTML = `<span class="badge ${badgeClass}">${user.status.toUpperCase()}</span>`;

    // Render savings summary
    const simpanan = Database.get("simpanan").filter(s => s.user_id === user.id);
    const pok = simpanan.filter(s => s.tipe_simpanan === "pokok").reduce((sum, s) => sum + s.nominal, 0);
    const waj = simpanan.filter(s => s.tipe_simpanan === "wajib").reduce((sum, s) => sum + s.nominal, 0);
    const suk = simpanan.filter(s => s.tipe_simpanan === "sukarela").reduce((sum, s) => sum + s.nominal, 0);
    const tot = pok + waj + suk;

    document.getElementById("detail-ang-pokok").textContent = formatRupiah(pok);
    document.getElementById("detail-ang-wajib").textContent = formatRupiah(waj);
    document.getElementById("detail-ang-sukarela").textContent = formatRupiah(suk);
    document.getElementById("detail-ang-total-simpanan").textContent = formatRupiah(tot);

    // Render savings history table
    const detailSimpananTable = document.getElementById("detail-ang-simpanan-table");
    detailSimpananTable.innerHTML = "";
    if (simpanan.length === 0) {
        detailSimpananTable.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Belum ada riwayat simpanan.</td></tr>`;
    } else {
        simpanan.forEach(s => {
            detailSimpananTable.innerHTML += `
                <tr>
                    <td>${s.tanggal_transaksi}</td>
                    <td><span class="text-capitalize fw-bold">${s.tipe_simpanan}</span></td>
                    <td>${formatRupiah(s.nominal)}</td>
                    <td>${s.keterangan || "-"}</td>
                </tr>
            `;
        });
    }

    // Render loans history table
    const pinjaman = Database.get("pinjaman").filter(p => p.user_id === user.id);
    const detailPinjamanTable = document.getElementById("detail-ang-pinjaman-table");
    detailPinjamanTable.innerHTML = "";
    if (pinjaman.length === 0) {
        detailPinjamanTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Belum ada riwayat pinjaman.</td></tr>`;
    } else {
        pinjaman.forEach(p => {
            const pBadgeClass = `badge-soft-${p.status}`;
            detailPinjamanTable.innerHTML += `
                <tr>
                    <td>${p.tanggal_pengajuan}</td>
                    <td>${formatRupiah(p.nominal_pinjaman)}</td>
                    <td>${p.bunga_persen}%</td>
                    <td>${p.lama_angsuran_bulan} Bulan</td>
                    <td><span class="badge ${pBadgeClass}">${p.status.toUpperCase()}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="navigateTo('detail-pinjaman', ${p.id})">
                            <i class="fas fa-eye"></i> Detail
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

// ================= SCREEN 5: MANAGE SIMPANAN =================
function renderSimpananTable() {
    const search = document.getElementById("simpanan-search").value.trim().toLowerCase();
    const users = Database.get("users").filter(u => u.role === "anggota");
    const simpanan = Database.get("simpanan");

    const tbody = document.getElementById("simpanan-table-body");
    tbody.innerHTML = "";

    // Group savings by user
    const memberSavings = users.map(user => {
        const userSavings = simpanan.filter(s => s.user_id === user.id);
        const total = userSavings.reduce((sum, s) => sum + s.nominal, 0);
        return {
            user,
            total,
            pokok: userSavings.filter(s => s.tipe_simpanan === "pokok").reduce((sum, s) => sum + s.nominal, 0),
            wajib: userSavings.filter(s => s.tipe_simpanan === "wajib").reduce((sum, s) => sum + s.nominal, 0),
            sukarela: userSavings.filter(s => s.tipe_simpanan === "sukarela").reduce((sum, s) => sum + s.nominal, 0)
        };
    }).filter(ms => {
        return ms.user.name.toLowerCase().includes(search) || (ms.user.nip && ms.user.nip.toLowerCase().includes(search));
    });

    if (memberSavings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">Data simpanan tidak ditemukan.</td></tr>`;
        return;
    }

    memberSavings.forEach(ms => {
        tbody.innerHTML += `
            <tr>
                <td>${ms.user.nip || "-"}</td>
                <td><span class="fw-bold">${ms.user.name}</span></td>
                <td>${formatRupiah(ms.pokok)}</td>
                <td>${formatRupiah(ms.wajib)}</td>
                <td>${formatRupiah(ms.sukarela)}</td>
                <td class="fw-bold text-primary">${formatRupiah(ms.total)}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" onclick="navigateTo('detail-simpanan', ${ms.user.id})" title="Mutasi Detail">
                            <i class="fas fa-file-invoice-dollar"></i> Detail
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

document.getElementById("simpanan-search").addEventListener("input", renderSimpananTable);

function openAddSimpananModal() {
    const users = Database.get("users").filter(u => u.role === "anggota" && u.status === "aktif");
    const userSelect = document.getElementById("simpanan-form-user");
    userSelect.innerHTML = `<option value="" disabled selected>Pilih Anggota Guru...</option>`;
    
    users.forEach(u => {
        userSelect.innerHTML += `<option value="${u.id}">${u.name} (NIP: ${u.nip || '-'})</option>`;
    });

    document.getElementById("simpanan-form-el").reset();
    document.getElementById("simpanan-form-date").value = new Date().toISOString().split('T')[0];

    const modal = new bootstrap.Modal(document.getElementById("simpanan-modal"));
    modal.show();
}

document.getElementById("simpanan-form-el").addEventListener("submit", function(e) {
    e.preventDefault();
    const userId = parseInt(document.getElementById("simpanan-form-user").value);
    const tipeSimpanan = document.getElementById("simpanan-form-type").value;
    const nominal = parseFloat(document.getElementById("simpanan-form-amount").value);
    const tanggal = document.getElementById("simpanan-form-date").value;
    const keterangan = document.getElementById("simpanan-form-desc").value.trim();

    if (!userId || !tipeSimpanan || !nominal || !tanggal) {
        showToast("Mohon isi semua field wajib!", "error");
        return;
    }

    const simpanan = Database.get("simpanan");
    const newId = simpanan.length > 0 ? Math.max(...simpanan.map(s => s.id)) + 1 : 1;

    simpanan.push({
        id: newId,
        user_id: userId,
        tipe_simpanan: tipeSimpanan,
        nominal: nominal,
        tanggal_transaksi: tanggal,
        keterangan: keterangan || `Setoran Simpanan ${tipeSimpanan.charAt(0).toUpperCase() + tipeSimpanan.slice(1)}`
    });

    Database.save("simpanan", simpanan);
    showToast("Transaksi simpanan berhasil dicatat.", "success");
    bootstrap.Modal.getInstance(document.getElementById("simpanan-modal")).hide();
    renderSimpananTable();
});

// ================= SCREEN 6: DETAIL SIMPANAN =================
function renderDetailSimpanan(userId) {
    const user = Database.get("users").find(u => u.id === parseInt(userId));
    if (!user) {
        navigateTo("simpanan");
        return;
    }

    document.getElementById("detail-simp-name").textContent = user.name;
    document.getElementById("detail-simp-nip").textContent = user.nip || "-";
    document.getElementById("detail-simp-email").textContent = user.email;

    const simpanan = Database.get("simpanan").filter(s => s.user_id === user.id);
    
    // Sort transactions latest first
    simpanan.sort((a,b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi));

    const tbody = document.getElementById("detail-simpanan-table-body");
    tbody.innerHTML = "";

    let totalPokok = 0, totalWajib = 0, totalSukarela = 0;

    if (simpanan.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">Belum ada catatan mutasi simpanan.</td></tr>`;
    } else {
        simpanan.forEach(s => {
            if (s.tipe_simpanan === "pokok") totalPokok += s.nominal;
            if (s.tipe_simpanan === "wajib") totalWajib += s.nominal;
            if (s.tipe_simpanan === "sukarela") totalSukarela += s.nominal;

            tbody.innerHTML += `
                <tr>
                    <td>${s.tanggal_transaksi}</td>
                    <td><span class="text-capitalize badge bg-light text-dark">${s.tipe_simpanan}</span></td>
                    <td class="fw-bold">${formatRupiah(s.nominal)}</td>
                    <td>${s.keterangan || "-"}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteSimpananTransaction(${s.id}, ${user.id})">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    document.getElementById("detail-simp-pokok").textContent = formatRupiah(totalPokok);
    document.getElementById("detail-simp-wajib").textContent = formatRupiah(totalWajib);
    document.getElementById("detail-simp-sukarela").textContent = formatRupiah(totalSukarela);
    document.getElementById("detail-simp-total").textContent = formatRupiah(totalPokok + totalWajib + totalSukarela);
}

function deleteSimpananTransaction(id, userId) {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi simpanan ini?")) {
        let simpanan = Database.get("simpanan");
        simpanan = simpanan.filter(s => s.id !== id);
        Database.save("simpanan", simpanan);
        showToast("Transaksi simpanan berhasil dihapus.", "warning");
        renderDetailSimpanan(userId);
    }
}

// ================= SCREEN 7: KELOLA PINJAMAN =================
function renderPinjamanTable() {
    const search = document.getElementById("pinjaman-search").value.trim().toLowerCase();
    const filterStatus = document.getElementById("pinjaman-filter-status").value;
    
    const pinjaman = Database.get("pinjaman");
    const users = Database.get("users");

    const tbody = document.getElementById("pinjaman-table-body");
    tbody.innerHTML = "";

    const filtered = pinjaman.map(p => {
        const user = users.find(u => u.id === p.user_id);
        return { ...p, user };
    }).filter(item => {
        if (!item.user) return false;
        const matchesSearch = item.user.name.toLowerCase().includes(search) || (item.user.nip && item.user.nip.toLowerCase().includes(search));
        const matchesStatus = filterStatus === "all" || item.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Sort order: Menunggu first, then by date desc
    filtered.sort((a, b) => {
        if (a.status === "menunggu" && b.status !== "menunggu") return -1;
        if (a.status !== "menunggu" && b.status === "menunggu") return 1;
        return new Date(b.tanggal_pengajuan) - new Date(a.tanggal_pengajuan);
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Data pengajuan pinjaman tidak ditemukan.</td></tr>`;
        return;
    }

    filtered.forEach(p => {
        const badgeClass = `badge-soft-${p.status}`;
        
        let actionBtn = "";
        if (p.status === "menunggu") {
            actionBtn = `
                <button class="btn btn-sm btn-primary" onclick="openApprovalModal(${p.id})">
                    <i class="fas fa-check-circle"></i> Proses
                </button>
            `;
        } else {
            actionBtn = `
                <button class="btn btn-sm btn-outline-primary" onclick="navigateTo('detail-pinjaman', ${p.id})">
                    <i class="fas fa-eye"></i> Detail
                </button>
            `;
        }

        tbody.innerHTML += `
            <tr>
                <td>${p.tanggal_pengajuan}</td>
                <td>
                    <div class="fw-bold">${p.user.name}</div>
                    <div class="text-muted" style="font-size: 0.8rem;">NIP: ${p.user.nip || "-"}</div>
                </td>
                <td class="fw-bold">${formatRupiah(p.nominal_pinjaman)}</td>
                <td>${p.lama_angsuran_bulan} Bulan</td>
                <td>${p.bunga_persen}% / bln</td>
                <td><span class="badge ${badgeClass}">${p.status.toUpperCase()}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

document.getElementById("pinjaman-search").addEventListener("input", renderPinjamanTable);
document.getElementById("pinjaman-filter-status").addEventListener("change", renderPinjamanTable);

let approvalTargetId = null;
function openApprovalModal(id) {
    approvalTargetId = id;
    const pinjaman = Database.get("pinjaman").find(p => p.id === id);
    if (!pinjaman) return;

    const user = Database.get("users").find(u => u.id === pinjaman.user_id);
    
    document.getElementById("approval-member-name").textContent = user ? user.name : "N/A";
    document.getElementById("approval-member-nip").textContent = user ? (user.nip || "-") : "-";
    document.getElementById("approval-loan-amount").textContent = formatRupiah(pinjaman.nominal_pinjaman);
    document.getElementById("approval-loan-duration").textContent = `${pinjaman.lama_angsuran_bulan} Bulan`;
    document.getElementById("approval-loan-reason").textContent = pinjaman.alasan || "-";

    // Set defaults for approval fields
    document.getElementById("approval-interest").value = "1.5"; // Default interest rate
    
    // Set default due date: today + duration in months
    const duration = pinjaman.lama_angsuran_bulan;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + duration);
    document.getElementById("approval-due-date").value = dueDate.toISOString().split('T')[0];
    document.getElementById("approval-note").value = "";

    const modal = new bootstrap.Modal(document.getElementById("approval-modal"));
    modal.show();
}

function processApproval(decision) {
    if (!approvalTargetId) return;

    const pinjaman = Database.get("pinjaman");
    const idx = pinjaman.findIndex(p => p.id === approvalTargetId);
    if (idx === -1) return;

    const interest = parseFloat(document.getElementById("approval-interest").value) || 0;
    const dueDate = document.getElementById("approval-due-date").value;
    const note = document.getElementById("approval-note").value.trim();

    if (decision === "setuju") {
        if (!dueDate) {
            showToast("Harap tentukan tanggal jatuh tempo pertama!", "error");
            return;
        }
        pinjaman[idx].status = "berjalan";
        pinjaman[idx].bunga_persen = interest;
        pinjaman[idx].tanggal_jatuh_tempo = dueDate;
        pinjaman[idx].alasan = (pinjaman[idx].alasan ? pinjaman[idx].alasan + " | " : "") + (note ? "Catatan Admin: " + note : "");
        showToast("Pengajuan pinjaman disetujui, dana dicairkan.", "success");
    } else {
        pinjaman[idx].status = "ditolak";
        pinjaman[idx].alasan = (pinjaman[idx].alasan ? pinjaman[idx].alasan + " | " : "") + (note ? "Alasan Ditolak: " + note : "Ditolak oleh Admin.");
        showToast("Pengajuan pinjaman ditolak.", "warning");
    }

    Database.save("pinjaman", pinjaman);
    bootstrap.Modal.getInstance(document.getElementById("approval-modal")).hide();
    renderPinjamanTable();
}

// ================= SCREEN 8: DETAIL PINJAMAN =================
function renderDetailPinjaman(loanId) {
    const pinjaman = Database.get("pinjaman").find(p => p.id === parseInt(loanId));
    if (!pinjaman) {
        navigateTo("pinjaman");
        return;
    }

    const user = Database.get("users").find(u => u.id === pinjaman.user_id);
    document.getElementById("det-loan-name").textContent = user ? user.name : "N/A";
    document.getElementById("det-loan-nip").textContent = user ? (user.nip || "-") : "-";
    
    // Status Badge
    const badgeClass = `badge-soft-${pinjaman.status}`;
    document.getElementById("det-loan-status").innerHTML = `<span class="badge ${badgeClass}">${pinjaman.status.toUpperCase()}</span>`;

    // Financial calculations
    const amount = pinjaman.nominal_pinjaman;
    const duration = pinjaman.lama_angsuran_bulan;
    const interestRate = pinjaman.bunga_persen;

    // Installment formula: (Amount / Duration) + (Amount * InterestRate / 100)
    const monthlyPrincipal = amount / duration;
    const monthlyInterest = amount * (interestRate / 100);
    const monthlyInstallment = monthlyPrincipal + monthlyInterest;

    document.getElementById("det-loan-amount").textContent = formatRupiah(amount);
    document.getElementById("det-loan-interest").textContent = `${interestRate}% / Bulan`;
    document.getElementById("det-loan-duration").textContent = `${duration} Bulan`;
    document.getElementById("det-loan-monthly").textContent = formatRupiah(monthlyInstallment);
    document.getElementById("det-loan-requested-date").textContent = pinjaman.tanggal_pengajuan;
    document.getElementById("det-loan-due-date").textContent = pinjaman.tanggal_jatuh_tempo || "-";
    document.getElementById("det-loan-reason").textContent = pinjaman.alasan || "-";

    // Installments ledger
    const angsuran = Database.get("angsuran").filter(a => a.pinjaman_id === pinjaman.id);
    const totalPaid = angsuran.reduce((sum, a) => sum + a.nominal_bayar, 0);
    const totalExpected = monthlyInstallment * duration;
    const remainingToPay = Math.max(0, totalExpected - totalPaid);

    document.getElementById("det-loan-paid").textContent = formatRupiah(totalPaid);
    document.getElementById("det-loan-remaining").textContent = formatRupiah(remainingToPay);

    // Populate Installments Table
    const tbody = document.getElementById("det-loan-ledger-body");
    tbody.innerHTML = "";

    // Show simulation of installments scheduler
    for (let i = 1; i <= duration; i++) {
        const paidItem = angsuran.find(a => a.angsuran_ke === i);
        let statusText = "";
        let paymentDate = "-";
        
        if (paidItem) {
            statusText = `<span class="badge bg-success">LUNAS</span>`;
            paymentDate = paidItem.tanggal_bayar;
        } else {
            if (pinjaman.status === "berjalan") {
                statusText = `<span class="badge bg-warning text-dark">BELUM DIBAYAR</span>`;
            } else if (pinjaman.status === "lunas") {
                statusText = `<span class="badge bg-success">LUNAS (SIMULASI)</span>`;
            } else {
                statusText = `<span class="badge bg-secondary">BATAL</span>`;
            }
        }

        tbody.innerHTML += `
            <tr>
                <td>Cicilan ke-${i}</td>
                <td>${formatRupiah(monthlyPrincipal)}</td>
                <td>${formatRupiah(monthlyInterest)}</td>
                <td class="fw-bold">${formatRupiah(monthlyInstallment)}</td>
                <td>${paymentDate}</td>
                <td>${statusText}</td>
            </tr>
        `;
    }

    // Installment action button
    const actionWrapper = document.getElementById("det-loan-action-wrapper");
    actionWrapper.innerHTML = "";
    
    if (currentUser.role === "admin" && pinjaman.status === "berjalan") {
        const nextInstallmentNum = angsuran.length + 1;
        if (nextInstallmentNum <= duration) {
            actionWrapper.innerHTML = `
                <div class="card p-3 border border-primary bg-light-primary text-end">
                    <span class="fs-7 text-muted d-block mb-1">Catat pembayaran cicilan berikutnya untuk anggota ini:</span>
                    <button class="btn btn-primary d-inline-block" style="width: auto; align-self: flex-end;" onclick="payInstallmentSim(${pinjaman.id}, ${nextInstallmentNum}, ${monthlyInstallment})">
                        <i class="fas fa-cash-register me-1"></i> Bayar Cicilan Ke-${nextInstallmentNum} (${formatRupiah(monthlyInstallment)})
                    </button>
                </div>
            `;
        }
    }
}

function payInstallmentSim(loanId, installmentNum, amount) {
    if (!confirm(`Konfirmasi pembayaran angsuran ke-${installmentNum} sebesar ${formatRupiah(amount)}?`)) return;

    const angsuran = Database.get("angsuran");
    const newId = angsuran.length > 0 ? Math.max(...angsuran.map(a => a.id)) + 1 : 1;
    
    angsuran.push({
        id: newId,
        pinjaman_id: loanId,
        angsuran_ke: installmentNum,
        nominal_bayar: amount,
        tanggal_bayar: new Date().toISOString().split('T')[0]
    });
    
    Database.save("angsuran", angsuran);

    // Check if fully paid
    const pinjaman = Database.get("pinjaman");
    const loanIdx = pinjaman.findIndex(p => p.id === loanId);
    if (loanIdx !== -1) {
        const loan = pinjaman[loanIdx];
        const newSisa = Math.max(0, loan.sisa_angsuran_bulan - 1);
        pinjaman[loanIdx].sisa_angsuran_bulan = newSisa;
        
        if (newSisa === 0) {
            pinjaman[loanIdx].status = "lunas";
            showToast("Pembayaran cicilan selesai! Status pinjaman telah berubah menjadi Lunas.", "success");
        } else {
            showToast(`Pembayaran cicilan ke-${installmentNum} berhasil dicatat.`, "success");
        }
        
        Database.save("pinjaman", pinjaman);
    }

    renderDetailPinjaman(loanId);
}

// ================= SCREEN 9: FORM PENGAJUAN PINJAMAN (MEMBER) =================
document.getElementById("form-pengajuan-pinjaman-el").addEventListener("submit", function(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById("pengajuan-amount").value);
    const duration = parseInt(document.getElementById("pengajuan-duration").value);
    const reason = document.getElementById("pengajuan-reason").value.trim();

    if (!amount || !duration || !reason) {
        showToast("Harap lengkapi formulir pengajuan!", "error");
        return;
    }

    // Check if member already has an active loan
    const pinjamanList = Database.get("pinjaman");
    const activeLoan = pinjamanList.find(p => p.user_id === currentUser.id && ["menunggu", "berjalan"].includes(p.status));

    if (activeLoan) {
        showToast("Anda tidak dapat mengajukan pinjaman baru karena masih memiliki pengajuan menunggu atau pinjaman aktif yang berjalan.", "error");
        return;
    }

    const newId = pinjamanList.length > 0 ? Math.max(...pinjamanList.map(p => p.id)) + 1 : 1;
    
    pinjamanList.push({
        id: newId,
        user_id: currentUser.id,
        nominal_pinjaman: amount,
        bunga_persen: 0.0, // Will be set by admin on approval
        lama_angsuran_bulan: duration,
        sisa_angsuran_bulan: duration,
        tanggal_pengajuan: new Date().toISOString().split('T')[0],
        tanggal_jatuh_tempo: null,
        status: "menunggu",
        alasan: reason
    });

    Database.save("pinjaman", pinjamanList);
    showToast("Pengajuan pinjaman Anda berhasil dikirim ke Admin.", "success");
    navigateTo("anggota-pinjaman");
});

// ================= SCREEN 10: MEMBER SIMPANAN HISTORY =================
function renderAnggotaSimpananTable() {
    const simpanan = Database.get("simpanan").filter(s => s.user_id === currentUser.id);
    
    // Sort latest first
    simpanan.sort((a,b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi));

    const total = simpanan.reduce((sum, s) => sum + s.nominal, 0);
    const pok = simpanan.filter(s => s.tipe_simpanan === "pokok").reduce((sum, s) => sum + s.nominal, 0);
    const waj = simpanan.filter(s => s.tipe_simpanan === "wajib").reduce((sum, s) => sum + s.nominal, 0);
    const suk = simpanan.filter(s => s.tipe_simpanan === "sukarela").reduce((sum, s) => sum + s.nominal, 0);

    document.getElementById("ang-simp-total").textContent = formatRupiah(total);
    document.getElementById("ang-simp-pokok").textContent = formatRupiah(pok);
    document.getElementById("ang-simp-wajib").textContent = formatRupiah(waj);
    document.getElementById("ang-simp-sukarela").textContent = formatRupiah(suk);

    const tbody = document.getElementById("anggota-simpanan-table-body");
    tbody.innerHTML = "";

    if (simpanan.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">Anda belum memiliki riwayat simpanan.</td></tr>`;
        return;
    }

    simpanan.forEach(s => {
        tbody.innerHTML += `
            <tr>
                <td>${s.tanggal_transaksi}</td>
                <td><span class="text-capitalize badge bg-light text-dark">${s.tipe_simpanan}</span></td>
                <td class="fw-bold">${formatRupiah(s.nominal)}</td>
                <td>${s.keterangan || "-"}</td>
            </tr>
        `;
    });
}

// ================= SCREEN 11: MEMBER LOANS HISTORY =================
function renderAnggotaPinjamanTable() {
    const pinjaman = Database.get("pinjaman").filter(p => p.user_id === currentUser.id);
    
    // Sort latest first
    pinjaman.sort((a,b) => new Date(b.tanggal_pengajuan) - new Date(a.tanggal_pengajuan));

    const tbody = document.getElementById("anggota-pinjaman-table-body");
    tbody.innerHTML = "";

    if (pinjaman.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Anda belum memiliki riwayat pengajuan pinjaman.</td></tr>`;
        return;
    }

    pinjaman.forEach(p => {
        const badgeClass = `badge-soft-${p.status}`;
        
        let actions = `
            <button class="btn btn-sm btn-outline-primary" onclick="navigateTo('detail-pinjaman', ${p.id})">
                <i class="fas fa-eye"></i> Detail
            </button>
        `;

        tbody.innerHTML += `
            <tr>
                <td>${p.tanggal_pengajuan}</td>
                <td class="fw-bold">${formatRupiah(p.nominal_pinjaman)}</td>
                <td>${p.bunga_persen > 0 ? p.bunga_persen + "%" : "-"}</td>
                <td>${p.lama_angsuran_bulan} Bulan</td>
                <td>${p.status === "berjalan" || p.status === "lunas" ? p.sisa_angsuran_bulan + " bln" : "-"}</td>
                <td><span class="badge ${badgeClass}">${p.status.toUpperCase()}</span></td>
                <td>${actions}</td>
            </tr>
        `;
    });
}

// ================= SCREEN 12 & 13: PROFIL & EDIT PROFIL =================
function renderUserProfile() {
    document.getElementById("profile-name-title").textContent = currentUser.name;
    document.getElementById("profile-role-title").textContent = currentUser.role === "admin" ? "Administrator" : "Anggota Koperasi";
    
    // Set view elements
    document.getElementById("prof-name").textContent = currentUser.name;
    document.getElementById("prof-nip").textContent = currentUser.nip || "-";
    document.getElementById("prof-email").textContent = currentUser.email;
    document.getElementById("prof-phone").textContent = currentUser.phone || "-";
    document.getElementById("prof-address").textContent = currentUser.address || "-";

    // Set Edit Form default values
    document.getElementById("edit-profile-name").value = currentUser.name;
    document.getElementById("edit-profile-email").value = currentUser.email;
    document.getElementById("edit-profile-nip").value = currentUser.nip || "";
    document.getElementById("edit-profile-phone").value = currentUser.phone || "";
    document.getElementById("edit-profile-address").value = currentUser.address || "";
    document.getElementById("edit-profile-password").value = "";

    // NIP cannot be edited by member (read-only for security)
    if (currentUser.role === "anggota") {
        document.getElementById("edit-profile-nip").setAttribute("readonly", "readonly");
    } else {
        document.getElementById("edit-profile-nip").removeAttribute("readonly");
    }
}

document.getElementById("edit-profile-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const name = document.getElementById("edit-profile-name").value.trim();
    const email = document.getElementById("edit-profile-email").value.trim();
    const nip = document.getElementById("edit-profile-nip").value.trim();
    const phone = document.getElementById("edit-profile-phone").value.trim();
    const address = document.getElementById("edit-profile-address").value.trim();
    const password = document.getElementById("edit-profile-password").value;

    const users = Database.get("users");
    const idx = users.findIndex(u => u.id === currentUser.id);

    if (idx === -1) return;

    // Check unique email
    if (users.some((u, i) => i !== idx && u.email.toLowerCase() === email.toLowerCase())) {
        showToast("Email sudah digunakan oleh akun lain!", "error");
        return;
    }

    users[idx].name = name;
    users[idx].email = email;
    users[idx].nip = nip;
    users[idx].phone = phone;
    users[idx].address = address;
    
    if (password) {
        users[idx].password = password;
    }

    // Save
    Database.save("users", users);
    
    // Update local state
    currentUser = users[idx];
    sessionStorage.setItem("kop_current_user", JSON.stringify(currentUser));
    
    showToast("Profil Anda berhasil diperbarui.", "success");
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById("edit-profile-modal")).hide();
    
    // Re-render
    renderUserProfile();
    updateTopNavbar(routes["profil"]);
});

// ================= SCREEN 14: LAPORAN SCREEN (ADMIN) =================
function initLaporanScreen() {
    // Default dates: month beginning to today
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById("laporan-date-start").value = firstDay.toISOString().split('T')[0];
    document.getElementById("laporan-date-end").value = today.toISOString().split('T')[0];
    
    generateReport();
}

function generateReport() {
    const reportType = document.getElementById("laporan-type").value;
    const start = document.getElementById("laporan-date-start").value;
    const end = document.getElementById("laporan-date-end").value;

    const printTitle = document.getElementById("print-report-title");
    const printDates = document.getElementById("print-report-dates");
    const reportTableHead = document.getElementById("report-table-head");
    const reportTableBody = document.getElementById("report-table-body");
    const reportTotalSum = document.getElementById("report-total-sum");

    // Clear old data
    reportTableHead.innerHTML = "";
    reportTableBody.innerHTML = "";
    reportTotalSum.textContent = "";

    const users = Database.get("users");

    if (reportType === "simpanan") {
        const simpanan = Database.get("simpanan");
        const filtered = simpanan.filter(s => {
            const date = s.tanggal_transaksi;
            return date >= start && date <= end;
        });

        // Set Print header texts
        printTitle.textContent = "LAPORAN TRANSAKSI SIMPANAN GURU";
        printDates.textContent = `Periode: ${start} s.d. ${end}`;

        // Create table head
        reportTableHead.innerHTML = `
            <tr>
                <th>Tanggal</th>
                <th>NIP</th>
                <th>Nama Guru</th>
                <th>Tipe Simpanan</th>
                <th>Keterangan</th>
                <th>Nominal</th>
            </tr>
        `;

        if (filtered.length === 0) {
            reportTableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Tidak ada transaksi simpanan pada periode ini.</td></tr>`;
            reportTotalSum.textContent = formatRupiah(0);
        } else {
            let total = 0;
            filtered.forEach(s => {
                const user = users.find(u => u.id === s.user_id);
                total += s.nominal;
                reportTableBody.innerHTML += `
                    <tr>
                        <td>${s.tanggal_transaksi}</td>
                        <td>${user ? (user.nip || "-") : "-"}</td>
                        <td>${user ? user.name : "N/A"}</td>
                        <td class="text-capitalize">${s.tipe_simpanan}</td>
                        <td>${s.keterangan || "-"}</td>
                        <td class="fw-bold">${formatRupiah(s.nominal)}</td>
                    </tr>
                `;
            });
            reportTotalSum.textContent = formatRupiah(total);
        }

    } else if (reportType === "pinjaman") {
        const pinjaman = Database.get("pinjaman");
        const filtered = pinjaman.filter(p => {
            const date = p.tanggal_pengajuan;
            return date >= start && date <= end;
        });

        // Set Print header texts
        printTitle.textContent = "LAPORAN PENYALURAN PINJAMAN GURU";
        printDates.textContent = `Periode: ${start} s.d. ${end}`;

        // Create table head
        reportTableHead.innerHTML = `
            <tr>
                <th>Tanggal Pengajuan</th>
                <th>NIP</th>
                <th>Nama Guru</th>
                <th>Lama Angsuran</th>
                <th>Bunga</th>
                <th>Status</th>
                <th>Nominal Pinjaman</th>
            </tr>
        `;

        if (filtered.length === 0) {
            reportTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Tidak ada transaksi pinjaman pada periode ini.</td></tr>`;
            reportTotalSum.textContent = formatRupiah(0);
        } else {
            let total = 0;
            filtered.forEach(p => {
                const user = users.find(u => u.id === p.user_id);
                if (p.status !== "ditolak" && p.status !== "menunggu") {
                    total += p.nominal_pinjaman; // Accumulate only disburseable loans
                }
                
                const statusBadge = `<span class="badge badge-soft-${p.status}">${p.status.toUpperCase()}</span>`;

                reportTableBody.innerHTML += `
                    <tr>
                        <td>${p.tanggal_pengajuan}</td>
                        <td>${user ? (user.nip || "-") : "-"}</td>
                        <td>${user ? user.name : "N/A"}</td>
                        <td>${p.lama_angsuran_bulan} Bulan</td>
                        <td>${p.bunga_persen}%</td>
                        <td>${statusBadge}</td>
                        <td class="fw-bold">${formatRupiah(p.nominal_pinjaman)}</td>
                    </tr>
                `;
            });
            reportTotalSum.textContent = formatRupiah(total);
        }
    }
}

function printReport() {
    window.print();
}

// ================= COLLAPSIBLE SIDEBAR & INITIAL OVERLAYS =================
document.addEventListener("DOMContentLoaded", () => {
    // Add dynamic responsive events
    const toggleBtn = document.getElementById("toggle-sidebar");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebar-overlay");

    toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("show-sidebar");
        overlay.classList.toggle("show-overlay");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("show-sidebar");
        overlay.classList.remove("show-overlay");
    });

    // Handle screen sizing adjustments
    window.addEventListener("resize", () => {
        if (window.innerWidth > 991.98) {
            sidebar.classList.remove("show-sidebar");
            overlay.classList.remove("show-overlay");
            if (currentUser && routes[document.querySelector("#sidebar .menu-link.active")?.getAttribute("data-route") || "admin-dashboard"]) {
                document.getElementById("main-content").style.marginLeft = "var(--sidebar-width)";
            }
        } else {
            document.getElementById("main-content").style.marginLeft = "0";
        }
    });

    // Check if already logged in and restore session
    if (currentUser) {
        // Restore sidebar options
        document.querySelectorAll("#sidebar .admin-only").forEach(el => {
            currentUser.role === "admin" ? el.classList.remove("d-none") : el.classList.add("d-none");
        });
        document.querySelectorAll("#sidebar .anggota-only").forEach(el => {
            currentUser.role === "anggota" ? el.classList.remove("d-none") : el.classList.add("d-none");
        });
        
        navigateTo(currentUser.role === "admin" ? "admin-dashboard" : "anggota-dashboard");
    } else {
        navigateTo("login");
    }
});
