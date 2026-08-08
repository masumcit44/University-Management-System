const express = require("express");
const router = express.Router();

const examController = require("../controllers/examController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET All (Any Authenticated Role - students/teachers need to see exam schedules)
router.get("/", authMiddleware, examController.getExams);

// GET By ID (Any Authenticated Role)
router.get("/:id", authMiddleware, examController.getExamById);

// POST (Admin & Teacher Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    examController.createExam
);

// PUT (Admin & Teacher Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    examController.updateExam
);

// DELETE (Admin & Teacher Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    examController.deleteExam
);

module.exports = router;