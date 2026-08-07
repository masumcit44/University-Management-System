const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");

// Get All
router.get("/", departmentController.getDepartments);

// Create
router.post("/", departmentController.createDepartment);

// Update
router.put("/:id", departmentController.updateDepartment);

// Delete
router.delete("/:id", departmentController.deleteDepartment);

module.exports = router;