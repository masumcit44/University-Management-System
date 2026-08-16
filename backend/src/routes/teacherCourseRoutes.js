const express = require("express");

const router = express.Router();

const teacherCourseController = require("../controllers/teacherCourseController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET My Courses (Teacher) - must be registered before the admin list route
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("teacher"),
    teacherCourseController.getMyCourses
);

// GET All Assignments (Admin)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    teacherCourseController.getAssignments
);

// ASSIGN Teacher To Course (Admin)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    teacherCourseController.assignTeacherCourse
);

// UNASSIGN Teacher From Course (Admin)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    teacherCourseController.unassignTeacherCourse
);

module.exports = router;
