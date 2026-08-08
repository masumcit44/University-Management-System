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

        const enrollment = results[0];

        // A student can only ever open their own enrollment - not anyone else's
        if (
            req.user.role === "student" &&
            String(req.user.student_id) !== String(enrollment.student_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden. You can only view your own enrollment."
            });
        }

        res.status(200).json({
            success: true,
            data: enrollment
        });

    });

};

// GET Enrollments By Student (used by "My Courses" - student role)
exports.getEnrollmentsByStudent = (req, res) => {

    const { student_id } = req.params;

    // A student can only ever pull their own courses - not anyone else's
    if (
        req.user.role === "student" &&
        String(req.user.student_id) !== String(student_id)
    ) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. You can only view your own courses."
        });
    }

    Enrollment.getEnrollmentsByStudent(student_id, (err, results) => {

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