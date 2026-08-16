const TeacherCourse = require("../models/teacherCourseModel");
const auditService = require("../services/auditService");

// GET All Assignments (Admin)
exports.getAssignments = (req, res) => {

    TeacherCourse.getAssignments((err, results) => {

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

// GET My Courses (Teacher - own assigned courses only)
exports.getMyCourses = (req, res) => {

    if (!req.user.teacher_id) {
        return res.status(400).json({
            success: false,
            message: "No linked teacher record for this account"
        });
    }

    TeacherCourse.getCoursesByTeacher(req.user.teacher_id, (err, results) => {

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

// ASSIGN Teacher To Course (Admin)
exports.assignTeacherCourse = (req, res) => {

    const { teacher_id, course_id } = req.body;

    if (!teacher_id || !course_id) {
        return res.status(400).json({
            success: false,
            message: "teacher_id and course_id are required"
        });
    }

    // Avoid duplicate assignments (UNIQUE constraint backs this up)
    TeacherCourse.isTeacherAssigned(teacher_id, course_id, (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Teacher is already assigned to this course"
            });
        }

        TeacherCourse.assign(teacher_id, course_id, (err2) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            auditService.log(
                req.user,
                "teacher_course.assign",
                "teacher_courses",
                null,
                { teacher_id: Number(teacher_id), course_id: Number(course_id) },
                req.ip
            );

            res.status(201).json({
                success: true,
                message: "Teacher assigned to course successfully"
            });

        });

    });

};

// UNASSIGN Teacher From Course (Admin)
exports.unassignTeacherCourse = (req, res) => {

    const { id } = req.params;

    TeacherCourse.unassign(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        auditService.log(
            req.user,
            "teacher_course.unassign",
            "teacher_courses",
            id,
            null,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: "Teacher unassigned from course successfully"
        });

    });

};
