const express = require("express");

const router = express.Router();

const cgpaController = require("../controllers/cgpaController");

// GET Student CGPA
router.get("/:student_id", cgpaController.getStudentCGPA);

module.exports = router;