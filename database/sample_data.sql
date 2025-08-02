-- Contoh Data untuk Testing Admin Panel
-- Jalankan script ini setelah schema utama dan teacher_admin_setup.sql

-- Insert sample students untuk testing
INSERT INTO students (nis, name, class) VALUES 
-- Kelas 12 IPA 1
('2024001001', 'Alice Wijaya', '12 IPA 1'),
('2024001002', 'Bobby Santoso', '12 IPA 1'),
('2024001003', 'Catherine Lim', '12 IPA 1'),
('2024001004', 'David Rahman', '12 IPA 1'),
('2024001005', 'Eva Sari', '12 IPA 1'),

-- Kelas 12 IPA 2
('2024002001', 'Felix Tan', '12 IPA 2'),
('2024002002', 'Grace Wong', '12 IPA 2'),
('2024002003', 'Henry Chen', '12 IPA 2'),
('2024002004', 'Irene Putri', '12 IPA 2'),
('2024002005', 'Jack Sutanto', '12 IPA 2'),

-- Kelas 12 IPS 1
('2024003001', 'Kevin Hartono', '12 IPS 1'),
('2024003002', 'Linda Sihombing', '12 IPS 1'),
('2024003003', 'Michael Gunawan', '12 IPS 1'),
('2024003004', 'Nancy Tjahjadi', '12 IPS 1'),
('2024003005', 'Oscar Salim', '12 IPS 1'),

-- Kelas 12 IPS 2
('2024004001', 'Patricia Hasan', '12 IPS 2'),
('2024004002', 'Quincy Suryadi', '12 IPS 2'),
('2024004003', 'Rachel Kusuma', '12 IPS 2'),
('2024004004', 'Steven Widjaja', '12 IPS 2'),
('2024004005', 'Tiffany Anggraeni', '12 IPS 2'),

-- Kelas 12 IPA 3
('2024005001', 'Ulrich Budiman', '12 IPA 3'),
('2024005002', 'Vanessa Gunawan', '12 IPA 3'),
('2024005003', 'William Tanuwijaya', '12 IPA 3'),
('2024005004', 'Xiomara Cristanto', '12 IPA 3'),
('2024005005', 'Yolanda Kartika', '12 IPA 3')

ON CONFLICT (nis) DO NOTHING;

-- Insert sample speakers
INSERT INTO speakers (name, bio, profession, company, photo_url) VALUES 
('Dr. Silvia Tanuwijaya', 'Dokter spesialis jantung dengan pengalaman 15 tahun di bidang kardiologi. Aktif dalam penelitian penyakit jantung koroner.', 'Dokter Spesialis Jantung', 'RS Harapan Kita', 'https://via.placeholder.com/150'),
('Ir. Bambang Surya', 'Kontraktor bangunan berpengalaman dalam proyek-proyek besar seperti pembangunan mall dan gedung perkantoran.', 'Kontraktor Bangunan', 'PT Bangun Jaya', 'https://via.placeholder.com/150'),
('Dra. Maria Susanti, M.Psi', 'Psikolog klinis dengan spesialisasi psikologi anak dan remaja. Praktik di beberapa rumah sakit besar di Jakarta.', 'Psikolog Klinis', 'RS Pondok Indah', 'https://via.placeholder.com/150'),
('Capt. Ahmad Rizki', 'Pilot komersial dengan pengalaman terbang lebih dari 20 tahun di maskapai internasional.', 'Pilot Komersial', 'Garuda Indonesia', 'https://via.placeholder.com/150'),
('Chef Anthony Bourdain Jr.', 'Chef eksekutif di hotel bintang 5 dengan spesialisasi masakan fusion Asia-Eropa.', 'Chef Eksekutif', 'Hotel Grand Hyatt', 'https://via.placeholder.com/150'),
('Prof. Dr. Indra Wijaya, S.T., M.T.', 'Dosen dan peneliti di bidang teknologi informasi, khususnya artificial intelligence dan machine learning.', 'Dosen & Peneliti IT', 'Universitas Indonesia', 'https://via.placeholder.com/150')

ON CONFLICT (name) DO NOTHING;

-- Insert sample locations
INSERT INTO locations (name, capacity, type, description) VALUES 
('Aula Sekolah', 600, 'aula', 'Aula utama sekolah dengan kapasitas besar untuk acara resmi'),
('Ruang IPA Lantai 2', 36, 'kelas', 'Ruang kelas IPA dengan fasilitas laboratorium mini'),
('Auditorium Canisius', 300, 'auditorium', 'Auditorium modern dengan sistem audio visual terkini'),
('Hall Utama', 800, 'hall', 'Hall terbesar sekolah untuk acara besar'),
('Ruang IPS Lantai 1', 40, 'kelas', 'Ruang kelas IPS dengan fasilitas presentasi'),
('Lab Komputer', 32, 'lab', 'Laboratorium komputer dengan 32 workstation')

ON CONFLICT (name) DO NOTHING;

