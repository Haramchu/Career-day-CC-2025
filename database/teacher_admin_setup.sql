-- Setup untuk Admin Panel Guru
-- Tambahkan script ini ke schema.sql yang sudah ada

-- Tabel untuk data guru
CREATE TABLE IF NOT EXISTS teachers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nip VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  classes TEXT[], -- Array kelas yang diampu guru, misal: ['12 IPA 1', '12 IPA 2']
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS untuk tabel teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

-- Policy untuk teachers - hanya admin atau guru sendiri yang bisa akses
CREATE POLICY "Teachers can view their own data" ON teachers 
FOR SELECT USING (auth.uid()::text = id::text OR is_admin = true);

CREATE POLICY "Only admin can insert teachers" ON teachers 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM teachers 
    WHERE id::text = auth.uid()::text AND is_admin = true
  )
);

CREATE POLICY "Teachers can update their own data" ON teachers 
FOR UPDATE USING (auth.uid()::text = id::text OR is_admin = true);

-- Modifikasi policy students untuk akses guru
DROP POLICY IF EXISTS "Students can view all students" ON students;
CREATE POLICY "Students and teachers can view students" ON students 
FOR SELECT USING (
  true OR 
  EXISTS (
    SELECT 1 FROM teachers t 
    WHERE t.id::text = auth.uid()::text 
    AND (t.is_admin = true OR students.class = ANY(t.classes))
  )
);

-- View untuk admin panel guru - melihat siswa dengan enrollment info
CREATE OR REPLACE VIEW teacher_student_overview AS
SELECT 
  s.nis,
  s.name,
  s.class,
  
  -- Event 1 (Session 1)
  t1.topic as event_1_topic,
  sp1.name as event_1_speaker,
  l1.name as event_1_location,
  t1.start_time as event_1_time,
  
  -- Event 2 (Session 2)
  t2.topic as event_2_topic,
  sp2.name as event_2_speaker,
  l2.name as event_2_location,
  t2.start_time as event_2_time,
  
  s.created_at,
  s.updated_at
  
FROM students s

-- Left join untuk session 1
LEFT JOIN enrollments e1 ON s.id = e1.student_id
LEFT JOIN talks t1 ON e1.talk_id = t1.id AND t1.session = 1
LEFT JOIN speakers sp1 ON t1.speaker_id = sp1.id
LEFT JOIN locations l1 ON t1.location_id = l1.id

-- Left join untuk session 2
LEFT JOIN enrollments e2 ON s.id = e2.student_id
LEFT JOIN talks t2 ON e2.talk_id = t2.id AND t2.session = 2
LEFT JOIN speakers sp2 ON t2.speaker_id = sp2.id
LEFT JOIN locations l2 ON t2.location_id = l2.id

ORDER BY s.class, s.name;

-- Grant access ke view untuk teachers
GRANT SELECT ON teacher_student_overview TO authenticated;

-- Function untuk teacher login
CREATE OR REPLACE FUNCTION teacher_login(teacher_email TEXT, teacher_password TEXT)
RETURNS JSON AS $$
DECLARE
  teacher_record teachers%ROWTYPE;
  is_valid BOOLEAN DEFAULT FALSE;
BEGIN
  -- Cari teacher berdasarkan email
  SELECT * INTO teacher_record 
  FROM teachers 
  WHERE email = teacher_email;
  
  -- Jika teacher tidak ditemukan
  IF teacher_record.id IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Teacher not found'
    );
  END IF;
  
  -- Verifikasi password (dalam implementasi real, gunakan bcrypt)
  -- Untuk sekarang, kita bandingkan langsung (tidak aman untuk production)
  IF teacher_record.password_hash = teacher_password THEN
    is_valid := TRUE;
  END IF;
  
  IF is_valid THEN
    RETURN json_build_object(
      'success', true,
      'teacher', json_build_object(
        'id', teacher_record.id,
        'nip', teacher_record.nip,
        'name', teacher_record.name,
        'email', teacher_record.email,
        'classes', teacher_record.classes,
        'is_admin', teacher_record.is_admin
      )
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid password'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data guru (untuk testing)
-- Password dalam implementasi real harus di-hash
INSERT INTO teachers (nip, name, email, password_hash, classes, is_admin) VALUES 
('196801011990031001', 'Pak Budi Santoso', 'budi.santoso@sekolah.sch.id', 'password123', ARRAY['12 IPA 1', '12 IPA 2'], true),
('197505101998032002', 'Bu Sari Wijaya', 'sari.wijaya@sekolah.sch.id', 'password123', ARRAY['12 IPS 1', '12 IPS 2'], false),
('198003151999031003', 'Pak Agus Rahman', 'agus.rahman@sekolah.sch.id', 'password123', ARRAY['12 IPA 3'], false)
ON CONFLICT (nip) DO NOTHING;
