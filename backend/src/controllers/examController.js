const Exam = require("../models/examModel");
const { canManageCourse } = require("../services/teacherCourseService");
const { isValidEnum, EXAM_TYPES } = require("../services/validationService");

// GET All Exams - Admin/Student see all, Teacher sees only assigned courses
exports.getExams = (req, res) => {

    if (req.user.role === "teacher") {

        if (!req.user.teacher_id) {
            return res.status(400).json({
                success: false,
                message: "No linked teacher record for this account"
            });
        }

        return Exam.getExamsByTeacher(req.user.teacher_id, (err, results) => {

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

    }

    if (req.user.role === "student") {

        if (!req.user.student_id) {
            return res.status(400).json({
                success: false,
                message: "No linked student record for this account"
            });
        }

        return Exam.getExamsByStudent(req.user.student_id, (err, results) => {

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

    }

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

        // A student can only open exams for courses they're approved in
        if (req.user.role === "student") {

            if (!req.user.student_id) {
                return res.status(400).json({
                    success: false,
                    message: "No linked student record for this account"
                });
            }

            return Exam.isApprovedEnrolled(
                req.user.student_id,
                results[0].course_id,
                (errSt, stRows) => {

                    if (errSt) {
                        return res.status(500).json({
                            success: false,
                            message: errSt.message
                        });
                    }

                    if (stRows.length === 0) {
                        return res.status(403).json({
                            success: false,
                            message: "Access Forbidden. You can only view exams for courses you're enrolled in."
                        });
                    }

                    res.status(200).json({
                        success: true,
                        data: results[0]
                    });

                }
            );

        }

        // A teacher can only open exams for their assigned courses
        canManageCourse(req, results[0].course_id, (err2, allowed) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: "Access Forbidden. You can only view exams for your assigned courses."
                });
            }

            res.status(200).json({
                success: true,
                data: results[0]
            });

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

    if (!isValidEnum(exam_type, EXAM_TYPES)) {
        return res.status(400).json({
            success: false,
            message: "exam_type must be one of: Mid, Assignment, Quiz, Final"
        });
    }

    if (Number(total_marks) <= 0) {
        return res.status(400).json({
            success: false,
            message: "total_marks must be greater than zero"
        });
    }

    // A teacher may only create exams for their assigned courses
    canManageCourse(req, course_id, (err, allowed) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden. You can only create exams for your assigned courses."
            });
        }

        Exam.createExam(
            course_id,
            exam_type,
            exam_date,
            total_marks,
            (err2) => {

                if (err2) {
                    return res.status(500).json({
                        success: false,
                        message: err2.message
                    });
                }

                res.status(201).json({
                    success: true,
                    message: "Exam Created Successfully"
                });

            }
        );

    });

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

    if (!isValidEnum(exam_type, EXAM_TYPES)) {
        return res.status(400).json({
            success: false,
            message: "exam_type must be one of: Mid, Assignment, Quiz, Final"
        });
    }

    if (Number(total_marks) <= 0) {
        return res.status(400).json({
            success: false,
            message: "total_marks must be greater than zero"
        });
    }

    // A teacher may only update exams for their assigned courses
    canManageCourse(req, course_id, (err, allowed) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!allowed) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden. You can only update exams for your assigned courses."
            });
        }

        Exam.updateExam(
            id,
            course_id,
            exam_type,
            exam_date,
            total_marks,
            (err2) => {

                if (err2) {
                    return res.status(500).json({
                        success: false,
                        message: err2.message
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Exam Updated Successfully"
                });

            }
        );

    });

};

// =======================
// DELETE Exam
// =======================
exports.deleteExam = (req, res) => {
    const { id } = req.params;

    // Fetch the exam so the teacher ownership check knows the course
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

        canManageCourse(req, results[0].course_id, (err2, allowed) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: "Access Forbidden. You can only delete exams for your assigned courses."
                });
            }

            Exam.deleteExam(id, (err3) => {

                if (err3) {
                    return res.status(500).json({
                        success: false,
                        message: err3.message
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Exam Deleted Successfully"
                });

            });

        });

    });

};
