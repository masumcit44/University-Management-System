const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET All
router.get("/", authMiddleware, studentController.getStudents);

// GET By ID
router.get("/:id", authMiddleware, studentController.getStudentById);

// POST
router.post("/", authMiddleware, studentController.createStudent);

// PUT
router.put("/:id", authMiddleware, studentController.updateStudent);

// DELETE
router.delete("/:id", authMiddleware, studentController.deleteStudent);

module.exports = router;