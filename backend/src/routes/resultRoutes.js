const express = require("express");

const router = express.Router();

const resultController = require("../controllers/resultController");

// GET
router.get("/", resultController.getResults);

// POST
router.post("/", resultController.createResult);

module.exports = router;