const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET Dashboard (Admin Only)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    dashboardController.getDashboard
);

module.exports = router;