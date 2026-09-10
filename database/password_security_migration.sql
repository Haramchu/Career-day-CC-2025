-- Password security migration for the legacy student table and teachers table.
-- Run once in the Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash existing plaintext values before enabling the new login functions.
UPDATE teachers
SET password_hash = crypt(password_hash, gen_salt('bf', 12))
WHERE password_hash IS NOT NULL
  AND password_hash NOT LIKE '$2a$%'
  AND password_hash NOT LIKE '$2b$%'
  AND password_hash NOT LIKE '$2y$%';

UPDATE student
SET student_password = crypt(student_password, gen_salt('bf', 12))
WHERE student_password IS NOT NULL
  AND student_password NOT LIKE '$2a$%'
  AND student_password NOT LIKE '$2b$%'
  AND student_password NOT LIKE '$2y$%';

DROP FUNCTION IF EXISTS teacher_login(TEXT, TEXT);

CREATE OR REPLACE FUNCTION teacher_login(teacher_email TEXT, teacher_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  teacher_record teachers%ROWTYPE;
BEGIN
  SELECT *
  INTO teacher_record
  FROM teachers
  WHERE lower(email) = lower(trim(teacher_email));

  IF teacher_record.id IS NULL
     OR teacher_record.password_hash IS NULL
     OR crypt(teacher_password, teacher_record.password_hash) <> teacher_record.password_hash THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'teacher', jsonb_build_object(
      'id', teacher_record.id,
      'nip', teacher_record.nip,
      'name', teacher_record.name,
      'email', teacher_record.email,
      'classes', teacher_record.classes,
      'is_admin', teacher_record.is_admin
    )
  );
END;
$$;

DROP FUNCTION IF EXISTS student_login(TEXT, TEXT);

CREATE OR REPLACE FUNCTION student_login(student_email_input TEXT, student_password_input TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  student_record student%ROWTYPE;
BEGIN
  SELECT *
  INTO student_record
  FROM student
  WHERE lower(student_email) = lower(trim(student_email_input));

  IF student_record.student_email IS NULL
     OR student_record.student_password IS NULL
     OR crypt(student_password_input, student_record.student_password) <> student_record.student_password THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid email or password');
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'needs_password_change', student_record.student_nis = student_password_input,
    'student', to_jsonb(student_record) - 'student_password'
  );
END;
$$;

DROP FUNCTION IF EXISTS student_change_password(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION student_change_password(
  student_email_input TEXT,
  current_password TEXT,
  new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  student_record student%ROWTYPE;
BEGIN
  IF length(new_password) < 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'New password must be at least 6 characters long');
  END IF;

  SELECT *
  INTO student_record
  FROM student
  WHERE lower(student_email) = lower(trim(student_email_input));

  IF student_record.student_email IS NULL
     OR student_record.student_password IS NULL
     OR crypt(current_password, student_record.student_password) <> student_record.student_password THEN
    RETURN jsonb_build_object('success', false, 'error', 'Current password is incorrect');
  END IF;

  UPDATE student
  SET student_password = crypt(new_password, gen_salt('bf', 12))
  WHERE student_email = student_record.student_email;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION teacher_login(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION student_login(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION student_change_password(TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION teacher_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION student_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION student_change_password(TEXT, TEXT, TEXT) TO anon, authenticated;
