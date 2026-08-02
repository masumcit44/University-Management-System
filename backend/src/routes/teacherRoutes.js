const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");

// GET All Teachers
router.get("/", teacherController.getTeachers);

// CREATE Teacher
router.post("/", teacherController.createTeacher);

module.exports = router;