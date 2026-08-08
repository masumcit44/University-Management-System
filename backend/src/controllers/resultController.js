const Result = require("../models/resultModel");

const {
    calculatePercentage,
    calculateGrade
} = require("../services/gradeService");


// GET Results
exports.getResults = (req, res) => {

    Result.getResults((err, results) => {

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
// GET Result By ID
// =======================
exports.getResultById = (req, res) => {

    const { id } = req.params;

    Result.getResultById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Result Not Found"
            });
        }

        const result = results[0];

        // A student can only ever open their own result - not anyone else's
        if (
            req.user.role === "student" &&
            String(req.user.student_id) !== String(result.student_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden. You can only view your own result."
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });

    });

};


// CREATE Result
exports.createResult = (req, res) => {

    const {

        enrollment_id,
        exam_id,
        marks_obtained

    } = req.body;


    // Get Exam's Total Marks First (needed to calculate percentage)
    Result.getExamTotalMarks(exam_id, (err, examResults) => {

        if (err) {

            return res.status(500).json({

                success: false,
                message: err.message

            });

        }

        if (examResults.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        const total_marks = examResults[0].total_marks;

        if (Number(marks_obtained) > Number(total_marks)) {

            return res.status(400).json({

                success: false,
                message: "Marks Obtained Cannot Exceed Total Marks"

            });

        }


        // Business Logic
        const percentage = calculatePercentage(
            marks_obtained,
            total_marks
        );

        const {

            grade,
            grade_point

        } = calculateGrade(percentage);


        Result.createResult(

            enrollment_id,
            exam_id,

            marks_obtained,
            grade,
            grade_point,

            (err, result) => {

                if (err) {

                    return res.status(500).json({

                        success: false,
                        message: err.message

                    });

                }

                res.status(201).json({

                    success: true,
                    message: "Result Created Successfully"

                });

            }

        );

    });

};


// =======================
// UPDATE Result
// =======================
exports.updateResult = (req, res) => {

    const { id } = req.params;

    const {

        enrollment_id,
        exam_id,
        marks_obtained

    } = req.body;


    Result.getExamTotalMarks(exam_id, (err, examResults) => {

        if (err) {

            return res.status(500).json({

                success: false,
                message: err.message

            });

        }

        if (examResults.length === 0) {

            return res.status(404).json({

                success: false,
                message: "Exam Not Found"

            });

        }

        const total_marks = examResults[0].total_marks;

        if (Number(marks_obtained) > Number(total_marks)) {

            return res.status(400).json({

                success: false,
                message: "Marks Obtained Cannot Exceed Total Marks"

            });

        }

        const percentage = calculatePercentage(
            marks_obtained,
            total_marks
        );

        const {

            grade,
            grade_point

        } = calculateGrade(percentage);


        Result.updateResult(

            id,

            enrollment_id,
            exam_id,

            marks_obtained,
            grade,
            grade_point,

            (err) => {

                if (err) {

                    return res.status(500).json({

                        success: false,
                        message: err.message

                    });

                }

                res.status(200).json({

                    success: true,
                    message: "Result Updated Successfully"

                });

            }

        );

    });

};


// =======================
// DELETE Result
// =======================
exports.deleteResult = (req, res) => {

    const { id } = req.params;

    Result.deleteResult(id, (err) => {

        if (err) {

            return res.status(500).json({

                success: false,
                message: err.message

            });

        }

        res.status(200).json({

            success: true,
            message: "Result Deleted Successfully"

        });

    });

};