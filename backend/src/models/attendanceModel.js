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
                c.course_name,
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
                c.course_name,
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