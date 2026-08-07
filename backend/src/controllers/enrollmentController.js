const Enrollment = require("../models/enrollmentModel");

// GET All Enrollments
exports.getEnrollments = (req, res) => {

    Enrollment.getEnrollments((err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err
            });
        }

        res.json({
            success: true,
            data: results
        });

    });

};

// GET Enrollment By ID
exports.getEnrollmentById = (req, res) => {

    const { id } = req.params;

    Enrollment.getEnrollmentById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Enrollment Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });

    });

};

// CREATE Enrollment
exports.createEnrollment = (req, res) => {

    const {
        student_id,
        course_id,
        semester,
        session
    } = req.body;

    if (!student_id || !course_id || !semester || !session) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Enrollment.createEnrollment(
        student_id,
        course_id,
        semester,
        session,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err
                });
            }

            res.status(201).json({
                success: true,
                message: "Enrollment Created Successfully"
            });

        }
    );

};

// UPDATE Enrollment
exports.updateEnrollment = (req, res) => {

    const { id } = req.params;

    const {
        student_id,
        course_id,
        semester,
        session
    } = req.body;

    if (!student_id || !course_id || !semester || !session) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Enrollment.updateEnrollment(
        id,
        student_id,
        course_id,
        semester,
        session,
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Enrollment Updated Successfully"
            });

        }
    );

};

// DELETE Enrollment
exports.deleteEnrollment = (req, res) => {

    const { id } = req.params;

    Enrollment.deleteEnrollment(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Enrollment Deleted Successfully"
        });

    });

};