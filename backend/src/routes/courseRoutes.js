const express = require("express");
const router = express.Router();

const courseController = require("../controllers/courseController");

// GET
router.get("/", courseController.getCourses);

// POST
router.post("/", courseController.createCourse);

module.exports = router;