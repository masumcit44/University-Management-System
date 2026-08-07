const express = require("express");

const router = express.Router();

const resultController = require("../controllers/resultController");
const validateResult = require("../middlewares/validateResult");
const authMiddleware = require("../middlewares/authMiddleware");

// GET Results
router.get("/", authMiddleware, resultController.getResults);

// GET Result By ID
router.get("/:id", authMiddleware, resultController.getResultById);

// CREATE Result
router.post(
    "/",
    authMiddleware,
    validateResult,
    resultController.createResult
);

// UPDATE Result
router.put(
    "/:id",
    authMiddleware,
    validateResult,
    resultController.updateResult
);

// DELETE Result
router.delete("/:id", authMiddleware, resultController.deleteResult);

module.exports = router;