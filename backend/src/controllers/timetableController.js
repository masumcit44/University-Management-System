const Timetable = require("../models/timetableModel");

// =======================
// GET All Timetable (Admin only - full unfiltered schedule)
// =======================
exports.getTimetable = (req, res) => {

    Timetable.getAllTimetable((err, results) => {

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
// GET Timetable By ID
// =======================
exports.getTimetableById = (req, res) => {

    const { id } = req.params;

    Timetable.getTimetableById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Timetable Entry Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });

    });

};

// =======================
// GET Timetable By Teacher (a teacher may only pull their own)
// =======================
exports.getTimetableByTeacher = (req, res) => {

    const { teacher_id } = req.params;

    if (
        req.user.role === "teacher" &&
        String(req.user.teacher_id) !== String(teacher_id)
    ) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. You can only view your own schedule."
        });
    }

    Timetable.getTimetableByTeacher(teacher_id, (err, results) => {

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
// GET Timetable By Course (course-level view, open to any authenticated role)
// =======================
exports.getTimetableByCourse = (req, res) => {

    const { course_id } = req.params;

    Timetable.getTimetableByCourse(course_id, (err, results) => {

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
// GET Timetable By Student (a student may only pull their own)
// =======================
exports.getTimetableByStudent = (req, res) => {

    const { student_id } = req.params;

    if (
        req.user.role === "student" &&
        String(req.user.student_id) !== String(student_id)
    ) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. You can only view your own schedule."
        });
    }

    Timetable.getTimetableByStudent(student_id, (err, results) => {

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
// CREATE Timetable Entry (Admin only - enforced at route level)
// =======================
exports.createTimetable = (req, res) => {

    const {
        course_id,
        teacher_id,
        room_no,
        day,
        start_time,
        end_time
    } = req.body;

    if (
        !course_id ||
        !teacher_id ||
        !room_no ||
        !day ||
        !start_time ||
        !end_time
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Timetable.createTimetable(
        course_id,
        teacher_id,
        room_no,
        day,
        start_time,
        end_time,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Timetable Entry Created Successfully"
            });

        }
    );

};

// =======================
// UPDATE Timetable Entry (Admin only - enforced at route level)
// =======================
exports.updateTimetable = (req, res) => {

    const { id } = req.params;

    const {
        course_id,
        teacher_id,
        room_no,
        day,
        start_time,
        end_time
    } = req.body;

    if (
        !course_id ||
        !teacher_id ||
        !room_no ||
        !day ||
        !start_time ||
        !end_time
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Timetable.updateTimetable(
        id,
        course_id,
        teacher_id,
        room_no,
        day,
        start_time,
        end_time,
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Timetable Entry Updated Successfully"
            });

        }
    );

};

// =======================
// DELETE Timetable Entry (Admin only - enforced at route level)
// =======================
exports.deleteTimetable = (req, res) => {

    const { id } = req.params;

    Timetable.deleteTimetable(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Timetable Entry Deleted Successfully"
        });

    });

};