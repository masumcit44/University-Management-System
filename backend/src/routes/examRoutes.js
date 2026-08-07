const express = require("express");
const router = express.Router();

const examController = require("../controllers/examController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET All
router.get("/", authMiddleware, examController.getExams);

// GET By ID
router.get("/:id", authMiddleware, examController.getExamById);

// POST
router.post("/", authMiddleware, examController.createExam);

// PUT
router.put("/:id", authMiddleware, examController.updateExam);

// DELETE
router.delete("/:id", authMiddleware, examController.deleteExam);

module.exports = router;