# Role-Based Functionality Audit

> Phase 1 — Diagnosis (no code changed). Tested against the live local backend (Node + MySQL dump restored).
> Method: ~40 GET probes × 3 roles + 51 write/permission-flow tests. All test records created were deleted afterward (verified 0 leftovers).

**Overall: SYSTEM HEALTHY.** Every page loads real data for every role. All 51 write flows PASS. All permission blocks (403) PASS. No 500s, no crashes.

---

## Phase 2 — Fixes Applied (frontend + backend + database, user-approved)

> Re-audited student, teacher, and admin roles (Aug 2026). All listed issues fixed and verified against the live API. Frontend `npm run build` passes.

| # | Role | Issue | Fix |
|---|------|-------|-----|
| S1 | Student | **Payments page crashed** — `getPaymentsByStudent` never returned `student_name`, but the page called `p.student_name.toLowerCase()` → TypeError blanked the app | Backend JOIN + null-safe frontend filter (`Payments.jsx`, `paymentModel.js`) — verified live |
| S2 | Student | Results fragment `<>` missing key (React warning) | `<Fragment key={…}>` (`Results.jsx`) |
| S3 | Student | Exam course dropdown empty when student has zero exams | Dropdown from approved enrollments (`Exam.jsx`) |
| S4 | Student | Enroll double-click → duplicate submits | `enrollSubmitting` guard (`Courses.jsx`) |
| S5 | Student | No linked profile → dead-end "type an ID" | Clear "contact administration" message (`Attendance.jsx`) |
| T1 | Teacher | Duplicate rows when a course has 2+ teachers | `DISTINCT` in all 6 teacher-scoped queries (attendance ×2, enrollment, exam, result, controller) |
| T2 | Teacher | Duplicate attendance allowed | Controller guard + migration `002_attendance_uniqueness.sql` (UNIQUE `enrollment_id, attendance_date`); applied to DB, `ER_DUP_ENTRY` confirmed |
| T3 | Teacher | No future-date validation | Attendance rejects future dates (create + update) |
| T4 | Teacher | Duplicate result POST → 500 | Clean 400 "A result already exists" |
| A1 | Admin | Result recordable under mismatched course | Enrollment↔exam course match + approved status required (`resultController.js`) — verified live |
| A2 | Admin | Attendance markable for pending/rejected enrollments | Blocked (create + update) — verified live |
| A4 | Admin | Reports per-course GPA mixed all exam types | Final-only (matches CGPA tile), label → "Final GPA" (`Reports.jsx`) |
| A5 | Admin | Payments `toLocaleDateString()` timezone drift | Shared `toDateInput()` (`Payments.jsx`) |
| A7 | Admin | Semester map counted pending/rejected enrollments | Approved-only (`Students.jsx`) |
| A8 | Admin | No email/phone validation | Format regex in `Students.jsx` |
| A9 | Admin | Invalid sort comparators (no 0 return) | `distinctDates`/`sortByDateAsc` fixed (`Attendance.jsx`) |
| A10 | Admin | Semesters sorted lexicographically (`"10"` < `"2"`) | Numeric-aware `joinDistinct` (`Enrollment.jsx`) |
| A11 | Admin | Own-role select editable in AdminPanel | Disabled + styled (`AdminPanel.jsx`) |
| A12 | Admin | Zero/negative amount & marks accepted | Backend + frontend validation (payments/exams) — verified live |
| M1 | Student | `getExamById` not ownership-scoped (any authenticated role could fetch any exam) | `examModel.isApprovedEnrolled` check |
| M9 | Teacher | Teacher enrollment query omitted `status` | `e.status` added |

**Intentionally unchanged (documented design decisions):** A3 (Results "overall" any-F rule vs Final-only CGPA), A6 (Late not counted in attendance %), M2 (`GET /timetable/course/:id` open to all roles, unused by frontend), T5 (teacher sees full student directory).

**Deployment note:** for existing databases run `backend/src/database/migrations/002_attendance_uniqueness.sql` once (idempotent). Fresh installs get the UNIQUE constraint from `schema.sql` automatically.

