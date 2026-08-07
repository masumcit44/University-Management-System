const {
    getStudentPrediction,
    getCohortPrediction
} = require("../services/predictionService");

// GET Student Performance Prediction
exports.getStudentPrediction = (req, res) => {

    const { student_id } = req.params;

    if (isNaN(student_id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Student Id"
        });
    }

    getStudentPrediction(student_id, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No Enrollment Found For This Student"
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });

    });

};

// GET Cohort Performance Overview
exports.getCohortPrediction = (req, res) => {

    getCohortPrediction((err, students) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: students
        });

    });

};