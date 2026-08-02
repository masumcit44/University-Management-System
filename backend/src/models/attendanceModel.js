const db = require("../config/db");

const Attendance = {

    getAttendance: (callback) => {

        const sql = `
            SELECT
                a.attendance_id,
                s.student_name,
                c.course_name,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN students s
                ON a.student_id = s.student_id
            JOIN courses c
                ON a.course_id = c.course_id
        `;

        db.query(sql, callback);
    },

    createAttendance: (
        student_id,
        course_id,
        attendance_date,
        status,
        callback
    ) => {

        const sql = `
            INSERT INTO attendance
            (student_id, course_id, attendance_date, status)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                student_id,
                course_id,
                attendance_date,
                status
            ],
            callback
        );

    }

};

module.exports = Attendance;