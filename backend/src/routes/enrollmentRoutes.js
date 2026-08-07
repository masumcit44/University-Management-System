const express = require("express");
const router = express.Router();

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET
router.get("/", authMiddleware, enrollmentController.getEnrollments);

// GET By ID
router.get("/:id", authMiddleware, enrollmentController.getEnrollmentById);

// POST
router.post("/", authMiddleware, enrollmentController.createEnrollment);

// UPDATE
router.put("/:id", authMiddleware, enrollmentController.updateEnrollment);

// DELETE
router.delete("/:id", authMiddleware, enrollmentController.deleteEnrollment);

module.exports = router;