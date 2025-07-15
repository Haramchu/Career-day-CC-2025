# Career Day Enrollment System - Database Setup Guide

## Overview
Sistem enrollment untuk acara Career Day dengan fitur:
- Validasi siswa berdasarkan NIS
- Pemilihan kelas per sesi (maksimal 1 kelas per sesi)
- Manajemen kapasitas ruangan
- Perubahan pilihan kelas

## Database Setup di Supabase

### 1. Akses Supabase Dashboard
1. Buka browser dan kunjungi: https://supabase.com/dashboard/project/ebporgvcbblefblkapxg
2. Login dengan akun yang memiliki akses ke project ini

### 2. Jalankan SQL Schema
1. Di dashboard Supabase, pilih menu **SQL Editor** di sidebar kiri
2. Klik **New Query**
3. Copy seluruh isi file `database/schema.sql` ke dalam query editor
4. Klik **Run** untuk menjalankan script

### 3. Verifikasi Tabel
Setelah menjalankan script, pastikan tabel-tabel berikut sudah terbuat:
- `students` - Data siswa dan NIS
- `speakers` - Data pembicara 
- `locations` - Data lokasi/ruangan dengan kapasitas
- `talks` - Data kelas/topik yang akan disampaikan
- `enrollments` - Data enrollment siswa ke kelas

### 4. Insert Data
Untuk testing, Anda bisa:
1. Gunakan sample data yang ada di bagian bawah file `schema.sql`
2. Atau gunakan fitur **Database Test** di aplikasi web (route `/test-db`)

## Environment Variables
Pastikan file `.env` sudah ada dengan konfigurasi:
```
REACT_APP_SUPABASE_URL=https://ebporgvcbblefblkapxg.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVicG9yZ3ZjYmJsZWZibGthcHhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjM0NTgsImV4cCI6MjA2Nzk5OTQ1OH0.jyCFy7igeIOQ8uzL2RtbSSfE4JKhtEprS5jSpI__veo
```

## Testing Koneksi Database

### 1. Jalankan Aplikasi
```bash
npm start
```

### 2. Akses Database Test
Buka browser dan kunjungi: http://localhost:3000/test-db

### 3. Fitur Testing
- **Test Connection**: Cek koneksi ke database
- **Test Enrollment Logic**: Test semua fungsi enrollment
- **Create Sample Data**: Buat data sample untuk testing

## Struktur Database

### Students
```sql
- id (UUID, Primary Key)
- nis (VARCHAR, Unique) - Nomor Induk Siswa
- name (VARCHAR) - Nama siswa
- class (VARCHAR) - Kelas siswa
```

### Speakers
```sql
- id (UUID, Primary Key)  
- name (VARCHAR) - Nama pembicara
- bio (TEXT) - Biografi pembicara
- photo_url (TEXT) - URL foto pembicara
- profession (VARCHAR) - Profesi
- company (VARCHAR) - Perusahaan/institusi
```

### Locations
```sql
- id (UUID, Primary Key)
- name (VARCHAR) - Nama lokasi
- capacity (INTEGER) - Kapasitas ruangan
- type (VARCHAR) - Jenis ruangan (hall, aula, auditorium, kelas)
```

### Talks
```sql
- id (UUID, Primary Key)
- speaker_id (UUID, Foreign Key ke speakers)
- location_id (UUID, Foreign Key ke locations)
- session (INTEGER) - Sesi 1 atau 2
- topic (VARCHAR) - Topik pembicaraan
- description (TEXT) - Deskripsi detail
- start_time (TIME) - Waktu mulai
- end_time (TIME) - Waktu selesai
```

### Enrollments
```sql
- id (UUID, Primary Key)
- student_id (UUID, Foreign Key ke students)
- talk_id (UUID, Foreign Key ke talks)
- enrolled_at (TIMESTAMP) - Waktu enrollment
```

## Business Rules

### 1. Constraint per Sesi
- Setiap siswa hanya bisa memilih 1 kelas per sesi
- Diimplementasikan dengan database trigger

### 2. Kapasitas Ruangan
- Sistem akan cek kapasitas sebelum enrollment
- Jika penuh, enrollment akan ditolak

### 3. Perubahan Pilihan
- Siswa bisa mengganti pilihan kelas
- Sistem akan hapus enrollment lama dan buat baru secara atomic

## API Functions (CareerDayService)

### Student Operations
- `validateStudent(nis)` - Validasi NIS siswa
- `getStudentEnrollments(studentId)` - Ambil enrollment siswa

### Talk Operations  
- `getAllTalks()` - Ambil semua kelas/talks
- `getTalksBySession(session)` - Ambil kelas per sesi

### Enrollment Operations
- `enrollStudent(studentId, talkId)` - Enroll siswa ke kelas
- `unenrollStudent(studentId, talkId)` - Hapus enrollment
- `changeEnrollment(studentId, oldTalkId, newTalkId)` - Ganti pilihan

### Statistics
- `getEnrollmentStats()` - Statistik enrollment per kelas

## Troubleshooting

### 1. Connection Error
- Pastikan URL dan anon key Supabase benar
- Cek apakah project Supabase masih aktif

### 2. Table Not Found
- Jalankan ulang script SQL schema
- Pastikan semua tabel sudah terbuat dengan benar

### 3. RLS (Row Level Security) Issues
- Policy sudah dikonfigurasi untuk akses publik read
- Jika ada masalah akses, cek policy di Supabase dashboard

### 4. Trigger Error
- Pastikan function dan trigger untuk validasi sesi sudah terbuat
- Cek di Supabase Functions apakah `change_enrollment` sudah ada

## Next Steps
1. Setup database schema di Supabase
2. Insert data siswa, pembicara, lokasi, dan talks
3. Test semua fungsi enrollment
4. Implementasi UI untuk enrollment
5. Deploy aplikasi
