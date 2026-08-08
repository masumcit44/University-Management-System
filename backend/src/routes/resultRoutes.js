const express = require("express");

const router = express.Router();

const resultController = require("../controllers/resultController");
const validateResult = require("../middlewares/validateResult");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET Results (Admin & Teacher)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    resultController.getResults
);

// GET Result By ID (Admin, Teacher, Student - student ownership checked in controller)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher", "student"),
    resultController.getResultById
);

// CREATE Result (Admin & Teacher)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    validateResult,
    resultController.createResult
);

// UPDATE Result (Admin & Teacher)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    validateResult,
    resultController.updateResult
);

// DELETE Result (Admin & Teacher)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    resultController.deleteResult
);

module.exports = router;