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

// =======================
// GET Student By ID
// =======================
exports.getStudentById = (req, res) => {
    const { id } = req.params;

    Student.getStudentById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
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
        gender,
        address,
        dob,
        admission_date
    } = req.body;

    if (
        !student_name ||
        !student_email ||
        !student_phone ||
        !department_id
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
        gender || null,
        address || null,
        dob || null,
        admission_date || null,
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

// =======================
// UPDATE Student
// =======================
exports.updateStudent = (req, res) => {
    const { id } = req.params;

    const {
        student_name,
        student_email,
        student_phone,
        department_id,
        gender,
        address,
        dob,
        admission_date
    } = req.body;

    if (
        !student_name ||
        !student_email ||
        !student_phone ||
        !department_id
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Student.updateStudent(
        id,
        student_name,
        student_email,
        student_phone,
        department_id,
        gender || null,
        address || null,
        dob || null,
        admission_date || null,
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Student Updated Successfully"
            });

        }
    );

};

// =======================
// DELETE Student
// =======================
exports.deleteStudent = (req, res) => {
    const { id } = req.params;

    Student.deleteStudent(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Student Deleted Successfully"
        });

    });
};