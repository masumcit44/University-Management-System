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
                c.semester,
                c.department_id,
                d.department_name
            FROM courses c
            JOIN departments d
            ON c.department_id = d.department_id
        `;

        db.query(sql, callback);
    },

    // GET Course By ID
    getCourseById: (id, callback) => {

        const sql = `
            SELECT
                c.course_id,
                c.course_name,
                c.course_code,
                c.credit,
                c.semester,
                c.department_id,
                d.department_name
            FROM courses c
            JOIN departments d
            ON c.department_id = d.department_id
            WHERE c.course_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // CREATE Course
    createCourse: (
        course_name,
        course_code,
        credit,
        semester,
        department_id,
        callback
    ) => {

        const sql = `
            INSERT INTO courses
            (course_name, course_code, credit, semester, department_id)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [course_name, course_code, credit, semester, department_id],
            callback
        );
    },

    // UPDATE Course
    updateCourse: (
        id,
        course_name,
        course_code,
        credit,
        semester,
        department_id,
        callback
    ) => {

        const sql = `
            UPDATE courses
            SET course_name = ?, course_code = ?, credit = ?, semester = ?, department_id = ?
            WHERE course_id = ?
        `;

        db.query(
            sql,
            [course_name, course_code, credit, semester, department_id, id],
            callback
        );
    },

    // DELETE Course
    deleteCourse: (id, callback) => {
        const sql = "DELETE FROM courses WHERE course_id = ?";
        db.query(sql, [id], callback);
    }

};

module.exports = Course;