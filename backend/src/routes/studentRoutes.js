const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET All (Admin & Teacher)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    studentController.getStudents
);

// GET By ID (Admin, Teacher, Student - student ownership checked in controller)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher", "student"),
    studentController.getStudentById
);

// POST (Admin Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    studentController.createStudent
);

// PUT (Admin Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    studentController.updateStudent
);

// DELETE (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    studentController.deleteStudent
);

module.exports = router;