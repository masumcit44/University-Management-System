const db = require("../config/db");

const CGPA = {

    getStudentCGPA: (student_id, callback) => {

        const sql = `

        SELECT

        s.student_name,

        AVG(r.grade_point) AS cgpa,

        COUNT(r.result_id) AS total_courses

        FROM students s

        JOIN results r

        ON s.student_id = r.student_id

        WHERE s.student_id = ?

        GROUP BY s.student_id;

        `;

        db.query(sql, [student_id], callback);

    }

};

module.exports = CGPA;