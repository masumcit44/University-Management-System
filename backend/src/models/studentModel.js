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
                students.gender,
                students.address,
                students.dob,
                students.admission_date,
                students.department_id,
                departments.department_name
            FROM students
            JOIN departments
            ON students.department_id = departments.department_id
        `;

        db.query(sql, callback);
    },

    // =======================
    // Get Student By ID
    // =======================
    getStudentById: (id, callback) => {
        const sql = `
            SELECT
                students.student_id,
                students.student_name,
                students.student_email,
                students.student_phone,
                students.gender,
                students.address,
                students.dob,
                students.admission_date,
                students.department_id,
                departments.department_name
            FROM students
            JOIN departments
            ON students.department_id = departments.department_id
            WHERE students.student_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // Create Student
    createStudent: (
        student_name,
        student_email,
        student_phone,
        department_id,
        gender,
        address,
        dob,
        admission_date,
        callback
    ) => {

        const sql = `
            INSERT INTO students
            (student_name, student_email, student_phone, department_id, gender, address, dob, admission_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                student_name,
                student_email,
                student_phone,
                department_id,
                gender,
                address,
                dob,
                admission_date
            ],
            callback
        );
    },

    // =======================
    // Update Student
    // =======================
    updateStudent: (
        id,
        student_name,
        student_email,
        student_phone,
        department_id,
        gender,
        address,
        dob,
        admission_date,
        callback
    ) => {

        const sql = `
            UPDATE students
            SET student_name = ?, student_email = ?, student_phone = ?, department_id = ?, gender = ?, address = ?, dob = ?, admission_date = ?
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [
                student_name,
                student_email,
                student_phone,
                department_id,
                gender,
                address,
                dob,
                admission_date,
                id
            ],
            callback
        );

    },

    // =======================
    // Delete Student
    // =======================
    deleteStudent: (
        id,
        callback
    ) => {

        const sql =
            "DELETE FROM students WHERE student_id = ?";

        db.query(sql, [id], callback);

    },

    // =======================
    // Find Student By Email (used to link a login account)
    // =======================
    findStudentByEmail: (email, callback) => {

        const sql = `
            SELECT student_id, student_email
            FROM students
            WHERE student_email = ?
        `;

        db.query(sql, [email], callback);
    },

    // =======================
    // Link a User Account to a Student Record
    // =======================
    linkUserToStudent: (student_id, user_id, callback) => {

        const sql = `
            UPDATE students
            SET user_id = ?
            WHERE student_id = ?
        `;

        db.query(sql, [user_id, student_id], callback);
    },

    // =======================
    // Find Student By User ID (used at login to embed student_id in JWT)
    // =======================
    findStudentByUserId: (user_id, callback) => {

        const sql = `
            SELECT student_id
            FROM students
            WHERE user_id = ?
        `;

        db.query(sql, [user_id], callback);
    }

};

module.exports = Student;