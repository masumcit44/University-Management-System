const db = require("../config/db");

const Exam = {

    // GET All Exams
    getExams: (callback) => {

        const sql = `
            SELECT
                e.exam_id,
                e.exam_type,
                e.exam_date,
                e.total_marks,
                c.course_id,
                c.course_name,
                c.course_code
            FROM exams e
            JOIN courses c
            ON e.course_id = c.course_id
        `;

        db.query(sql, callback);
    },

    // =======================
    // Get Exams For A Teacher (scoped via teacher_courses - only exams
    // for courses the teacher actually teaches)
    // =======================
    getExamsByTeacher: (teacher_id, callback) => {

        const sql = `
            SELECT DISTINCT
                e.exam_id,
                e.exam_type,
                e.exam_date,
                e.total_marks,
                c.course_id,
                c.course_name,
                c.course_code
            FROM exams e
            JOIN courses c
            ON e.course_id = c.course_id
            JOIN teacher_courses tc
            ON tc.course_id = c.course_id
            WHERE tc.teacher_id = ?
            ORDER BY e.exam_date
        `;

        db.query(sql, [teacher_id], callback);
    },

    // =======================
    // Get Exams For A Student (scoped via approved enrollments - only exams
    // for courses the student is actually enrolled in)
    // =======================
    getExamsByStudent: (student_id, callback) => {

        const sql = `
            SELECT
                e.exam_id,
                e.exam_type,
                e.exam_date,
                e.total_marks,
                c.course_id,
                c.course_name,
                c.course_code
            FROM exams e
            JOIN courses c
                ON e.course_id = c.course_id
            JOIN enrollments en
                ON en.course_id = c.course_id
            WHERE en.student_id = ? AND en.status = 'approved'
            ORDER BY e.exam_date
        `;

        db.query(sql, [student_id], callback);
    },

    // =======================
    // Get Exam By ID
    // =======================
    getExamById: (id, callback) => {

        const sql = `
            SELECT
                e.exam_id,
                e.exam_type,
                e.exam_date,
                e.total_marks,
                c.course_id,
                c.course_name,
                c.course_code
            FROM exams e
            JOIN courses c
            ON e.course_id = c.course_id
            WHERE e.exam_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // =======================
    // Whether a student has an approved enrollment in a course
    // =======================
    isApprovedEnrolled: (student_id, course_id, callback) => {

        const sql = `
            SELECT enrollment_id
            FROM enrollments
            WHERE student_id = ? AND course_id = ? AND status = 'approved'
        `;

        db.query(sql, [student_id, course_id], callback);
    },

    // CREATE Exam
    createExam: (
        course_id,
        exam_type,
        exam_date,
        total_marks,
        callback
    ) => {

        const sql = `
            INSERT INTO exams
            (course_id, exam_type, exam_date, total_marks)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                course_id,
                exam_type,
                exam_date,
                total_marks
            ],
            callback
        );
    },

    // =======================
    // Update Exam
    // =======================
    updateExam: (
        id,
        course_id,
        exam_type,
        exam_date,
        total_marks,
        callback
    ) => {

        const sql = `
            UPDATE exams
            SET course_id = ?, exam_type = ?, exam_date = ?, total_marks = ?
            WHERE exam_id = ?
        `;

        db.query(
            sql,
            [
                course_id,
                exam_type,
                exam_date,
                total_marks,
                id
            ],
            callback
        );

    },

    // =======================
    // Delete Exam
    // =======================
    deleteExam: (
        id,
        callback
    ) => {

        const sql =
            "DELETE FROM exams WHERE exam_id = ?";

        db.query(sql, [id], callback);

    }

};

module.exports = Exam;