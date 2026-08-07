const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET
router.get("/", authMiddleware, attendanceController.getAttendance);

// GET By Course
router.get("/course/:course_id", authMiddleware, attendanceController.getAttendanceByCourse);

// GET By Student
router.get("/student/:student_id", authMiddleware, attendanceController.getAttendanceByStudent);

// GET By ID
router.get("/:id", authMiddleware, attendanceController.getAttendanceById);

// POST
router.post("/", authMiddleware, attendanceController.createAttendance);

// UPDATE
router.put("/:id", authMiddleware, attendanceController.updateAttendance);

// DELETE
router.delete("/:id", authMiddleware, attendanceController.deleteAttendance);

module.exports = router;