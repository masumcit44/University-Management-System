const Attendance = require("../models/attendanceModel");
const Enrollment = require("../models/enrollmentModel");
const { canManageCourse } = require("../services/teacherCourseService");
const { isValidEnum, ATTENDANCE_STATUS } = require("../services/validationService");

// GET Attendance - Admin sees all, Teacher sees only assigned courses
exports.getAttendance = (req, res) => {

    if (req.user.role === "teacher") {

        if (!req.user.teacher_id) {
            return res.status(400).json({
                success: false,
                message: "No linked teacher record for this account"
            });
        }

        return Attendance.getAttendanceByTeacher(req.user.teacher_id, (err, results) => {

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

    Attendance.getAttendance((err, results) => {

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

// GET Attendance By ID
exports.getAttendanceById = (req, res) => {

    const { id } = req.params;

    Attendance.getAttendanceById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance Record Not Found"
            });
        }

        const record = results[0];

        // A teacher can only open attendance for their assigned courses
        canManageCourse(req, record.course_id, (err2, allowed) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            if (!allowed) {
                return res.status(403).json({
                    success: false,
                    message: "Access Forbidden. You can only view attendance for your assigned courses."
                });
            }

            res.status(200).json({
                success: true,
                data: record
            });

        });

    });

};

// =======================
// GET Attendance By Course (all students, one course)
// =======================
exports.getAttendanceByCourse = (req, res) => {

    const { course_id } = req.params;

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
                message: "Access Forbidden. You can only view attendance for your assigned courses."
            });
        }

        Attendance.getAttendanceByCourse(course_id, (err2, results) => {

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

// =======================
// GET Attendance By Student (all courses, one student)
// =======================
exports.getAttendanceByStudent = (req, res) => {

    const { student_id } = req.params;

    // A student can only ever pull their own attendance - not anyone else's
    if (
        req.user.role === "student" &&
        String(req.user.student_id) !== String(student_id)
    ) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. You can only view your own attendance."
        });
    }

    // A teacher sees only the courses they are assigned to teach - not the
    // student's full history across every course in the institution
    if (req.user.role === "teacher") {

        if (!req.user.teacher_id) {
            return res.status(400).json({
                success: false,
                message: "No linked teacher record for this account"
            });
        }

        return Attendance.getAttendanceByStudentForTeacher(
            student_id,
            req.user.teacher_id,
            (err, results) => {

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

            }
        );

    }

    Attendance.getAttendanceByStudent(student_id, (err, results) => {

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
// CREATE Attendance
// =======================
exports.createAttendance = (req, res) => {

    const {
        enrollment_id,
        attendance_date,
        status
    } = req.body;

    if (!enrollment_id || !attendance_date || !status) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (!isValidEnum(status, ATTENDANCE_STATUS)) {
        return res.status(400).json({
            success: false,
            message: "status must be one of: Present, Absent, Late"
        });
    }

    // Resolve the course from the enrollment so teacher ownership can be checked
    Enrollment.query(
        "SELECT course_id, status FROM enrollments WHERE enrollment_id = ?",
        [enrollment_id],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Enrollment Not Found"
                });
            }

            if (rows[0].status !== "approved") {
                return res.status(400).json({
                    success: false,
                    message: "Attendance can only be marked for approved enrollments"
                });
            }

            // Attendance cannot be recorded for a future class date
            if (new Date(attendance_date) > new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Attendance cannot be marked for a future date"
                });
            }

            // One record per student per class date
            Attendance.getByEnrollmentAndDate(enrollment_id, attendance_date, (errDup, dupRows) => {

                if (errDup) {
                    return res.status(500).json({
                        success: false,
                        message: errDup.message
                    });
                }

                if (dupRows.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Attendance already recorded for this student on that date"
                    });
                }

            canManageCourse(req, rows[0].course_id, (err2, allowed) => {

                if (err2) {
                    return res.status(500).json({
                        success: false,
                        message: err2.message
                    });
                }

                if (!allowed) {
                    return res.status(403).json({
                        success: false,
                        message: "Access Forbidden. You can only mark attendance for your assigned courses."
                    });
                }

                Attendance.createAttendance(
                    enrollment_id,
                    attendance_date,
                    status,
                    (err3) => {

                        if (err3) {
                            return res.status(500).json({
                                success: false,
                                message: err3.message
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "Attendance Created Successfully"
                        });

                    }
                );

            });

        });

    }
);

};

// =======================
// UPDATE Attendance
// =======================
exports.updateAttendance = (req, res) => {

    const { id } = req.params;

    const {
        enrollment_id,
        attendance_date,
        status
    } = req.body;

    if (!enrollment_id || !attendance_date || !status) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (!isValidEnum(status, ATTENDANCE_STATUS)) {
        return res.status(400).json({
            success: false,
            message: "status must be one of: Present, Absent, Late"
        });
    }

    // Fetch existing record to resolve the course for teacher ownership
    Attendance.getAttendanceById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance Record Not Found"
            });
        }

        // Attendance cannot be recorded for a future class date
        if (new Date(attendance_date) > new Date()) {
            return res.status(400).json({
                success: false,
                message: "Attendance cannot be marked for a future date"
            });
        }

        // The target enrollment must exist and be approved
        Enrollment.query(
            "SELECT course_id, status FROM enrollments WHERE enrollment_id = ?",
            [enrollment_id],
            (errEn, enRows) => {

                if (errEn) {
                    return res.status(500).json({
                        success: false,
                        message: errEn.message
                    });
                }

                if (enRows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Enrollment Not Found"
                    });
                }

                if (enRows[0].status !== "approved") {
                    return res.status(400).json({
                        success: false,
                        message: "Attendance can only be marked for approved enrollments"
                    });
                }

                // If the enrollment was changed, the teacher must manage the new course too
                canManageCourse(req, enRows[0].course_id, (errEn2, enAllowed) => {

                    if (errEn2) {
                        return res.status(500).json({
                            success: false,
                            message: errEn2.message
                        });
                    }

                    if (!enAllowed) {
                        return res.status(403).json({
                            success: false,
                            message: "Access Forbidden. You can only update attendance for your assigned courses."
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
                                message: "Access Forbidden. You can only update attendance for your assigned courses."
                            });
                        }

                        Attendance.updateAttendance(
                            id,
                            enrollment_id,
                            attendance_date,
                            status,
                            (err3) => {

                                if (err3) {
                                    return res.status(500).json({
                                        success: false,
                                        message: err3.message
                                    });
                                }

                                res.status(200).json({
                                    success: true,
                                    message: "Attendance Updated Successfully"
                                });

                            }
                        );

                    });

                });

            }
        );

    });

};

// =======================
// DELETE Attendance
// =======================
exports.deleteAttendance = (req, res) => {

    const { id } = req.params;

    // Fetch existing record to resolve the course for teacher ownership
    Attendance.getAttendanceById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance Record Not Found"
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
                    message: "Access Forbidden. You can only delete attendance for your assigned courses."
                });
            }

            Attendance.deleteAttendance(id, (err3) => {

                if (err3) {
                    return res.status(500).json({
                        success: false,
                        message: err3.message
                    });
                }

                res.status(200).json({
                    success: true,
                    message: "Attendance Deleted Successfully"
                });

            });

        });

    });

};
