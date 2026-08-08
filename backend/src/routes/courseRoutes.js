const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET All (Any Authenticated Role)
router.get("/", authMiddleware, courseController.getCourses);

// GET By ID (Any Authenticated Role)
router.get("/:id", authMiddleware, courseController.getCourseById);

// POST (Admin Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    courseController.createCourse
);

// UPDATE (Admin Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    courseController.updateCourse
);

// DELETE (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    courseController.deleteCourse
);

module.exports = router;