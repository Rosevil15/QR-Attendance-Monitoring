-- ============================================
-- SUPABASE DATABASE SETUP
-- QR Attendance System
-- ============================================

-- 1. Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'Present',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create students table (optional - for managing student records)
CREATE TABLE IF NOT EXISTS students (
  id BIGSERIAL PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_datetime ON attendance(datetime);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for attendance table
-- Allow anyone to insert attendance (for student scanning)
CREATE POLICY "Allow insert attendance" ON attendance
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read attendance (for admin dashboard)
CREATE POLICY "Allow read attendance" ON attendance
  FOR SELECT
  USING (true);

-- 6. Create policies for students table
-- Allow anyone to read students
CREATE POLICY "Allow read students" ON students
  FOR SELECT
  USING (true);

-- Allow insert students (for registration)
CREATE POLICY "Allow insert students" ON students
  FOR INSERT
  WITH CHECK (true);

-- 7. Create a view for daily attendance summary
CREATE OR REPLACE VIEW daily_attendance_summary AS
SELECT 
  DATE(datetime) as date,
  COUNT(*) as total_present,
  COUNT(DISTINCT student_id) as unique_students
FROM attendance
GROUP BY DATE(datetime)
ORDER BY date DESC;

-- 8. Create a function to prevent duplicate attendance on same day
CREATE OR REPLACE FUNCTION check_duplicate_attendance()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM attendance
    WHERE student_id = NEW.student_id
    AND DATE(datetime) = DATE(NEW.datetime)
  ) THEN
    RAISE EXCEPTION 'Attendance already recorded for this student today';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
