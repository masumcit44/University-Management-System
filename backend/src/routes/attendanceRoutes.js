const express = require("express");

const router = express.Router();

const attendanceController = require("../controllers/attendanceController");


// GET
router.get("/", attendanceController.getAttendance);

// POST
router.post("/", attendanceController.createAttendance);


module.exports = router;