const Exam = require("../models/examModel");

// GET All Exams
exports.getExams = (req, res) => {

    Exam.getExams((err, results) => {

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
// GET Exam By ID
// =======================
exports.getExamById = (req, res) => {
    const { id } = req.params;

    Exam.getExamById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Exam Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });

    });
};

// CREATE Exam
exports.createExam = (req, res) => {

    const {
        course_id,
        exam_type,
        exam_date,
        total_marks
    } = req.body;

    if (
        !course_id ||
        !exam_type ||
        !exam_date ||
        !total_marks
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Exam.createExam(
        course_id,
        exam_type,
        exam_date,
        total_marks,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Exam Created Successfully"
            });

        }
    );

};

// =======================
// UPDATE Exam
// =======================
exports.updateExam = (req, res) => {
    const { id } = req.params;

    const {
        course_id,
        exam_type,
        exam_date,
        total_marks
    } = req.body;

    if (
        !course_id ||
        !exam_type ||
        !exam_date ||
        !total_marks
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Exam.updateExam(
        id,
        course_id,
        exam_type,
        exam_date,
        total_marks,
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Exam Updated Successfully"
            });

        }
    );

};

// =======================
// DELETE Exam
// =======================
exports.deleteExam = (req, res) => {
    const { id } = req.params;

    Exam.deleteExam(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Exam Deleted Successfully"
        });

    });
};