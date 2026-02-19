-- Seed data for classes
INSERT INTO classes (id, code, name, semester) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'CS 1301', 'Intro to Computing', 'Fall 2025'),
  ('c1000000-0000-0000-0000-000000000002', 'CS 1331', 'Intro to OOP', 'Fall 2025'),
  ('c1000000-0000-0000-0000-000000000003', 'CS 1332', 'Data Structures & Algorithms', 'Fall 2025'),
  ('c1000000-0000-0000-0000-000000000004', 'MATH 1551', 'Differential Calculus', 'Fall 2025'),
  ('c1000000-0000-0000-0000-000000000005', 'MATH 1552', 'Integral Calculus', 'Spring 2026'),
  ('c1000000-0000-0000-0000-000000000006', 'PHYS 2211', 'Intro Physics I', 'Fall 2025'),
  ('c1000000-0000-0000-0000-000000000007', 'CS 2340', 'Objects & Design', 'Spring 2026'),
  ('c1000000-0000-0000-0000-000000000008', 'CS 2050', 'Discrete Math for CS', 'Fall 2025')
ON CONFLICT (id) DO NOTHING;

-- Seed data for teachers
INSERT INTO teachers (id, name, department) VALUES
  ('t1000000-0000-0000-0000-000000000001', 'Dr. Smith', 'Computer Science'),
  ('t1000000-0000-0000-0000-000000000002', 'Prof. Johnson', 'Computer Science'),
  ('t1000000-0000-0000-0000-000000000003', 'Dr. Williams', 'Mathematics'),
  ('t1000000-0000-0000-0000-000000000004', 'Prof. Davis', 'Physics'),
  ('t1000000-0000-0000-0000-000000000005', 'Dr. Chen', 'Computer Science'),
  ('t1000000-0000-0000-0000-000000000006', 'Prof. Martinez', 'Mathematics')
ON CONFLICT (id) DO NOTHING;
