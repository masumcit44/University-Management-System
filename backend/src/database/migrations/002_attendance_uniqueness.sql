-- =========================================================
-- Migration 002: Attendance uniqueness
-- Prevents duplicate attendance records for the same student
-- (enrollment) on the same class date.
--
-- Target: MariaDB 10.4+ / MySQL 8.
-- Safe to re-run: the dedupe is idempotent and the unique
-- index uses IF NOT EXISTS.
-- =========================================================

USE university_management_system;

-- ---------------------------------------------------------
-- 1. De-duplicate existing rows (keep the earliest record
--    per enrollment + date, drop later duplicates)
-- ---------------------------------------------------------
DELETE a1
FROM attendance a1
JOIN attendance a2
    ON a1.enrollment_id = a2.enrollment_id
   AND a1.attendance_date = a2.attendance_date
   AND a1.attendance_id > a2.attendance_id;

-- ---------------------------------------------------------
-- 2. Enforce uniqueness going forward
-- ---------------------------------------------------------
ALTER TABLE attendance
    ADD UNIQUE INDEX IF NOT EXISTS uq_attendance_enrollment_date (enrollment_id, attendance_date);