---

## Admin Role — status: PASS (no blocking issues)

All pages load real data and every write works:

| Area | Result |
|------|--------|
| Dashboard (5 stats) / Students (93) / Teachers (17) / Departments (12) / Courses (34) | OK |
| Enrollment (413) / Attendance (4943) / Exams (136) / Results (1648) / Timetable (64) | OK |
| CGPA / Reports / Prediction (92) / Admin Panel (115 users) / Payments (273) | OK |
| CRUD: department, course, student, enrollment, payment, timetable, teacher-course | All PASS (create → update → delete) |
| Workflows: enrollment review (approve), user role change, password reset, user delete | All PASS |
| Auth: change-password (self + wrong-current reject + admin reset + re-login) | PASS |

Notes (not bugs):
- `GET /departments/1` → 404 is **correct**: no department_id=1 exists (IDs start at 2). Department list page unaffected.

---

## Teacher Role — status: PASS (3 findings below)

Now shows real data: 1 assigned course (TE101), 20 course-13 enrollments, own timetable (2 rows).

| Area | Result |
|------|--------|
| Students (93) / Courses (34) / Enrollment (20, course-scoped) | OK |
| Attendance (240, course 13) — mark/update/delete verified | PASS |
| Exams (4) — create/update/delete verified | PASS |
| Results (80) — create/update/delete verified | PASS |
| Timetable (own, read-only) / Prediction / Password change | OK |
| Enrollment approve/reject on own course | PASS |
| Permission checks: POST /courses, /students, /teacher-courses, /timetable, DELETE /students → all 403 | PASS |

### Findings
1. **[Frontend gating] Students page shows "Add Student" + Edit/Delete buttons to teachers** (`Students.jsx`) — clicking them hits the backend's correct 403. Should be hidden for non-admin (Enrollment/Exam pages already do this correctly).
2. **[Frontend gating] Courses page shows "Add Course" + edit/delete to teachers** (`Courses.jsx`, only has `isStudent` gating) — same 403-on-click issue.
3. **[Backend scoping] Teacher can read ANY student's full attendance across ALL courses** — `attendanceController.getAttendanceByStudent` (attendanceController.js:150) only blocks a *student* viewing another student; a teacher searching a student sees that student's attendance in every course, including courses taught by other teachers.

Note: `GET /results/student/:id` is admin+student only — a teacher gets 403 there, but the teacher Results page works around it by filtering the scoped `/results` list client-side (no user impact).

---

## Student Role — status: done

