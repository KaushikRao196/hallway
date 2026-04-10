-- ============================================================
-- Hallway — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- ============================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS teacher_ratings CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS answers CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- Schools
CREATE TABLE IF NOT EXISTS schools (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  domain     TEXT NOT NULL UNIQUE
);

-- Users (application-level users, separate from Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  anon_handle TEXT NOT NULL,
  school_id   TEXT NOT NULL REFERENCES schools(id),
  email       TEXT NOT NULL UNIQUE
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id        TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id),
  code      TEXT NOT NULL,
  title     TEXT NOT NULL
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id        TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES schools(id),
  name      TEXT NOT NULL
);

-- Questions
CREATE TABLE IF NOT EXISTS questions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id),
  school_id  TEXT NOT NULL REFERENCES schools(id),
  class_id   TEXT NOT NULL REFERENCES classes(id),
  teacher_id TEXT REFERENCES teachers(id),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers
CREATE TABLE IF NOT EXISTS answers (
  id          TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users(id),
  body        TEXT NOT NULL,
  score       INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Votes (one vote per user per answer)
CREATE TABLE IF NOT EXISTS votes (
  user_id     TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL DEFAULT 'answer',
  target_id   TEXT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  value       SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  PRIMARY KEY (user_id, target_id)
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id          TEXT PRIMARY KEY,
  reporter_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('question', 'answer')),
  target_id   TEXT NOT NULL,
  reason      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teacher ratings (one rating per user per teacher)
CREATE TABLE IF NOT EXISTS teacher_ratings (
  id         TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  user_id    TEXT NOT NULL REFERENCES users(id),
  difficulty SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  fairness   SMALLINT NOT NULL CHECK (fairness BETWEEN 1 AND 5),
  workload   SMALLINT NOT NULL CHECK (workload BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, user_id)
);

-- ============================================================
-- Seed data
-- ============================================================

INSERT INTO schools (id, name, domain) VALUES
  ('school-1', 'Irving High School', 'irving.edu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (id, school_id, code, title) VALUES
  ('class-1', 'school-1', 'MATH101', 'Algebra I'),
  ('class-2', 'school-1', 'MATH201', 'Calculus AB'),
  ('class-3', 'school-1', 'ENG101',  'English Literature'),
  ('class-4', 'school-1', 'SCI101',  'Biology'),
  ('class-5', 'school-1', 'HIST101', 'World History'),
  ('class-6', 'school-1', 'CS101',   'Intro to Computer Science')
ON CONFLICT (id) DO NOTHING;

INSERT INTO teachers (id, school_id, name) VALUES
  ('teacher-1', 'school-1', 'Mr. Johnson'),
  ('teacher-2', 'school-1', 'Ms. Rodriguez'),
  ('teacher-3', 'school-1', 'Dr. Chen'),
  ('teacher-4', 'school-1', 'Mrs. Thompson'),
  ('teacher-5', 'school-1', 'Mr. Williams')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, anon_handle, school_id, email) VALUES
  ('user-1', 'BluePanda482',    'school-1', 'student1@irving.edu'),
  ('user-2', 'SwiftEagle123',   'school-1', 'student2@irving.edu'),
  ('user-3', 'CalmDolphin789',  'school-1', 'student3@irving.edu'),
  ('user-4', 'WiseOwl456',      'school-1', 'student4@irving.edu')
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, user_id, school_id, class_id, teacher_id, title, body, created_at) VALUES
  ('q-1', 'user-2', 'school-1', 'class-1', 'teacher-1',
   'How hard are Mr. Johnson''s tests compared to the homework?',
   'I''m doing fine on homework but worried about the midterm. Does he test on stuff that wasn''t covered in class? Any surprises to watch out for?',
   NOW() - INTERVAL '2 hours'),
  ('q-2', 'user-3', 'school-1', 'class-3', 'teacher-4',
   'What actually determines your grade in Mrs. Thompson''s English class?',
   'I hear participation matters a lot but is it really about talking in class or is the essay grading where it counts? How strict is she on formatting?',
   NOW() - INTERVAL '5 hours'),
  ('q-3', 'user-4', 'school-1', 'class-2', 'teacher-2',
   'Is Ms. Rodriguez''s Calc AB manageable with 3 other APs?',
   'I''m signed up for AP Bio, APUSH, and AP Lang next year. Is her workload intense enough that I should drop one? How many hours of homework per night?',
   NOW() - INTERVAL '24 hours'),
  ('q-4', 'user-1', 'school-1', 'class-4', 'teacher-3',
   'If you don''t get Dr. Chen for Bio, should you switch sections?',
   'I got assigned to a different teacher but everyone says Dr. Chen is the best. Is it worth the hassle to try to switch? What makes him so different?',
   NOW() - INTERVAL '3 days'),
  ('q-5', 'user-2', 'school-1', 'class-6', 'teacher-5',
   'Does Mr. Williams curve the final in CS101?',
   'The class average on the midterm was rough. Does he typically curve at the end? What''s the realistic grade distribution look like?',
   NOW() - INTERVAL '12 hours'),
  ('q-6', 'user-4', 'school-1', 'class-5', NULL,
   'Best time of year to take World History?',
   'Is there a difference between fall and spring semester? I heard the workload is lighter in spring because of testing schedule.',
   NOW() - INTERVAL '36 hours')
