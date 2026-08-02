const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");

// GET
router.get("/", departmentController.getDepartments);

// POST  ← এই লাইন যোগ করো
router.post("/", departmentController.createDepartment);

module.exports = router;