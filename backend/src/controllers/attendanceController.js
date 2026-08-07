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

        res.status(200).json({
            success: true,
            data: results[0]
        });

    });

};

// CREATE Attendance
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

    Attendance.createAttendance(
        enrollment_id,
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

// UPDATE Attendance
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

    Attendance.updateAttendance(
        id,
        enrollment_id,
        attendance_date,
        status,
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Attendance Updated Successfully"
            });

        }
    );

};

// DELETE Attendance
exports.deleteAttendance = (req, res) => {

    const { id } = req.params;

    Attendance.deleteAttendance(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Attendance Deleted Successfully"
        });

    });

};