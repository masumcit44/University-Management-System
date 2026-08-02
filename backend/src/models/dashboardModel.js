const db = require("../config/db");

const Dashboard = {

    getDashboardStats: (callback) => {

        const sql = `

        SELECT

        (SELECT COUNT(*) FROM departments) AS total_departments,

        (SELECT COUNT(*) FROM teachers) AS total_teachers,

        (SELECT COUNT(*) FROM students) AS total_students,

        (SELECT COUNT(*) FROM courses) AS total_courses,

        (SELECT COUNT(*) FROM enrollments) AS total_enrollments,

        (SELECT COUNT(*) FROM attendance) AS total_attendance,

        (SELECT AVG(grade_point) FROM results) AS average_gpa;

        `;

        db.query(sql, callback);

    }

};

module.exports = Dashboard;