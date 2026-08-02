const Student = require("../models/studentModel");

// GET All Students
exports.getStudents = (req, res) => {
    Student.getAllStudents((err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });

    });
};

// CREATE Student
exports.createStudent = (req, res) => {

    const {
        student_name,
        student_email,
        student_phone,
        department_id,
        semester
    } = req.body;

    if (
        !student_name ||
        !student_email ||
        !student_phone ||
        !department_id ||
        !semester
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Student.createStudent(
        student_name,
        student_email,
        student_phone,
        department_id,
        semester,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Student Created Successfully"
            });

        }
    );

};