ON CONFLICT (id) DO NOTHING;

INSERT INTO answers (id, question_id, user_id, body, score, created_at) VALUES
  ('a-1', 'q-1', 'user-4',
   'His tests are definitely harder than homework. He throws in 1-2 ''challenge problems'' that weren''t in any examples. Focus on understanding the concepts deeply, not just memorizing steps. The good news is he gives partial credit if you show your work.',
   12, NOW() - INTERVAL '1 hour'),
  ('a-2', 'q-1', 'user-3',
   'Go to his office hours before the midterm! He basically hints at what types of problems will be on the test. Also, the review packet he gives out is very similar to the actual test format.',
   8, NOW() - INTERVAL '45 minutes'),
  ('a-3', 'q-2', 'user-1',
   'Participation is like 15% but she really notices who speaks up. For essays, she cares way more about your thesis being original than perfect grammar. Use MLA format strictly though - she will dock points for wrong margins.',
   15, NOW() - INTERVAL '4 hours'),
  ('a-4', 'q-3', 'user-1',
   'Honestly, it''s doable but expect 1.5-2 hours of calc homework most nights. Her problem sets are long but she doesn''t grade every problem - she randomly picks 5 to check. The real time sink is her weekly quizzes which require serious prep.',
   20, NOW() - INTERVAL '20 hours'),
  ('a-5', 'q-4', 'user-2',
   '100% worth switching if you can. Dr. Chen actually explains the ''why'' behind everything. His tests are harder but he curves generously and writes amazing rec letters. Other bio teachers just have you memorize from the textbook.',
   18, NOW() - INTERVAL '2 days'),
  ('a-6', 'q-5', 'user-4',
   'He curved by about 8% last semester. But honestly the projects matter more than tests - he weights those heavily. If you do well on the final project, you can recover from a bad midterm. Class average usually ends up around B-.',
   10, NOW() - INTERVAL '10 hours'),
  ('a-7', 'q-6', 'user-3',
   'Spring is definitely easier because the AP testing window means teachers rush through less content. Fall semester covers more chapters but you have more time. I''d do spring if you''re taking other hard classes.',
   7, NOW() - INTERVAL '30 hours')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Disable RLS for development (enable and add policies for production)
-- ============================================================
ALTER TABLE schools         DISABLE ROW LEVEL SECURITY;
ALTER TABLE users           DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers        DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions       DISABLE ROW LEVEL SECURITY;
ALTER TABLE answers         DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes           DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports         DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_ratings DISABLE ROW LEVEL SECURITY;
