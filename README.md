# University Management System

A full-stack University Management System developed for the Database Management System Laboratory.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express.js
- Database: MySQL
- Authentication: JWT

## Status

🚧 Project Initialization

## Test Accounts

The following accounts are seeded for logging into the live/production site:

| Role    | Email             | Password    |
|---------|-------------------|-------------|
| Admin   | admin1@ums.com    | Admin@123   |
| Teacher | teacher1@ums.com  | Teacher@123 |
| Student | student1@ums.com  | Student@123 |

> **Note:** These are demo/test accounts only. Passwords should be changed before real production use.

### Teacher — teacher1@ums.com

**User account**

| Field | Value |
|-------|-------|
| Username | teacher1 |
| Email | teacher1@ums.com |
| Role | teacher |
| Status | Active |
| Created at | 2026-08-16 09:17:57 UTC |
| Last login | 2026-08-16 09:19:40 UTC |

**Profile (teachers table)**

| Field | Value |
|-------|-------|
| teacher_id | 1 |
| Name | teacher1 |
| Phone | 01000000000 |
| Designation | Lecturer |
| Gender / Address / DOB / Joining date | None set |
| Department | Computer Science (CSE) |

**Related data**

| Field | Value |
|-------|-------|
| Assigned courses (teacher_courses) | None |
| Timetable | None |
| Course materials | None |
| Announcements (created by) | None |

### Student — student1@ums.com

**User account**

| Field | Value |
|-------|-------|
| Username | student1 |
| Email | student1@ums.com |
| Role | student |
| Status | Active |
| Created at | 2026-08-16 09:17:57 UTC |
| Last login | 2026-08-16 09:33:56 UTC |

**Profile (students table)**

| Field | Value |
|-------|-------|
| student_id | 1 |
| Name | student1 |
| Phone | 01000000000 |
| Gender / Address / DOB / Admission date | None set |
| Department | Computer Science (CSE) |

**Enrollments**

| Course | Semester | Session | Enrollment date | Status |
|--------|----------|---------|-----------------|--------|
| CE301 — Geotechnical Engineering (3.00 cr) | 5 | 2026 | 2026-08-16 | pending |

| Section | Records |
|---------|---------|
| Attendance records | None |
| Exam / results | None |
| Payments | None |

(No records exist yet for this student in any of these tables)