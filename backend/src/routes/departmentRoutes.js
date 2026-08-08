const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Get All (Any Authenticated Role)
router.get("/", authMiddleware, departmentController.getDepartments);

// Get By ID (Any Authenticated Role)
router.get("/:id", authMiddleware, departmentController.getDepartmentById);

// Create (Admin Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    departmentController.createDepartment
);

// Update (Admin Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    departmentController.updateDepartment
);

// Delete (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    departmentController.deleteDepartment
);

module.exports = router;