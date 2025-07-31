# Admin Panel Guru - Setup dan Penggunaan

## Setup Database

### 1. Jalankan Script Database
Jalankan script berikut di Supabase SQL Editor:

```sql
-- 1. Jalankan script utama (schema.sql) terlebih dahulu
-- 2. Kemudian jalankan script teacher admin setup
```

Script `teacher_admin_setup.sql` sudah tersedia dan akan membuat:
- Tabel `teachers` untuk data guru
- View `teacher_student_overview` untuk laporan siswa
- Function `teacher_login` untuk autentikasi guru
- Row Level Security policies yang sesuai

### 2. Data Sample Guru
Script sudah menyertakan 3 contoh data guru:

| NIP | Nama | Email | Password | Kelas | Admin |
|-----|------|-------|----------|-------|-------|
| 196801011990031001 | Pak Budi Santoso | budi.santoso@sekolah.sch.id | password123 | 12 IPA 1, 12 IPA 2 | Ya |
| 197505101998032002 | Bu Sari Wijaya | sari.wijaya@sekolah.sch.id | password123 | 12 IPS 1, 12 IPS 2 | Tidak |
| 198003151999031003 | Pak Agus Rahman | agus.rahman@sekolah.sch.id | password123 | 12 IPA 3 | Tidak |

⚠️ **Penting**: Dalam implementasi production, password harus di-hash menggunakan bcrypt atau algoritma hashing yang aman.

## Akses Admin Panel

### URL
Guru dapat mengakses admin panel melalui:
```
http://localhost:3000/admin
```

### Login
1. Buka URL admin panel
2. Masukkan email dan password guru
3. Klik "Masuk"

### Fitur Admin Panel

#### 1. Dashboard Overview
- **Total Siswa**: Jumlah total siswa yang dapat diakses guru
- **Sudah Daftar Event 1**: Siswa yang sudah mendaftar sesi 1
- **Sudah Daftar Event 2**: Siswa yang sudah mendaftar sesi 2
- **Belum Lengkap**: Siswa yang belum mendaftar salah satu atau kedua sesi

#### 2. Filter dan Pencarian
- **Filter Kelas**: Pilih kelas tertentu atau "Semua Kelas"
- **Pencarian**: Cari berdasarkan nama atau NIS siswa
- **Export CSV**: Download data dalam format CSV

#### 3. Tabel Data Siswa
Menampilkan informasi lengkap:
- **NIS**: Nomor Induk Siswa
- **Nama**: Nama lengkap siswa
- **Kelas**: Kelas siswa
- **Event 1 (Sesi 1)**: Detail pendaftaran sesi 1
  - Topik/Judul talk
  - Nama pembicara
  - Lokasi
- **Event 2 (Sesi 2)**: Detail pendaftaran sesi 2
  - Topik/Judul talk
  - Nama pembicara
  - Lokasi
- **Status**: Lengkap atau Belum Lengkap

## Perbedaan Akses

### Admin (is_admin = true)
- Dapat melihat **semua siswa** dari semua kelas
- Akses penuh ke seluruh data

### Guru Biasa (is_admin = false)
- Hanya dapat melihat siswa dari **kelas yang diampu**
- Data siswa difilter berdasarkan array `classes` di profil guru

## Keamanan

### Row Level Security (RLS)
- Tabel `teachers` menggunakan RLS
- Guru hanya bisa mengakses data sesuai level akses mereka
- View `teacher_student_overview` otomatis memfilter data

### Session Management
- Session disimpan di localStorage browser
- Otomatis logout jika session tidak valid
- Session dihapus saat logout

## Maintenance

### Menambah Guru Baru
```sql
INSERT INTO teachers (nip, name, email, password_hash, classes, is_admin) 
VALUES ('NIP_GURU', 'Nama Guru', 'email@sekolah.sch.id', 'password_hash', ARRAY['12 IPA 1'], false);
```

### Update Kelas yang Diampu Guru
```sql
UPDATE teachers 
SET classes = ARRAY['12 IPA 1', '12 IPA 2', '12 IPA 3']
WHERE nip = 'NIP_GURU';
```

### Mengubah Status Admin
```sql
UPDATE teachers 
SET is_admin = true 
WHERE nip = 'NIP_GURU';
```

## Troubleshooting

### Debug Tool
Jika mengalami masalah login, gunakan debug tool di:
```
http://localhost:3000/debug-admin
```

Tool ini akan membantu mengidentifikasi masalah:
- Koneksi database
- Keberadaan tabel teachers
- Function teacher_login
- Data sample guru
- Test login dengan credentials sample

### Error "Teacher not found"
- Pastikan email guru sudah terdaftar di tabel `teachers`
- Periksa ejaan email
- Jalankan query: `SELECT * FROM teachers WHERE email = 'email@domain.com';`

### Error "Invalid password"
- Pastikan password sesuai dengan yang disimpan di database
- Dalam development, password belum di-hash
- Gunakan password: `password123` untuk data sample

### Error "Function teacher_login does not exist"
- Pastikan script `teacher_admin_setup.sql` sudah dijalankan
- Cek di Supabase Dashboard > Database > Functions
- Function harus ada dengan nama `teacher_login`

### Data siswa tidak tampil
- Pastikan guru sudah login
- Periksa array `classes` pada profil guru
- Pastikan ada data siswa di tabel `students`
- Cek view `teacher_student_overview` sudah dibuat

### Export CSV tidak berfungsi
- Pastikan browser mendukung download file
- Periksa popup blocker browser

### Environment Variables Missing
Pastikan file `.env` berisi:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup Checklist
1. ✅ `schema.sql` - Tabel utama dan constraints
2. ✅ `teacher_admin_setup.sql` - Tabel teachers dan functions
3. ✅ `sample_data.sql` - Data sample untuk testing
4. ✅ Verifikasi di Supabase Dashboard:
   - Tables: students, teachers, speakers, talks, etc.
   - Functions: teacher_login
   - Views: teacher_student_overview

## Development Notes

### TODO untuk Production
1. **Hash Password**: Implementasi bcrypt untuk hashing password
2. **JWT Token**: Ganti localStorage dengan JWT token yang aman
3. **Rate Limiting**: Tambah rate limiting untuk login
4. **Audit Log**: Catat aktivitas admin panel
5. **Backup Export**: Fitur backup otomatis data siswa

### Komponen yang Dibuat
- `TeacherLogin.js`: Komponen login guru
- `AdminPanel.js`: Dashboard admin panel
- `TeacherAdmin.js`: Page wrapper untuk admin
- `teacher_admin_setup.sql`: Setup database untuk admin

### Route Baru
- `/admin`: Route untuk akses admin panel guru
