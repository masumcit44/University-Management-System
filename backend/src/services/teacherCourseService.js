const TeacherCourse = require("../models/teacherCourseModel");

// Permission helper shared by attendance/exam/result/enrollment controllers.
// Admins may manage any course; teachers may only manage courses they are
// explicitly assigned to via the teacher_courses table.
exports.canManageCourse = (req, course_id, callback) => {

    if (req.user.role !== "teacher") {
        return callback(null, true);
    }

    if (!req.user.teacher_id) {
        return callback(null, false);
    }

    TeacherCourse.isTeacherAssigned(req.user.teacher_id, course_id, (err, rows) => {

        if (err) {
            return callback(err, null);
        }

        callback(null, rows.length > 0);
    });

};
