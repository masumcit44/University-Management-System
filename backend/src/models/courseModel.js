const db = require("../config/db");

const Course = {

    // GET All Courses
    getCourses: (callback) => {

        const sql = `
            SELECT
                c.course_id,
                c.course_name,
                c.course_code,
                c.credit,
                d.department_name
            FROM courses c
            JOIN departments d
            ON c.department_id = d.department_id
        `;

        db.query(sql, callback);
    },

    // CREATE Course
    createCourse: (
        course_name,
        course_code,
        credit,
        department_id,
        callback
    ) => {

        const sql = `
            INSERT INTO courses
            (course_name, course_code, credit, department_id)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                course_name,
                course_code,
                credit,
                department_id
            ],
            callback
        );
    }

};

module.exports = Course;