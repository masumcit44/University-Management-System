const express = require("express");

const router = express.Router();

const resultController = require("../controllers/resultController");
const validateResult = require("../middlewares/validateResult");

// GET Results
router.get("/", resultController.getResults);

// CREATE Result
router.post(
    "/",
    validateResult,
    resultController.createResult
);

module.exports = router;