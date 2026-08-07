const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET All Teachers
router.get("/", authMiddleware, teacherController.getTeachers);

// GET Teacher By ID
router.get("/:id", authMiddleware, teacherController.getTeacherById);

// CREATE Teacher
router.post("/", authMiddleware, teacherController.createTeacher);

// UPDATE Teacher
router.put("/:id", authMiddleware, teacherController.updateTeacher);

// DELETE Teacher
router.delete("/:id", authMiddleware, teacherController.deleteTeacher);

module.exports = router;