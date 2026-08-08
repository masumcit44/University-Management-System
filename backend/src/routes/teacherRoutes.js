const express = require("express");
const router = express.Router();

const teacherController = require("../controllers/teacherController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET All Teachers (Admin Only)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    teacherController.getTeachers
);

// GET Teacher By ID (Admin & Teacher - teacher ownership checked in controller)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    teacherController.getTeacherById
);

// CREATE Teacher (Admin Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    teacherController.createTeacher
);

// UPDATE Teacher (Admin Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    teacherController.updateTeacher
);

// DELETE Teacher (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    teacherController.deleteTeacher
);

module.exports = router;