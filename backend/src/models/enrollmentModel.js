const db = require("../config/db");

const Enrollment = {

    // Get All Enrollments
    getEnrollments: (callback) => {

        const sql = `
            SELECT
                e.enrollment_id,
                e.student_id,
                e.course_id,
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

    // Get Enrollment By ID
    getEnrollmentById: (id, callback) => {

        const sql = `
            SELECT
                e.enrollment_id,
                e.student_id,
                e.course_id,
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
            WHERE e.enrollment_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // Get Enrollments By Student (used by "My Courses" for the student role -
    // shaped exactly like courseModel.getCourses so the frontend can reuse
    // the same course grouping/rendering logic for both)
    getEnrollmentsByStudent: (student_id, callback) => {

        const sql = `
            SELECT
                e.enrollment_id,
                c.course_id,
                c.course_name,
                c.course_code,
                c.credit,
                c.semester,
                c.department_id,
                d.department_name,
                e.session
            FROM enrollments e
            JOIN courses c
                ON e.course_id = c.course_id
            JOIN departments d
                ON c.department_id = d.department_id
            WHERE e.student_id = ?
        `;

        db.query(sql, [student_id], callback);
    },

    // Create Enrollment
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
            [student_id, course_id, semester, session],
            callback
        );
    },

    // Update Enrollment
    updateEnrollment: (
        id,
        student_id,
        course_id,
        semester,
        session,
        callback
    ) => {

        const sql = `
            UPDATE enrollments
            SET student_id = ?, course_id = ?, semester = ?, session = ?
            WHERE enrollment_id = ?
        `;

        db.query(
            sql,
            [student_id, course_id, semester, session, id],
            callback
        );
    },

    // Delete Enrollment
    deleteEnrollment: (id, callback) => {
        const sql = "DELETE FROM enrollments WHERE enrollment_id = ?";
        db.query(sql, [id], callback);
    }

};

module.exports = Enrollment;