const express = require("express");

const router = express.Router();

const cgpaController = require("../controllers/cgpaController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET Student CGPA (Admin & Student - student ownership checked in controller)
router.get(
    "/:student_id",
    authMiddleware,
    roleMiddleware("admin", "student"),
    cgpaController.getStudentCGPA
);

module.exports = router;