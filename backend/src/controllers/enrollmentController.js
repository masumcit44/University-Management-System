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


// CREATE Enrollment
exports.createEnrollment = (req, res) => {

    const {
        student_id,
        course_id,
        semester,
        session
    } = req.body;

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