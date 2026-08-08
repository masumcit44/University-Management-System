const express = require("express");

const router = express.Router();

const predictionController = require("../controllers/predictionController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET Cohort Overview (Admin & Teacher Only)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    predictionController.getCohortPrediction
);

// GET Student Performance Prediction (Admin & Teacher Only)
router.get(
    "/:student_id",
    authMiddleware,
    roleMiddleware("admin", "teacher"),
    predictionController.getStudentPrediction
);

module.exports = router;