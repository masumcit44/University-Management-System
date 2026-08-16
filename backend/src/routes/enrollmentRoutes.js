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

// POST Self-Enrollment (Student) - creates a pending enrollment
router.post(
    "/enroll",
    authMiddleware,
    roleMiddleware("student"),
    enrollmentController.enrollSelf
);

// PUT Review Enrollment (Admin or assigned Teacher) - approve/reject
router.put(
    "/:id/review",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    enrollmentController.reviewEnrollment
);

// GET By Student (Admin, Teacher, Student - ownership checked in controller)
// Must come before "/:id" so Express doesn't treat "student" as an :id value
router.get(
    "/student/:student_id",
    authMiddleware,
    roleMiddleware("admin", "teacher", "student"),
    enrollmentController.getEnrollmentsByStudent
);

// GET By Course (Teacher roster - teacher must teach the course)
// Must come before "/:id" so Express doesn't treat "course" as an :id value
router.get(
    "/course/:course_id",
    authMiddleware,
    roleMiddleware("teacher"),
    enrollmentController.getEnrollmentsByCourse
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