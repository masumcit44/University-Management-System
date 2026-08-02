const Attendance = require("../models/attendanceModel");

// GET Attendance
exports.getAttendance = (req, res) => {

    Attendance.getAttendance((err, results) => {

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


// CREATE Attendance
exports.createAttendance = (req, res) => {

    const {
        student_id,
        course_id,
        attendance_date,
        status
    } = req.body;

    Attendance.createAttendance(
        student_id,
        course_id,
        attendance_date,
        status,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err
                });
            }

            res.status(201).json({
                success: true,
                message: "Attendance Created Successfully"
            });

        }
    );

};