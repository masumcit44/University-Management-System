const db = require("../config/db");

const CGPA = {

    // =======================
    // Credit-weighted CGPA
    //
    // A course's grade comes from its Final exam only, so quizzes,
    // assignments and mids do not each count as a separate course.
    // CGPA = SUM(grade_point * credit) / SUM(credit)
    // =======================
    getStudentCGPA: (student_id, callback) => {

        const sql = `

        SELECT

        s.student_name,

        ROUND(
            SUM(r.grade_point * c.credit) / SUM(c.credit),
            2
        ) AS cgpa,

        COUNT(DISTINCT c.course_id) AS total_courses,

        SUM(c.credit) AS total_credits

        FROM students s

        JOIN enrollments en
        ON s.student_id = en.student_id

        JOIN courses c
        ON en.course_id = c.course_id

        JOIN results r
        ON en.enrollment_id = r.enrollment_id

        JOIN exams ex
        ON r.exam_id = ex.exam_id

        WHERE s.student_id = ?
        AND ex.exam_type = 'Final'

        GROUP BY s.student_id;

        `;

        db.query(sql, [student_id], callback);

    },

    // =======================
    // Per-course breakdown behind the CGPA (used by Reports)
    // =======================
    getStudentCourseGrades: (student_id, callback) => {

        const sql = `

        SELECT

        c.course_id,
        c.course_name,
        c.course_code,
        c.credit,

        r.marks_obtained,
        ex.total_marks,
        r.grade_letter,
        r.grade_point

        FROM enrollments en

        JOIN courses c
        ON en.course_id = c.course_id

        JOIN results r
        ON en.enrollment_id = r.enrollment_id

        JOIN exams ex
        ON r.exam_id = ex.exam_id

        WHERE en.student_id = ?
        AND ex.exam_type = 'Final'

        ORDER BY c.semester ASC, c.course_code ASC;

        `;

        db.query(sql, [student_id], callback);

    }

};

module.exports = CGPA;
