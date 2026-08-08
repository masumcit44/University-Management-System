const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET (Admin & Teacher)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    enrollmentController.getEnrollments
);

// GET By ID (Admin, Teacher, Student - student ownership checked in controller)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher", "student"),
    enrollmentController.getEnrollmentById
);

// POST (Admin Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    enrollmentController.createEnrollment
);

// UPDATE (Admin Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    enrollmentController.updateEnrollment
);

// DELETE (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    enrollmentController.deleteEnrollment
);

module.exports = router;