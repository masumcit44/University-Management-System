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
                e.session,
                e.status,
                e.reviewed_at,
                ru.username AS reviewed_by_name
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.student_id
            JOIN courses c
                ON e.course_id = c.course_id
            LEFT JOIN users ru
                ON ru.user_id = e.reviewed_by
            ORDER BY e.enrollment_id DESC
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
                e.session,
                e.status,
                e.reviewed_at,
                ru.username AS reviewed_by_name
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.student_id
            JOIN courses c
                ON e.course_id = c.course_id
            LEFT JOIN users ru
                ON ru.user_id = e.reviewed_by
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
                e.session,
                e.status
            FROM enrollments e
            JOIN courses c
                ON e.course_id = c.course_id
            JOIN departments d
                ON c.department_id = d.department_id
            WHERE e.student_id = ?
        `;

        db.query(sql, [student_id], callback);
    },

    // Get Enrollments For A Teacher (scoped via teacher_courses - only
    // enrollments in courses the teacher actually teaches)
    getEnrollmentsByTeacher: (teacher_id, callback) => {

        const sql = `
            SELECT DISTINCT
                e.enrollment_id,
                e.student_id,
                e.course_id,
                s.student_name,
                c.course_name,
                c.course_code,
                e.semester,
                e.session,
                e.status,
                e.reviewed_at,
                ru.username AS reviewed_by_name
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.student_id
            JOIN courses c
                ON e.course_id = c.course_id
            JOIN teacher_courses tc
                ON tc.course_id = e.course_id
            LEFT JOIN users ru
                ON ru.user_id = e.reviewed_by
            WHERE tc.teacher_id = ?
            ORDER BY e.enrollment_id DESC
        `;

        db.query(sql, [teacher_id], callback);
    },

    // Roster: students enrolled in one course (teacher's course)
    getStudentsByCourse: (course_id, callback) => {

        const sql = `
            SELECT
                e.enrollment_id,
                e.student_id,
                e.semester,
                e.session,
                s.student_name,
                s.student_email,
                s.student_phone,
                e.status
            FROM enrollments e
            JOIN students s
                ON e.student_id = s.student_id
            WHERE e.course_id = ? AND e.status = 'approved'
            ORDER BY s.student_name
        `;

        db.query(sql, [course_id], callback);
    },

    // Raw query helper (used by controllers when a dedicated method is
    // not worth wiring up for a single scoped query).
    query: (sql, params, callback) => {
        db.query(sql, params, callback);
    },

    // Create Enrollment (admin - starts as approved via DB default)
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

    // Self-Enrollment (student - starts as pending, needs review)
    createPendingEnrollment: (
        student_id,
        course_id,
        semester,
        session,
        callback
    ) => {

        const sql = `
            INSERT INTO enrollments
            (student_id, course_id, semester, session, status)
            VALUES (?, ?, ?, ?, 'pending')
        `;

        db.query(
            sql,
            [student_id, course_id, semester, session],
            callback
        );
    },

    // Review: approve / reject a pending enrollment (stamps reviewer)
    updateEnrollmentStatus: (
        id,
        status,
        reviewerId,
        callback
    ) => {

        const sql = `
            UPDATE enrollments
            SET status = ?, reviewed_by = ?, reviewed_at = NOW()
            WHERE enrollment_id = ?
        `;

        db.query(sql, [status, reviewerId, id], callback);
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