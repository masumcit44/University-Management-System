const express = require("express");
const router = express.Router();

const timetableController = require("../controllers/timetableController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET All Timetable
router.get("/", authMiddleware, timetableController.getTimetable);

// GET Timetable By Teacher
router.get("/teacher/:teacher_id", authMiddleware, timetableController.getTimetableByTeacher);

// GET Timetable By Course
router.get("/course/:course_id", authMiddleware, timetableController.getTimetableByCourse);

// GET Timetable By ID
router.get("/:id", authMiddleware, timetableController.getTimetableById);

// CREATE Timetable Entry
router.post("/", authMiddleware, timetableController.createTimetable);

// UPDATE Timetable Entry
router.put("/:id", authMiddleware, timetableController.updateTimetable);

// DELETE Timetable Entry
router.delete("/:id", authMiddleware, timetableController.deleteTimetable);

module.exports = router;