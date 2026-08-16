const db = require("../config/db");

const Result = {

    // GET All Results
    getResults: (callback) => {

        const sql = `
            SELECT
                r.result_id,
                r.enrollment_id,
                r.exam_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                ex.exam_type,
                ex.total_marks,
                r.marks_obtained,
                r.grade_letter,
                r.grade_point
            FROM results r
            JOIN enrollments en
                ON r.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            JOIN exams ex
                ON r.exam_id = ex.exam_id
        `;

        db.query(sql, callback);
    },

    // =======================
    // Get Results For A Teacher (scoped via teacher_courses - only results
    // in courses the teacher actually teaches)
    // =======================
    getResultsByTeacher: (teacher_id, callback) => {

        const sql = `
            SELECT DISTINCT
                r.result_id,
                r.enrollment_id,
                r.exam_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                ex.exam_type,
                ex.total_marks,
                r.marks_obtained,
                r.grade_letter,
                r.grade_point
            FROM results r
            JOIN enrollments en
                ON r.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            JOIN exams ex
                ON r.exam_id = ex.exam_id
            JOIN teacher_courses tc
                ON tc.course_id = c.course_id
            WHERE tc.teacher_id = ?
            ORDER BY r.result_id DESC
        `;

        db.query(sql, [teacher_id], callback);
    },

    // =======================
    // Get Results For A Student (all results across their enrolled courses)
    // =======================
    getResultsByStudent: (student_id, callback) => {

        const sql = `
            SELECT
                r.result_id,
                r.enrollment_id,
                r.exam_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                ex.exam_type,
                ex.total_marks,
                r.marks_obtained,
                r.grade_letter,
                r.grade_point
            FROM results r
            JOIN enrollments en
                ON r.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            JOIN exams ex
                ON r.exam_id = ex.exam_id
            WHERE en.student_id = ?
            ORDER BY r.result_id DESC
        `;

        db.query(sql, [student_id], callback);
    },

    // =======================
    // Get Result By ID
    // =======================
    getResultById: (id, callback) => {

        const sql = `
            SELECT
                r.result_id,
                r.enrollment_id,
                r.exam_id,
                en.student_id,
                s.student_name,
                c.course_id,
                c.course_name,
                c.course_code,
                ex.exam_type,
                ex.total_marks,
                r.marks_obtained,
                r.grade_letter,
                r.grade_point
            FROM results r
            JOIN enrollments en
                ON r.enrollment_id = en.enrollment_id
            JOIN students s
                ON en.student_id = s.student_id
            JOIN courses c
                ON en.course_id = c.course_id
            JOIN exams ex
                ON r.exam_id = ex.exam_id
            WHERE r.result_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // CREATE Result
    createResult: (

        enrollment_id,
        exam_id,

        marks_obtained,
        grade_letter,
        grade_point,

        callback

    ) => {

        const sql = `
            INSERT INTO results
            (
                enrollment_id,
                exam_id,
                marks_obtained,
                grade_letter,
                grade_point
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                enrollment_id,
                exam_id,
                marks_obtained,
                grade_letter,
                grade_point
            ],
            callback
        );

    },

    // =======================
    // Update Result
    // =======================
    updateResult: (

        id,

        enrollment_id,
        exam_id,

        marks_obtained,
        grade_letter,
        grade_point,

        callback

    ) => {

        const sql = `
            UPDATE results
            SET
                enrollment_id = ?,
                exam_id = ?,
                marks_obtained = ?,
                grade_letter = ?,
                grade_point = ?
            WHERE result_id = ?
        `;

        db.query(
            sql,
            [
                enrollment_id,
                exam_id,
                marks_obtained,
                grade_letter,
                grade_point,
                id
            ],
            callback
        );

    },

    // =======================
    // Delete Result
    // =======================
    deleteResult: (
        id,
        callback
    ) => {

        const sql =
            "DELETE FROM results WHERE result_id = ?";

        db.query(sql, [id], callback);

    },

    // =======================
    // Get Exam By ID (for total_marks lookup during create)
    // =======================
    getExamTotalMarks: (exam_id, callback) => {

        const sql = `
            SELECT total_marks, course_id
            FROM exams
            WHERE exam_id = ?
        `;

        db.query(sql, [exam_id], callback);

    },

    // =======================
    // Get Enrollment (for create/update checks - verifies the enrollment
    // belongs to the same course as the exam and is approved)
    // =======================
    getEnrollmentForResult: (enrollment_id, callback) => {

        const sql = `
            SELECT course_id, status
            FROM enrollments
            WHERE enrollment_id = ?
        `;

        db.query(sql, [enrollment_id], callback);

    },

    // =======================
    // Check for an existing result on the same enrollment + exam
    // (duplicate-guard; also backed by the uq_result UNIQUE constraint)
    // =======================
    getByEnrollmentAndExam: (enrollment_id, exam_id, callback) => {

        const sql = `
            SELECT result_id
            FROM results
            WHERE enrollment_id = ? AND exam_id = ?
        `;

        db.query(sql, [enrollment_id, exam_id], callback);

    }

};

module.exports = Result;