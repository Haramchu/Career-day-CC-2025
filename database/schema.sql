-- SQL Schema untuk Career Day Enrollment System
-- Jalankan script ini di Supabase SQL Editor

-- Tabel untuk menyimpan data siswa
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nis VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk menyimpan data pembicara
CREATE TABLE IF NOT EXISTS speakers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  photo_url TEXT,
  profession VARCHAR(255),
  company VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk menyimpan lokasi/ruangan
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity INTEGER NOT NULL,
  type VARCHAR(50), -- 'hall', 'aula', 'auditorium', 'kelas'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk menyimpan talks/kelas
CREATE TABLE IF NOT EXISTS talks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  speaker_id UUID REFERENCES speakers(id),
  location_id UUID REFERENCES locations(id),
  session INTEGER NOT NULL CHECK (session IN (1, 2)),
  topic VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIME,
  end_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk menyimpan enrollment siswa
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  talk_id UUID REFERENCES talks(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint untuk memastikan siswa tidak bisa enroll ke lebih dari 1 kelas per sesi
  UNIQUE(student_id, talk_id)
);

-- Index untuk optimasi query
CREATE INDEX IF NOT EXISTS idx_students_nis ON students(nis);
CREATE INDEX IF NOT EXISTS idx_talks_session ON talks(session);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_talk_id ON enrollments(talk_id);

-- Constraint untuk memastikan siswa hanya bisa memilih 1 kelas per sesi
CREATE OR REPLACE FUNCTION check_one_enrollment_per_session()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM enrollments e
    JOIN talks t ON e.talk_id = t.id
    JOIN talks new_talk ON new_talk.id = NEW.talk_id
    WHERE e.student_id = NEW.student_id
    AND t.session = new_talk.session
    AND e.id != COALESCE(NEW.id, gen_random_uuid())
  ) THEN
    RAISE EXCEPTION 'Student can only enroll in one talk per session';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_check_one_enrollment_per_session
  BEFORE INSERT OR UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION check_one_enrollment_per_session();

-- Function untuk mengganti enrollment (atomic operation)
CREATE OR REPLACE FUNCTION change_enrollment(
  p_student_id UUID,
  p_old_talk_id UUID,
  p_new_talk_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_new_talk_session INTEGER;
  v_current_enrollment_count INTEGER;
  v_location_capacity INTEGER;
BEGIN
  -- Get session and capacity info for new talk
  SELECT t.session, l.capacity
  INTO v_new_talk_session, v_location_capacity
  FROM talks t
  JOIN locations l ON t.location_id = l.id
  WHERE t.id = p_new_talk_id;

  -- Check if new talk exists
  IF v_new_talk_session IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Talk not found');
  END IF;

  -- Check current enrollment count for new talk
  SELECT COUNT(*)
  INTO v_current_enrollment_count
  FROM enrollments
  WHERE talk_id = p_new_talk_id;

  -- Check if new talk is full
  IF v_current_enrollment_count >= v_location_capacity THEN
    RETURN json_build_object('success', false, 'error', 'Talk is full');
  END IF;

  -- Start transaction
  BEGIN
    -- Delete old enrollment
    DELETE FROM enrollments 
    WHERE student_id = p_student_id AND talk_id = p_old_talk_id;

    -- Insert new enrollment
    INSERT INTO enrollments (student_id, talk_id, enrolled_at)
    VALUES (p_student_id, p_new_talk_id, NOW());

    RETURN json_build_object('success', true, 'message', 'Enrollment changed successfully');
  EXCEPTION
    WHEN OTHERS THEN
      RETURN json_build_object('success', false, 'error', SQLERRM);
  END;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE talks ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Policies untuk akses data
-- Students: bisa read semua, insert/update hanya data sendiri
CREATE POLICY "Students can view all students" ON students FOR SELECT USING (true);
CREATE POLICY "Students can insert their own data" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Students can update their own data" ON students FOR UPDATE USING (true);

-- Speakers: read only untuk semua
CREATE POLICY "Anyone can view speakers" ON speakers FOR SELECT USING (true);

-- Locations: read only untuk semua
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);

-- Talks: read only untuk semua
CREATE POLICY "Anyone can view talks" ON talks FOR SELECT USING (true);

-- Enrollments: bisa CRUD untuk data sendiri
CREATE POLICY "Students can view all enrollments" ON enrollments FOR SELECT USING (true);
CREATE POLICY "Students can insert their own enrollments" ON enrollments FOR INSERT WITH CHECK (true);
CREATE POLICY "Students can update their own enrollments" ON enrollments FOR UPDATE USING (true);
CREATE POLICY "Students can delete their own enrollments" ON enrollments FOR DELETE USING (true);

-- Sample data (opsional - untuk testing)
-- Uncomment dan sesuaikan dengan data sekolah Anda

/*
-- Insert sample students
INSERT INTO students (nis, name, class) VALUES 
('2024001001', 'Carlo Wijaya', '12 IPA 1'),
('2024001002', 'Sari Putri', '12 IPA 2'),
('2024001003', 'Budi Santoso', '12 IPS 1');

-- Insert sample speakers
INSERT INTO speakers (name, bio, profession, company, photo_url) VALUES 
('Dr. Silman', 'Dokter spesialis jantung dengan pengalaman 15 tahun', 'Dokter Spesialis Jantung', 'RS Harapan Kita', 'https://via.placeholder.com/150'),
('Ir. Silo', 'Kontraktor bangunan berpengalaman dalam proyek-proyek besar', 'Kontraktor Bangunan', 'PT Bangun Jaya', 'https://via.placeholder.com/150');

-- Insert sample locations
INSERT INTO locations (name, capacity, type) VALUES 
('Aula Sekolah', 600, 'aula'),
('Ruang IPA', 36, 'kelas'),
('Auditorium', 300, 'auditorium'),
('Hall Utama', 800, 'hall');

-- Insert sample talks
INSERT INTO talks (speaker_id, location_id, session, topic, description, start_time, end_time) VALUES 
((SELECT id FROM speakers WHERE name = 'Dr. Silman'), (SELECT id FROM locations WHERE name = 'Aula Sekolah'), 1, 'Kedokteran', 'Mengenal dunia kedokteran dan spesialisasi', '08:00', '09:30'),
((SELECT id FROM speakers WHERE name = 'Ir. Silo'), (SELECT id FROM locations WHERE name = 'Ruang IPA'), 2, 'Kontraktor Bangunan', 'Peluang karir di bidang konstruksi dan bangunan', '10:00', '11:30');
*/
