const Result = require("../models/resultModel");
const { canManageCourse } = require("../services/teacherCourseService");

const {
    calculatePercentage,
    calculateGrade
} = require("../services/gradeService");

// GET Results - Admin sees all, Teacher sees only assigned courses
exports.getResults = (req, res) => {

    if (req.user.role === "teacher") {

        if (!req.user.teacher_id) {
            return res.status(400).json({
                success: false,
                message: "No linked teacher record for this account"
            });
        }

        return Result.getResultsByTeacher(req.user.teacher_id, (err, results) => {

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
// GET Results For A Student (Admin sees any student, Student sees only own)
// =======================
exports.getResultsByStudent = (req, res) => {

    const { student_id } = req.params;

    // A student can only ever view their own results - not anyone else's
    if (
        req.user.role === "student" &&
        String(req.user.student_id) !== String(student_id)
    ) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. You can only view your own results."
        });
    }

    Result.getResultsByStudent(student_id, (err, results) => {

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

        // A teacher can only open results for their assigned courses
        canManageCourse(req, result.course_id, (err2, allowed) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: "Access Forbidden. You can only view results for your assigned courses."
                });
            }

            res.status(200).json({
                success: true,
                data: result
            });

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
        const exam_course_id = examResults[0].course_id;

        // The enrollment must exist, belong to the same course as the exam,
        // and be approved - otherwise the result would pollute another course
        Result.getEnrollmentForResult(enrollment_id, (errEn, enResults) => {

            if (errEn) {

                return res.status(500).json({

                    success: false,
                    message: errEn.message

                });

            }

            if (enResults.length === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Enrollment Not Found"

                });

            }

            if (String(enResults[0].course_id) !== String(exam_course_id)) {

                return res.status(400).json({

                    success: false,
                    message: "Enrollment course does not match the exam's course"

                });

            }

            if (enResults[0].status !== "approved") {

                return res.status(400).json({

                    success: false,
                    message: "Only approved enrollments can have results recorded"

                });

            }

            // A teacher can only add results for exams in their assigned courses
            canManageCourse(req, exam_course_id, (err2, allowed) => {

                if (err2) {

                    return res.status(500).json({

                        success: false,
                        message: err2.message

                    });

                }

                if (!allowed) {

                    return res.status(403).json({

                        success: false,
                        message: "Access Forbidden. You can only add results for your assigned courses."

                    });

                }

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

                    (err3) => {

                        if (err3) {

                            // UNIQUE(enrollment_id, exam_id) - surface cleanly
                            if (err3.code === "ER_DUP_ENTRY") {

                                return res.status(400).json({

                                    success: false,
                                    message: "A result already exists for this enrollment and exam"

                                });

                            }

                            return res.status(500).json({

                                success: false,
                                message: err3.message

                            });

                        }

                        res.status(201).json({

                            success: true,
                            message: "Result Created Successfully"

                        });

                    }

                );

            });

        });

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
        const exam_course_id = examResults[0].course_id;

        // The enrollment must exist, belong to the same course as the exam,
        // and be approved - otherwise the result would pollute another course
        Result.getEnrollmentForResult(enrollment_id, (errEn, enResults) => {

            if (errEn) {

                return res.status(500).json({

                    success: false,
                    message: errEn.message

                });

            }

            if (enResults.length === 0) {

                return res.status(404).json({

                    success: false,
                    message: "Enrollment Not Found"

                });

            }

            if (String(enResults[0].course_id) !== String(exam_course_id)) {

                return res.status(400).json({

                    success: false,
                    message: "Enrollment course does not match the exam's course"

                });

            }

            if (enResults[0].status !== "approved") {

                return res.status(400).json({

                    success: false,
                    message: "Only approved enrollments can have results recorded"

                });

            }

            // A teacher can only update results for exams in their assigned courses
            canManageCourse(req, exam_course_id, (err2, allowed) => {

                if (err2) {

                    return res.status(500).json({

                        success: false,
                        message: err2.message

                    });

                }

                if (!allowed) {

                    return res.status(403).json({

                        success: false,
                        message: "Access Forbidden. You can only update results for your assigned courses."

                    });

                }

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

                    (err3) => {

                        if (err3) {

                            return res.status(500).json({

                                success: false,
                                message: err3.message

                            });

                        }

                        res.status(200).json({

                            success: true,
                            message: "Result Updated Successfully"

                        });

                    }

                );

            });

        });

    });

};

// =======================
// DELETE Result
// =======================
exports.deleteResult = (req, res) => {

    const { id } = req.params;

    // Fetch the result so the teacher ownership check knows the course
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
                    message: "Access Forbidden. You can only delete results for your assigned courses."

                });

            }

            Result.deleteResult(id, (err3) => {

                if (err3) {

                    return res.status(500).json({

                        success: false,
                        message: err3.message

                    });

                }

                res.status(200).json({

                    success: true,
                    message: "Result Deleted Successfully"

                });

            });

        });

    });

};