- Test account used: `hasan.cse1@gmail.com` / `Student123` (username `qa_student_test`, user_id 171, linked to student_id 3 "Md. Rakibul Hasan"). Registered via the app's own `POST /api/auth/register` → 201 (email matched the students record); no direct SQL insert.
- Dashboard (`/student-dashboard`): OK — GET `/api/timetable/student/3` → 200 (empty, no classes), GET `/api/cgpa/3` → 200 (CGPA 3.13, 2 courses, 6.00 credits). Own data only.
- Courses (`/courses`, "My Courses"): OK — GET `/api/enrollments/student/3` → 200 (own enrollments only: CSE301 + CSE401, both approved), plus `/api/departments` and `/api/courses` catalog for the picker. Self-enroll flow: POST `/api/enrollments/enroll` `{course_id: 9, session: "2025"}` → **201** "Enrollment submitted. Awaiting approval." New enrollment (enrollment_id 658, CE101) shows status **pending**. No 500.
- Attendance (`/attendance`, "My Attendance"): OK — GET `/api/attendance/student/3` → 200, every row student_id 3 / "Md. Rakibul Hasan".
- Exams (`/exams`, "My Exams"): OK — GET `/api/exams` → 200, 8 exams, all for courses 3 & 4 (the student's enrolled courses).
- Results (`/results`, "My Results"): OK — GET `/api/results/student/3` → 200, own results only.
- CGPA (`/cgpa`): OK — GET `/api/cgpa/3` → 200, own data only.
- Timetable (`/timetable`): OK — GET `/api/timetable/student/3` → 200 (empty → "No classes scheduled yet" empty state renders, no blank screen).
- Payments (`/payments`, "My Payments"): OK — GET `/api/payments/student/3` → 200, own payment history only.
- Own-data enforcement: PASS — trying other students' IDs as this student → 403 everywhere: `/cgpa/2`, `/results/student/2`, `/attendance/student/2`, `/timetable/student/2`, `/payments/student/2`, `/enrollments/student/2` ("Access Forbidden. You can only view your own …").
- Blocked pages: PASS (double-protected). Frontend: `ProtectedRoute` redirects a student to `/student-dashboard` when typing `/prediction`, `/admin-panel`, `/reports`, `/teachers`, `/departments`, `/teacher-courses` directly (page never renders). Backend: as student, GET `/api/predictions`, `/api/users`, `/api/results`, `/api/teachers`, `/api/teacher-courses`, `/api/students`, `/api/dashboard`, `/api/enrollments`, `/api/attendance` → all 403 "Access Forbidden".
- No blank screens, no 500s, no unexpected console errors on any of the 8 pages.
- Risk / note: GET `/api/exams` is **not** ownership-scoped — the route allows any authenticated role and returns every course's exams (the Exam page comment claims "backend-scoped", but there is no student filter in the route/controller). It happens to be safe today only because the seed data contains exams solely for courses 3 & 4 (this student's courses). If exams are added for other courses, students would see all courses' exams.
- Method note: tested via the live API at `localhost:5000/api` — the same requests the browser UI fires (no browser automation available). The single row written (pending enrollment 658) was created through the app's own enroll endpoint, as required.

---

## Consolidated Fix Queue

### High priority (user-visible)
1. [x] **Dates render one day early across the app.** Root cause: backend `db.js` uses default mysql2 options (no `dateStrings`), so DATE columns return as UTC-serialized JS Dates; the server is UTC+6, so a stored `2025-01-18` comes back as `2025-01-17T18:00:00.000Z` and the frontend helper `toDateInput = (v) => String(v).split("T")[0]` renders `2025-01-17`.
    - Affected: Attendance dates (list, date-grouping, search), Exam dates (display + **edit pre-fills the shifted date, so each save moves the exam back one day**), Students DOB/Admission date, Teachers DOB, Reports.
    - NOT affected: Payments (uses `new Date(...).toLocaleDateString()`).
    - Fix options: backend `dateStrings: true` in `db.js` (needs approval — backend change), or frontend parse via local date (`new Date(v)` → `en-CA`) across all `toDateInput` helpers.
    - DONE (frontend route): new shared `frontend/src/services/date.js` (`toDateInput` + `todayInputValue`); wired into Attendance, Exam, Students, Teachers; Attendance mark-date default now local today.

### Frontend only (approved scope — can fix next)
2. [x] `Students.jsx`: hide "Add Student" + RowActions (Edit/Delete) unless `role === "admin"` (mirror Enrollment page). DONE — added `isAdmin`; PageHeader action + RowActions now admin-only.
3. [x] `Courses.jsx`: hide "Add Course" + edit/delete actions unless admin. DONE — added `isAdmin`; PageHeader action + card RowActions now admin-only.

### Backend (needs approval before touching)
4. [x] Scope `GET /attendance/student/:id` to the teacher's assigned courses (currently any teacher can read any student's full attendance across all courses). DONE — teacher branch uses course-scoped `getAttendanceByStudentForTeacher` (see T1). Note: the original phase-1 finding is superseded; teacher access is now scoped via the controller.
5. [ ] Validate enum values before insert (exam_type, attendance status, payment status/method). MySQL non-strict `sql_mode` silently coerces invalid values to `''` while the API still returns 201 "Created Successfully" — the API reports success for data it didn't actually store. (No current UI impact: forms use correct dropdowns.)

### Verified non-issues
- Department ID 1 absent → 404 is data, not a bug.
- Exam/Attendance forms are dropdowns matching the ENUM values — safe today.
