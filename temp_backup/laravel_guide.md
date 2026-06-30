# Panduan Implementasi Laravel (Koperasi Simpan Pinjam Guru)

Dokumen ini menyediakan panduan terstruktur dan contoh kode untuk mengimplementasikan proyek ini menggunakan Laravel 10/11, Blade, Bootstrap, dan MySQL.

---

## 1. Konfigurasi Awal & Migrasi

### File `.env`
Sesuaikan konfigurasi database Anda pada file `.env` Laravel:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=koperasi_guru
DB_USERNAME=root
DB_PASSWORD=
```

---

## 2. Model & Relasi Database

### Model `User.php`
```python
# app/Models/User.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'nip', 'address', 'phone', 'status'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    // Relasi ke Simpanan
    public function simpanan()
    {
        return $this->hasMany(Simpanan::class);
    }

    // Relasi ke Pinjaman
    public function pinjaman()
    {
        return $this->hasMany(Pinjaman::class);
    }
}
```

### Model `Simpanan.php`
```python
# app/Models/Simpanan.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Simpanan extends Model
{
    protected $table = 'simpanan';
    protected $fillable = ['user_id', 'tipe_simpanan', 'nominal', 'tanggal_transaksi', 'keterangan'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

### Model `Pinjaman.php`
```python
# app/Models/Pinjaman.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pinjaman extends Model
{
    protected $table = 'pinjaman';
    protected $fillable = [
        'user_id', 'nominal_pinjaman', 'bunga_persen', 'lama_angsuran_bulan', 
        'sisa_angsuran_bulan', 'tanggal_pengajuan', 'tanggal_jatuh_tempo', 'status', 'alasan'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function angsuran()
    {
        return $this->hasMany(Angsuran::class);
    }
}
```

---

## 3. Middleware Role-Based Access Control (RBAC)

Buat middleware baru untuk menyaring hak akses:
```bash
php artisan make:middleware CheckRole
```

### File `CheckRole.php`
```python
# app/Http/Middleware/CheckRole.php
namespace App\Http/Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!Auth::check()) {
            return redirect('login');
        }

        $user = Auth::user();
        if (in_array($user->role, $roles)) {
            return $next($request);
        }

        // Jika user tidak memiliki role yang sesuai, redirect ke dashboard masing-masing
        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard')->with('error', 'Akses ditolak.');
        } else {
            return redirect()->route('anggota.dashboard')->with('error', 'Akses ditolak.');
        }
    }
}
```

Daftarkan middleware di `app/Http/Kernel.php` (atau `bootstrap/app.php` untuk Laravel 11):
```python
// kernel.php
protected $middlewareAliases = [
    // ...
    'role' => \App\Http\Middleware\CheckRole::class,
];
```

---

## 4. Struktur Routing (`routes/web.php`)

```python
# routes/web.php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AnggotaController;
use App\Http\Controllers\SimpananController;
use App\Http\Controllers\PinjamanController;

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Group Routes dengan Auth Middleware
Route::middleware(['auth'])->group(function () {

    // ================= ADMIN ROUTES =================
    Route::middleware(['role:admin'])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');
        
        // CRUD Anggota
        Route::resource('/anggota', AdminController::class); // index, create, store, edit, update, destroy
        Route::get('/anggota/{id}/detail', [AdminController::class, 'detailAnggota'])->name('anggota.detail');
        
        // Kelola Simpanan
        Route::get('/simpanan', [SimpananController::class, 'index'])->name('simpanan.index');
        Route::post('/simpanan/transaksi', [SimpananController::class, 'store'])->name('simpanan.store');
        Route::get('/simpanan/{userId}/detail', [SimpananController::class, 'detail'])->name('simpanan.detail');
        
        // Kelola Pinjaman & Persetujuan
        Route::get('/pinjaman', [PinjamanController::class, 'index'])->name('pinjaman.index');
        Route::get('/pinjaman/{id}/detail', [PinjamanController::class, 'detail'])->name('pinjaman.detail');
        Route::post('/pinjaman/{id}/persetujuan', [PinjamanController::class, 'approveOrReject'])->name('pinjaman.persetujuan');
        
        // Laporan
        Route::get('/laporan', [AdminController::class, 'laporan'])->name('laporan');
    });

    // ================= ANGGOTA ROUTES =================
    Route::middleware(['role:anggota'])->prefix('anggota')->name('anggota.')->group(function () {
        Route::get('/dashboard', [AnggotaController::class, 'dashboard'])->name('dashboard');
        Route::get('/simpanan', [AnggotaController::class, 'riwayatSimpanan'])->name('simpanan');
        
        // Pinjaman Anggota
        Route::get('/pinjaman', [AnggotaController::class, 'riwayatPinjaman'])->name('pinjaman');
        Route::get('/pinjaman/pengajuan', [AnggotaController::class, 'formPengajuan'])->name('pinjaman.pengajuan');
        Route::post('/pinjaman/pengajuan', [AnggotaController::class, 'storePengajuan']);
        
        // Profil
        Route::get('/profil', [AnggotaController::class, 'profil'])->name('profil');
        Route::put('/profil/update', [AnggotaController::class, 'updateProfil'])->name('profil.update');
    });
});
```

---

## 5. Tips Implementasi View (Blade Template)

1. **Layouting**: Gunakan layout utama `layouts/app.blade.php` yang memuat sidebar dan navbar. Pembedaan sidebar dapat dilakukan dengan memeriksa role:
   ```html
   @if(Auth::user()->role == 'admin')
       @include('layouts.sidebar_admin')
   @else
       @include('layouts.sidebar_anggota')
   @endif
   ```
2. **Alerts**: Gunakan component Blade atau session flash data untuk notifikasi toast:
   ```html
   @if(session('success'))
       <div class="alert alert-success">{{ session('success') }}</div>
   @endif
   ```
3. **Number Formatting**: Gunakan `number_format($nominal, 0, ',', '.')` untuk menampilkan rupiah secara rapi.
