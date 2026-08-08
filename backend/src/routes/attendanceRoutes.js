const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET (Admin & Teacher)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    attendanceController.getAttendance
);

// GET By Course (Admin & Teacher)
router.get(
    "/course/:course_id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    attendanceController.getAttendanceByCourse
);

// GET By Student (Admin, Teacher, Student - student ownership checked in controller)
router.get(
    "/student/:student_id",
    authMiddleware,
    roleMiddleware("admin", "teacher", "student"),
    attendanceController.getAttendanceByStudent
);

// GET By ID (Admin & Teacher)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    attendanceController.getAttendanceById
);

// POST (Admin & Teacher)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    attendanceController.createAttendance
);

// UPDATE (Admin & Teacher)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    attendanceController.updateAttendance
);

// DELETE (Admin & Teacher)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    attendanceController.deleteAttendance
);

module.exports = router;