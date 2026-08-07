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