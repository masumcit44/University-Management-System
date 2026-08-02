const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");

// GET
router.get("/", enrollmentController.getEnrollments);

// POST
router.post("/", enrollmentController.createEnrollment);

module.exports = router;