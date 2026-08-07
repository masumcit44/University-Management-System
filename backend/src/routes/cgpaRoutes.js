const express = require("express");

const router = express.Router();

const cgpaController = require("../controllers/cgpaController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET Student CGPA
router.get("/:student_id", authMiddleware, cgpaController.getStudentCGPA);

module.exports = router;