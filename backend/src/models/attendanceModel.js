const db = require("../config/db");

const Attendance = {

    // Get All Attendance
    getAttendance: (callback) => {

        const sql = `
            SELECT
                a.attendance_id,
                a.enrollment_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN enrollments en
                ON a.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
        `;

        db.query(sql, callback);
    },

    // Get Attendance By ID
    getAttendanceById: (id, callback) => {

        const sql = `
            SELECT
                a.attendance_id,
                a.enrollment_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN enrollments en
                ON a.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            WHERE a.attendance_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // =======================
    // Get Attendance By Course (all students' attendance for one course)
    // =======================
    getAttendanceByCourse: (course_id, callback) => {

        const sql = `
            SELECT
                a.attendance_id,
                a.enrollment_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN enrollments en
                ON a.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            WHERE c.course_id = ?
            ORDER BY s.student_name, a.attendance_date
        `;

        db.query(sql, [course_id], callback);
    },

    // =======================
    // Get Attendance By Student (all courses' attendance for one student)
    // =======================
    getAttendanceByStudent: (student_id, callback) => {

        const sql = `
            SELECT
                a.attendance_id,
                a.enrollment_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN enrollments en
                ON a.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            WHERE s.student_id = ?
            ORDER BY c.course_name, a.attendance_date
        `;

        db.query(sql, [student_id], callback);
    },

    // =======================
    // Get Attendance By Student Scoped To A Teacher (same as
    // getAttendanceByStudent but only courses the teacher is assigned to -
    // mirrors getAttendanceByTeacher's teacher_courses join)
    // =======================
    getAttendanceByStudentForTeacher: (student_id, teacher_id, callback) => {

        const sql = `
            SELECT DISTINCT
                a.attendance_id,
                a.enrollment_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN enrollments en
                ON a.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            JOIN teacher_courses tc
                ON tc.course_id = c.course_id
            WHERE s.student_id = ? AND tc.teacher_id = ?
            ORDER BY c.course_name, a.attendance_date
        `;

        db.query(sql, [student_id, teacher_id], callback);
    },

    // =======================
    // Get Attendance For A Teacher (scoped via teacher_courses - only
    // attendance in courses the teacher actually teaches)
    // =======================
    getAttendanceByTeacher: (teacher_id, callback) => {

        const sql = `
            SELECT DISTINCT
                a.attendance_id,
                a.enrollment_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN enrollments en
                ON a.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            JOIN teacher_courses tc
                ON tc.course_id = c.course_id
            WHERE tc.teacher_id = ?
            ORDER BY a.attendance_date DESC
        `;

        db.query(sql, [teacher_id], callback);
    },

    // Check whether an attendance record already exists for an enrollment
    // on a given date (duplicate-guard; also backed by a UNIQUE constraint)
    getByEnrollmentAndDate: (enrollment_id, attendance_date, callback) => {

        const sql = `
            SELECT attendance_id
            FROM attendance
            WHERE enrollment_id = ? AND attendance_date = ?
        `;

        db.query(sql, [enrollment_id, attendance_date], callback);

    },

    // Create Attendance
    createAttendance: (
        enrollment_id,
        attendance_date,
        status,
        callback
    ) => {

        const sql = `
            INSERT INTO attendance
            (enrollment_id, attendance_date, status)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            [enrollment_id, attendance_date, status],
            callback
        );

    },

    // Update Attendance
    updateAttendance: (
        id,
        enrollment_id,
        attendance_date,
        status,
        callback
    ) => {

        const sql = `
            UPDATE attendance
            SET enrollment_id = ?, attendance_date = ?, status = ?
            WHERE attendance_id = ?
        `;

        db.query(
            sql,
            [enrollment_id, attendance_date, status, id],
            callback
        );

    },

    // Delete Attendance
    deleteAttendance: (id, callback) => {
        const sql = "DELETE FROM attendance WHERE attendance_id = ?";
        db.query(sql, [id], callback);
    }

};

module.exports = Attendance;