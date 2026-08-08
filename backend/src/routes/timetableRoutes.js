const express = require("express");
const router = express.Router();

const timetableController = require("../controllers/timetableController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET All Timetable (Admin Only - full unfiltered schedule)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    timetableController.getTimetable
);

// GET Timetable By Teacher (Admin & Teacher - teacher ownership checked in controller)
router.get(
    "/teacher/:teacher_id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    timetableController.getTimetableByTeacher
);

// GET Timetable By Course (Admin, Teacher, Student)
router.get(
    "/course/:course_id",
    authMiddleware,
    roleMiddleware("admin", "teacher", "student"),
    timetableController.getTimetableByCourse
);

// GET Timetable By Student (Admin & Student - student ownership checked in controller)
router.get(
    "/student/:student_id",
    authMiddleware,
    roleMiddleware("admin", "student"),
    timetableController.getTimetableByStudent
);

// GET Timetable By ID (Admin Only)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    timetableController.getTimetableById
);

// CREATE Timetable Entry (Admin Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    timetableController.createTimetable
);

// UPDATE Timetable Entry (Admin Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    timetableController.updateTimetable
);

// DELETE Timetable Entry (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    timetableController.deleteTimetable
);

module.exports = router;