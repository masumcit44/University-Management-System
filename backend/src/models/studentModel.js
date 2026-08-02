const db = require("../config/db");

const Student = {

    // Get All Students
    getAllStudents: (callback) => {
        const sql = `
            SELECT
                students.student_id,
                students.student_name,
                students.student_email,
                students.student_phone,
                students.semester,
                departments.department_name
            FROM students
            JOIN departments
            ON students.department_id = departments.department_id
        `;

        db.query(sql, callback);
    },

    // Create Student
    createStudent: (
        student_name,
        student_email,
        student_phone,
        department_id,
        semester,
        callback
    ) => {

        const sql = `
            INSERT INTO students
            (student_name, student_email, student_phone, department_id, semester)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                student_name,
                student_email,
                student_phone,
                department_id,
                semester
            ],
            callback
        );
    }

};

module.exports = Student;