const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middlewares/authMiddleware");

// Get All
router.get("/", authMiddleware, departmentController.getDepartments);

// Get By ID
router.get("/:id", authMiddleware, departmentController.getDepartmentById);

// Create
router.post("/", authMiddleware, departmentController.createDepartment);

// Update
router.put("/:id", authMiddleware, departmentController.updateDepartment);

// Delete
router.delete("/:id", authMiddleware, departmentController.deleteDepartment);

module.exports = router;