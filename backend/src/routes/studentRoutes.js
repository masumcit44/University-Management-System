const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");

// GET
router.get("/", studentController.getStudents);

// POST
router.post("/", studentController.createStudent);

module.exports = router;