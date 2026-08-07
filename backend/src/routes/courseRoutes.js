const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET All
router.get("/", authMiddleware, courseController.getCourses);

// GET By ID
router.get("/:id", authMiddleware, courseController.getCourseById);

// POST
router.post("/", authMiddleware, courseController.createCourse);

// UPDATE
router.put("/:id", authMiddleware, courseController.updateCourse);

// DELETE
router.delete("/:id", authMiddleware, courseController.deleteCourse);

module.exports = router;