const db = require("../config/db");

const Prediction = {

    // =======================
    // Basic student profile used as the header of a prediction report
    // =======================
    getStudentProfile: (student_id, callback) => {

        const sql = `

        SELECT

        s.student_id,
        s.student_name,
        s.student_email,

        d.department_name

        FROM students s

        JOIN departments d
        ON s.department_id = d.department_id

        WHERE s.student_id = ?;

        `;

        db.query(sql, [student_id], callback);

    },

    // =======================
    // Per course assessment performance
    //
    // Mid, Quiz and Assignment are treated as continuous assessment and
    // are summed as raw marks so that a 100 mark Mid weighs more than a
    // 10 mark Quiz. The Final exam is kept separate because once it
    // exists the course no longer needs to be predicted.
    // =======================
    getCoursePerformance: (student_id, callback) => {

        const sql = `

        SELECT

        en.enrollment_id,
        en.semester,
        en.session,

        c.course_id,
        c.course_code,
        c.course_name,
        c.credit,

        SUM(
            CASE WHEN ex.exam_type <> 'Final'
            THEN r.marks_obtained ELSE 0 END
        ) AS assessment_marks_obtained,

        SUM(
            CASE WHEN ex.exam_type <> 'Final'
            THEN ex.total_marks ELSE 0 END
        ) AS assessment_total_marks,

        SUM(
            CASE WHEN ex.exam_type <> 'Final'
            THEN 1 ELSE 0 END
        ) AS assessment_count,

        MAX(
            CASE WHEN ex.exam_type = 'Final'
            THEN r.marks_obtained END
        ) AS final_marks_obtained,

        MAX(
            CASE WHEN ex.exam_type = 'Final'
            THEN ex.total_marks END
        ) AS final_total_marks,

        MAX(
            CASE WHEN ex.exam_type = 'Final'
            THEN r.grade_letter END
        ) AS final_grade_letter,

        MAX(
            CASE WHEN ex.exam_type = 'Final'
            THEN r.grade_point END
        ) AS final_grade_point

        FROM enrollments en

        JOIN courses c
        ON en.course_id = c.course_id

        LEFT JOIN results r
        ON r.enrollment_id = en.enrollment_id

        LEFT JOIN exams ex
        ON r.exam_id = ex.exam_id

        WHERE en.student_id = ?

        GROUP BY
        en.enrollment_id,
        en.semester,
        en.session,
        c.course_id,
        c.course_code,
        c.course_name,
        c.credit

        ORDER BY en.semester ASC, c.course_code ASC;

        `;

        db.query(sql, [student_id], callback);

    },

    // =======================
    // Per enrollment attendance counters
    //
    // Late is later counted as a half presence by the service layer.
    // =======================
    getAttendanceSummary: (student_id, callback) => {

        const sql = `

        SELECT

        en.enrollment_id,

        COUNT(a.attendance_id) AS total_classes,

        SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 'Late' THEN 1 ELSE 0 END) AS late_count,
        SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS absent_count

        FROM enrollments en

        LEFT JOIN attendance a
        ON a.enrollment_id = en.enrollment_id

        WHERE en.student_id = ?

        GROUP BY en.enrollment_id;

        `;

        db.query(sql, [student_id], callback);

    },

    // =======================
    // Cohort level overview used by the at risk table
    //
    // One aggregated row per student so the teacher can spot weak
    // students without opening every report one by one.
    // =======================
    getCohortPerformance: (callback) => {

        const sql = `

        SELECT

        s.student_id,
        s.student_name,

        d.department_name,

        COUNT(DISTINCT en.enrollment_id) AS total_enrollments,

        (
            SELECT COUNT(*)
            FROM attendance a
            JOIN enrollments ae ON a.enrollment_id = ae.enrollment_id
            WHERE ae.student_id = s.student_id
        ) AS total_classes,

        (
            SELECT
            SUM(CASE WHEN a.status = 'Present' THEN 1
                     WHEN a.status = 'Late' THEN 0.5
                     ELSE 0 END)
            FROM attendance a
            JOIN enrollments ae ON a.enrollment_id = ae.enrollment_id
            WHERE ae.student_id = s.student_id
        ) AS weighted_present,

        (
            SELECT SUM(r.marks_obtained)
            FROM results r
            JOIN enrollments re ON r.enrollment_id = re.enrollment_id
            JOIN exams ex ON r.exam_id = ex.exam_id
            WHERE re.student_id = s.student_id
            AND ex.exam_type <> 'Final'
        ) AS assessment_marks_obtained,

        (
            SELECT SUM(ex.total_marks)
            FROM results r
            JOIN enrollments re ON r.enrollment_id = re.enrollment_id
            JOIN exams ex ON r.exam_id = ex.exam_id
            WHERE re.student_id = s.student_id
            AND ex.exam_type <> 'Final'
        ) AS assessment_total_marks

        FROM students s

        JOIN departments d
        ON s.department_id = d.department_id

        LEFT JOIN enrollments en
        ON en.student_id = s.student_id

        GROUP BY
        s.student_id,
        s.student_name,
        d.department_name

        HAVING total_enrollments > 0

        ORDER BY s.student_name ASC;

        `;

        db.query(sql, callback);

    }

};

module.exports = Prediction;