const Enrollment = require("../models/enrollmentModel");
const TeacherCourse = require("../models/teacherCourseModel");
const Course = require("../models/courseModel");
const auditService = require("../services/auditService");

// GET All Enrollments - Admin sees all, Teacher sees only assigned courses
exports.getEnrollments = (req, res) => {

    if (req.user.role === "teacher") {

        if (!req.user.teacher_id) {
            return res.status(400).json({
                success: false,
                message: "No linked teacher record for this account"
            });
        }

        return Enrollment.getEnrollmentsByTeacher(req.user.teacher_id, (err, results) => {

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

// GET Enrollments By Course (Teacher roster - teacher must teach the course)
exports.getEnrollmentsByCourse = (req, res) => {

    const { course_id } = req.params;

    if (!req.user.teacher_id) {
        return res.status(400).json({
            success: false,
            message: "No linked teacher record for this account"
        });
    }

    TeacherCourse.isTeacherAssigned(req.user.teacher_id, course_id, (err, assigned) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (assigned.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden. You can only view rosters for your assigned courses."
            });
        }

        Enrollment.getStudentsByCourse(course_id, (err2, results) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            res.status(200).json({
                success: true,
                data: results
            });

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

        // A teacher can only open enrollments in courses they teach
        if (req.user.role === "teacher") {

            if (!req.user.teacher_id) {
                return res.status(400).json({
                    success: false,
                    message: "No linked teacher record for this account"
                });
            }

            return TeacherCourse.isTeacherAssigned(
                req.user.teacher_id,
                enrollment.course_id,
                (err2, assigned) => {

                    if (err2) {
                        return res.status(500).json({
                            success: false,
                            message: err2.message
                        });
                    }

                    if (assigned.length === 0) {
                        return res.status(403).json({
                            success: false,
                            message: "Access Forbidden. You can only view enrollments in your assigned courses."
                        });
                    }

                    res.status(200).json({
                        success: true,
                        data: enrollment
                    });
                }
            );

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

    // A teacher may only pull a student's enrollments for courses they teach
    if (req.user.role === "teacher") {

        if (!req.user.teacher_id) {
            return res.status(400).json({
                success: false,
                message: "No linked teacher record for this account"
            });
        }

        const sql = `
            SELECT DISTINCT
                e.enrollment_id,
                c.course_id,
                c.course_name,
                c.course_code,
                c.credit,
                c.semester,
                c.department_id,
                d.department_name,
                e.session,
                e.status
            FROM enrollments e
            JOIN courses c
                ON e.course_id = c.course_id
            JOIN departments d
                ON c.department_id = d.department_id
            JOIN teacher_courses tc
                ON tc.course_id = e.course_id
            WHERE e.student_id = ? AND tc.teacher_id = ?
        `;

        return Enrollment.query(sql, [student_id, req.user.teacher_id], (err, results) => {

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

// Self-Enrollment (Student) - creates a PENDING enrollment awaiting review
exports.enrollSelf = (req, res) => {

    if (!req.user.student_id) {
        return res.status(400).json({
            success: false,
            message: "No linked student record for this account"
        });
    }

    const { course_id, session } = req.body;

    if (!course_id || !session) {
        return res.status(400).json({
            success: false,
            message: "course_id and session are required"
        });
    }

    // Semester is derived from the course record, not trusted from the client
    Course.getCourseById(course_id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course Not Found"
            });
        }

        const course = results[0];

        // Block if the student already has a pending/approved enrollment
        Enrollment.query(
            "SELECT enrollment_id, status FROM enrollments WHERE student_id = ? AND course_id = ?",
            [req.user.student_id, course_id],
            (err2, rows) => {

                if (err2) {
                    return res.status(500).json({
                        success: false,
                        message: err2.message
                    });
                }

                const active = rows.find((r) => r.status !== "rejected");

                if (active) {
                    return res.status(400).json({
                        success: false,
                        message:
                            active.status === "pending"
                                ? "You already have a pending enrollment for this course"
                                : "You are already enrolled in this course"
                    });
                }

                Enrollment.createPendingEnrollment(
                    req.user.student_id,
                    course_id,
                    course.semester,
                    session,
                    (err3, result) => {

                        if (err3) {
                            return res.status(500).json({
                                success: false,
                                message: err3.message
                            });
                        }

                        auditService.log(
                            req.user,
                            "enrollment.self_enroll",
                            "enrollments",
                            result.insertId,
                            { course_id: Number(course_id), status: "pending" },
                            req.ip
                        );

                        res.status(201).json({
                            success: true,
                            message: "Enrollment submitted. Awaiting approval."
                        });

                    }
                );

            }
        );

    });

};

// Review Enrollment (Admin or assigned Teacher) - approve / reject
exports.reviewEnrollment = (req, res) => {

    const { id } = req.params;
    const { action } = req.body;

    if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({
            success: false,
            message: "action must be 'approve' or 'reject'"
        });
    }

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

        if (enrollment.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "This enrollment has already been reviewed"
            });
        }

        // A teacher may only review enrollments in courses they teach
        if (req.user.role === "teacher") {

            if (!req.user.teacher_id) {
                return res.status(400).json({
                    success: false,
                    message: "No linked teacher record for this account"
                });
            }

            return TeacherCourse.isTeacherAssigned(
                req.user.teacher_id,
                enrollment.course_id,
                (err2, assigned) => {

                    if (err2) {
                        return res.status(500).json({
                            success: false,
                            message: err2.message
                        });
                    }

                    if (assigned.length === 0) {
                        return res.status(403).json({
                            success: false,
                            message: "Access Forbidden. You can only review enrollments in your assigned courses."
                        });
                    }

                    doReview(req, res, id, action);
                }
            );

        }

        doReview(req, res, id, action);
    });

};

const doReview = (req, res, id, action) => {

    const status = action === "approve" ? "approved" : "rejected";

    Enrollment.updateEnrollmentStatus(id, status, req.user.user_id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        auditService.log(
            req.user,
            "enrollment.review",
            "enrollments",
            id,
            { action, status },
            req.ip
        );

        res.status(200).json({
            success: true,
            message:
                action === "approve"
                    ? "Enrollment approved"
                    : "Enrollment rejected"
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