-- Insert sample talks dengan speaker dan lokasi yang sudah ada
INSERT INTO talks (speaker_id, location_id, session, topic, description, start_time, end_time) VALUES 
-- Session 1
((SELECT id FROM speakers WHERE name = 'Dr. Silvia Tanuwijaya'), (SELECT id FROM locations WHERE name = 'Aula Sekolah'), 1, 'Kedokteran: Menjadi Dokter Spesialis', 'Mengenal dunia kedokteran, pendidikan dokter spesialis, dan peluang karir di bidang kesehatan', '08:00', '09:30'),
((SELECT id FROM speakers WHERE name = 'Ir. Bambang Surya'), (SELECT id FROM locations WHERE name = 'Ruang IPA Lantai 2'), 1, 'Teknik Sipil: Membangun Indonesia', 'Peluang karir di bidang konstruksi dan pembangunan infrastruktur', '08:00', '09:30'),
((SELECT id FROM speakers WHERE name = 'Dra. Maria Susanti, M.Psi'), (SELECT id FROM locations WHERE name = 'Ruang IPS Lantai 1'), 1, 'Psikologi: Memahami Jiwa Manusia', 'Karir sebagai psikolog klinis dan konselor', '08:00', '09:30'),

-- Session 2
((SELECT id FROM speakers WHERE name = 'Capt. Ahmad Rizki'), (SELECT id FROM locations WHERE name = 'Auditorium Canisius'), 2, 'Penerbangan: Terbang Tinggi Menggapai Mimpi', 'Menjadi pilot komersial dan karir di industri penerbangan', '10:00', '11:30'),
((SELECT id FROM speakers WHERE name = 'Chef Anthony Bourdain Jr.'), (SELECT id FROM locations WHERE name = 'Hall Utama'), 2, 'Kuliner: Seni dan Bisnis di Dapur', 'Karir di industri kuliner dan hospitality', '10:00', '11:30'),
((SELECT id FROM speakers WHERE name = 'Prof. Dr. Indra Wijaya, S.T., M.T.'), (SELECT id FROM locations WHERE name = 'Lab Komputer'), 2, 'Teknologi Informasi: Era Digital', 'Karir di bidang IT, programming, dan teknologi masa depan', '10:00', '11:30')

ON CONFLICT DO NOTHING;

-- Insert sample enrollments untuk menunjukkan data di admin panel
-- Beberapa siswa sudah mendaftar kedua sesi, beberapa hanya satu sesi, beberapa belum sama sekali

-- Siswa yang sudah lengkap (kedua sesi)
INSERT INTO enrollments (student_id, talk_id) VALUES 
-- Alice Wijaya - Session 1: Kedokteran, Session 2: Teknologi
((SELECT id FROM students WHERE nis = '2024001001'), (SELECT id FROM talks WHERE topic = 'Kedokteran: Menjadi Dokter Spesialis')),
((SELECT id FROM students WHERE nis = '2024001001'), (SELECT id FROM talks WHERE topic = 'Teknologi Informasi: Era Digital')),

-- Bobby Santoso - Session 1: Teknik Sipil, Session 2: Penerbangan
((SELECT id FROM students WHERE nis = '2024001002'), (SELECT id FROM talks WHERE topic = 'Teknik Sipil: Membangun Indonesia')),
((SELECT id FROM students WHERE nis = '2024001002'), (SELECT id FROM talks WHERE topic = 'Penerbangan: Terbang Tinggi Menggapai Mimpi')),

-- Catherine Lim - Session 1: Psikologi, Session 2: Kuliner
((SELECT id FROM students WHERE nis = '2024001003'), (SELECT id FROM talks WHERE topic = 'Psikologi: Memahami Jiwa Manusia')),
((SELECT id FROM students WHERE nis = '2024001003'), (SELECT id FROM talks WHERE topic = 'Kuliner: Seni dan Bisnis di Dapur')),

-- Siswa yang hanya mendaftar session 1
((SELECT id FROM students WHERE nis = '2024001004'), (SELECT id FROM talks WHERE topic = 'Kedokteran: Menjadi Dokter Spesialis')),
((SELECT id FROM students WHERE nis = '2024002001'), (SELECT id FROM talks WHERE topic = 'Teknik Sipil: Membangun Indonesia')),
((SELECT id FROM students WHERE nis = '2024003001'), (SELECT id FROM talks WHERE topic = 'Psikologi: Memahami Jiwa Manusia')),

-- Siswa yang hanya mendaftar session 2
((SELECT id FROM students WHERE nis = '2024002002'), (SELECT id FROM talks WHERE topic = 'Penerbangan: Terbang Tinggi Menggapai Mimpi')),
((SELECT id FROM students WHERE nis = '2024003002'), (SELECT id FROM talks WHERE topic = 'Kuliner: Seni dan Bisnis di Dapur')),
((SELECT id FROM students WHERE nis = '2024004001'), (SELECT id FROM talks WHERE topic = 'Teknologi Informasi: Era Digital'))

ON CONFLICT DO NOTHING;

-- Refresh view untuk memastikan data terbaru
REFRESH MATERIALIZED VIEW IF EXISTS teacher_student_overview;
