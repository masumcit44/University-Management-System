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

**Assigned courses (teacher_courses)**

| Course | Name | Credit |
|--------|------|--------|
| CSE201 | Data Structures | 3.00 |
| CSE203 | Database Management Systems | 3.00 |
| CSE305 | Operating Systems | 3.00 |

**Timetable**

| Course | Day | Time | Room |
|--------|-----|------|------|
| CSE201 | Sunday | 09:00–10:30 | CSE Lab 2 |
| CSE201 | Wednesday | 11:00–12:30 | CSE Lab 2 |
| CSE203 | Monday | 09:00–10:30 | CSE-301 |
| CSE203 | Thursday | 10:00–11:30 | CSE-301 |
| CSE305 | Tuesday | 09:00–10:30 | CSE Lab 1 |
| CSE305 | Wednesday | 09:00–10:30 | CSE Lab 1 |

**Course materials**

| Course | Material |
|--------|----------|
| CSE201 | Data Structures — Lecture Notes (Unit 1) |
| CSE201 | Assignment 1 — Sorting Algorithms |
| CSE203 | ER Diagram & Relational Model — Slides |
| CSE203 | SQL Practice Problem Set |
| CSE305 | Processes & Threads — Lecture Notes |
| CSE305 | Lab Manual — Shell Scripting |

**Announcements (created by teacher1)**

| Title | Target |
|-------|--------|
| Welcome to Database Management Systems (CSE203) | students |
| Midterm Schedule — Data Structures (CSE201) | students |
| Operating Systems (CSE305) — Lab Resources | students |

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

| Course | Semester | Session | Status |
|--------|----------|---------|--------|
| CE301 — Geotechnical Engineering (3.00 cr) | 5 | 2026 | pending |
| CSE201 — Data Structures (3.00 cr) | 5 | 2026 | approved |
| CSE203 — Database Management Systems (3.00 cr) | 5 | 2026 | approved |
| CSE305 — Operating Systems (3.00 cr) | 5 | 2026 | approved |

**Attendance (past few weeks)**

| Course | Present | Absent | Late |
|--------|---------|--------|------|
| CSE201 | 6 | 1 | 1 |
| CSE203 | 6 | 1 | 1 |
| CSE305 | 6 | 1 | 1 |

**Exam results**

| Course | Exam | Date | Marks | Grade | GP |
|--------|------|------|-------|-------|----|
| CSE201 | Mid | 2026-08-06 | 24/30 | A+ | 4.00 |
| CSE201 | Final | 2026-08-13 | 42/50 | A+ | 4.00 |
| CSE203 | Mid | 2026-08-06 | 22/30 | A- | 3.50 |
| CSE203 | Final | 2026-08-13 | 38/50 | A | 3.75 |
| CSE305 | Mid | 2026-08-06 | 18/30 | B | 3.00 |
| CSE305 | Final | 2026-08-13 | 35/50 | A- | 3.50 |

**Payments**

| Amount | Status | Method | Date |
|--------|--------|--------|------|
| 37500.00 | Paid | Mobile Banking | 2026-07-05 |
| 25000.00 | Pending | Card | 2026-08-01 |