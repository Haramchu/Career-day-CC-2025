# 📊 Admin Panel Guru - Career Day CC 2025

## 🎯 Fitur Utama

### ✅ Yang Sudah Dibuat
1. **Login System untuk Guru** - Autentikasi khusus guru dengan NIP/email
2. **Role-based Access Control** - Admin vs Guru biasa
3. **Dashboard Overview** - Statistik lengkap pendaftaran siswa
4. **Tabel Data Siswa** - NIS, Nama, Kelas, Event 1, Event 2, Status
5. **Filter & Search** - Filter per kelas dan pencarian nama/NIS
6. **Export CSV** - Download data dalam format CSV
7. **Responsive Design** - Tampilan mobile-friendly
8. **Real-time Status** - Status pendaftaran siswa (Lengkap/Belum Lengkap)

## 🔧 Setup Database

### 1. Jalankan Script SQL (Berurutan)
```sql
-- 1. Schema utama
-- Jalankan file: database/schema.sql

-- 2. Setup admin panel
-- Jalankan file: database/teacher_admin_setup.sql

-- 3. Data sample (opsional)
-- Jalankan file: database/sample_data.sql
```

### 2. Struktur Database Baru

#### Tabel `teachers`
```sql
CREATE TABLE teachers (
  id UUID PRIMARY KEY,
  nip VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  classes TEXT[], -- Array kelas yang diampu
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### View `teacher_student_overview`
View ini menggabungkan data siswa dengan enrollment info untuk kedua sesi.

## 🚀 Akses Admin Panel

### URL
```
http://localhost:3000/admin
```

### Login Credentials (Data Sample)
| Role | Email | Password | Akses |
|------|-------|----------|-------|
| **Admin** | budi.santoso@sekolah.sch.id | password123 | Semua kelas |
| **Guru** | sari.wijaya@sekolah.sch.id | password123 | 12 IPS 1, 12 IPS 2 |
| **Guru** | agus.rahman@sekolah.sch.id | password123 | 12 IPA 3 |

## 📱 Tampilan Admin Panel

### 1. Login Page
- Form login dengan email dan password
- Validasi credentials
- Session management

### 2. Dashboard
```
┌─────────────────────────────────────────────────────┐
│ 📊 Admin Panel Career Day                           │
│ Selamat datang, Pak Budi Santoso (196801011...)   │
├─────────────────────────────────────────────────────┤
│ [Filter Kelas ▼] [🔍 Cari Siswa] [📊 Export] [🔄] │
├─────────────────────────────────────────────────────┤
│ 👥 Total: 25  ✅ Event 1: 20  🎯 Event 2: 18  ❌ Belum: 7 │
├─────────────────────────────────────────────────────┤
│ NIS      │ Nama        │ Kelas    │ Event 1    │ Event 2    │ Status │
│ 20240001 │ Alice W.    │ 12 IPA 1 │ Kedokteran │ IT         │ ✅     │
│ 20240002 │ Bobby S.    │ 12 IPA 1 │ Teknik     │ -          │ ❌     │
└─────────────────────────────────────────────────────┘
```

### 3. Fitur Filter & Export
- **Filter Kelas**: Dropdown semua kelas atau kelas yang diampu
- **Search**: Real-time search nama atau NIS
- **Export CSV**: Download dengan nama file timestamp
- **Refresh**: Reload data terbaru

## 🔐 Sistem Keamanan

### Row Level Security (RLS)
```sql
-- Guru hanya bisa akses siswa di kelasnya
CREATE POLICY "Teachers can view their students" ON students 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM teachers t 
    WHERE t.id::text = auth.uid()::text 
    AND students.class = ANY(t.classes)
  )
);
```

### Session Management
- Session tersimpan di `localStorage`
- Auto-logout jika session invalid
- Secure password hashing (production)

## 📋 Contoh Data

### Data Siswa Sample
- **12 IPA 1**: 5 siswa (Alice, Bobby, Catherine, David, Eva)
- **12 IPA 2**: 5 siswa (Felix, Grace, Henry, Irene, Jack)
- **12 IPS 1**: 5 siswa (Kevin, Linda, Michael, Nancy, Oscar)
- **12 IPS 2**: 5 siswa (Patricia, Quincy, Rachel, Steven, Tiffany)
- **12 IPA 3**: 5 siswa (Ulrich, Vanessa, William, Xiomara, Yolanda)

### Status Pendaftaran Sample
- **Lengkap** (kedua sesi): Alice, Bobby, Catherine
- **Session 1 saja**: David, Felix, Kevin
- **Session 2 saja**: Grace, Linda, Patricia
- **Belum daftar**: Siswa lainnya

## 🛠️ Maintenance

### Menambah Guru Baru
```sql
INSERT INTO teachers (nip, name, email, password_hash, classes, is_admin) 
VALUES (
  '198001011999031001', 
  'Bu Sari Indrawati', 
  'sari.indrawati@sekolah.sch.id', 
  'hashed_password_here', 
  ARRAY['12 IPA 4', '12 IPA 5'], 
  false
);
```

### Update Kelas Guru
```sql
UPDATE teachers 
SET classes = ARRAY['12 IPA 1', '12 IPA 2', '12 IPA 3']
WHERE email = 'guru@sekolah.sch.id';
```

### Reset Password Guru
```sql
UPDATE teachers 
SET password_hash = 'new_hashed_password'
WHERE email = 'guru@sekolah.sch.id';
```

## 📊 Analytics yang Tersedia

### Statistik Dashboard
1. **Total Siswa**: Jumlah siswa yang dapat diakses guru
2. **Sudah Daftar Event 1**: Siswa terdaftar sesi 1
3. **Sudah Daftar Event 2**: Siswa terdaftar sesi 2  
4. **Belum Lengkap**: Siswa yang belum daftar salah satu/kedua sesi

### Data Export CSV
- Format: NIS, Nama, Kelas, Event 1, Speaker 1, Lokasi 1, Event 2, Speaker 2, Lokasi 2
- Nama file: `data_siswa_{kelas}_{tanggal}.csv`
- Encoding: UTF-8 with BOM

## 🚨 Troubleshooting

### ❌ "Teacher not found"
**Solusi**:
- Cek email sudah terdaftar di tabel `teachers`
- Pastikan tidak ada typo di email

### ❌ "Invalid password"  
**Solusi**:
- Cek password di database (development: plain text)
- Production: pastikan hash password benar

### ❌ Data siswa kosong
**Solusi**:
- Pastikan guru sudah login
- Cek array `classes` di profil guru
- Pastikan ada data di tabel `students` dengan kelas yang sesuai

### ❌ Export CSV tidak jalan
**Solusi**:
- Cek popup blocker browser
- Pastikan browser support download file
- Coba browser lain

## 🔄 Update & Pengembangan

### TODO Production
1. ✅ **Hash Password**: Implementasi bcrypt
2. ✅ **JWT Token**: Replace localStorage dengan JWT
3. ✅ **Rate Limiting**: Anti brute force login
4. ✅ **Audit Log**: Log aktivitas admin
5. ✅ **Email Notification**: Notif ke admin
6. ✅ **Backup Scheduler**: Auto backup data

### Komponen React
- `TeacherLogin.js`: Form login guru
- `AdminPanel.js`: Dashboard utama
- `TeacherAdmin.js`: Container page
- `careerDayService.js`: API service methods

### Route Tambahan
- `/admin`: Landing page admin panel
- Terintegrasi dengan routing existing

## 📞 Support

Jika ada pertanyaan atau issues:
1. Cek console browser untuk error messages
2. Cek network tab untuk API calls
3. Verify database connection dan permissions
4. Pastikan Supabase RLS policies sudah aktif

**Happy Coding! 🚀**
