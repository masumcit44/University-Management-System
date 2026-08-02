const db = require("../config/db");

const Enrollment = {

    getEnrollments: (callback) => {

        const sql = `
            SELECT
                e.enrollment_id,
                s.student_name,
                c.course_name,
                c.course_code,
                e.semester,
                e.session
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.student_id
            JOIN courses c
                ON e.course_id = c.course_id
        `;

        db.query(sql, callback);
    },

    createEnrollment: (
        student_id,
        course_id,
        semester,
        session,
        callback
    ) => {

        const sql = `
            INSERT INTO enrollments
            (student_id, course_id, semester, session)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                student_id,
                course_id,
                semester,
                session
            ],
            callback
        );
    }

};

module.exports = Enrollment;