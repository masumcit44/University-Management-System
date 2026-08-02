const db = require("../config/db");

const Result = {

    // GET All Results
    getResults: (callback) => {

        const sql = `
            SELECT
                r.result_id,
                s.student_name,
                c.course_name,
                r.mid_marks,
                r.assignment_marks,
                r.quiz_marks,
                r.final_marks,
                r.total_marks,
                r.grade,
                r.grade_point
            FROM results r
            JOIN students s
                ON r.student_id = s.student_id
            JOIN courses c
                ON r.course_id = c.course_id
        `;

        db.query(sql, callback);
    },

    // CREATE Result
    createResult: (
        student_id,
        course_id,
        mid_marks,
        assignment_marks,
        quiz_marks,
        final_marks,
        total_marks,
        grade,
        grade_point,
        callback
    ) => {

        const sql = `
            INSERT INTO results
            (
                student_id,
                course_id,
                mid_marks,
                assignment_marks,
                quiz_marks,
                final_marks,
                total_marks,
                grade,
                grade_point
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                student_id,
                course_id,
                mid_marks,
                assignment_marks,
                quiz_marks,
                final_marks,
                total_marks,
                grade,
                grade_point
            ],
            callback
        );

    }

};

module.exports = Result;