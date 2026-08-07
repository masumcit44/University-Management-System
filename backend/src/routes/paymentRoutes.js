const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");

// GET All Payments (Admin view)
router.get("/", authMiddleware, paymentController.getPayments);

// GET Payments By Student (Student's own history)
router.get("/student/:student_id", authMiddleware, paymentController.getPaymentsByStudent);

// GET Payment By ID
router.get("/:id", authMiddleware, paymentController.getPaymentById);

// CREATE Payment
router.post("/", authMiddleware, paymentController.createPayment);

// UPDATE Payment
router.put("/:id", authMiddleware, paymentController.updatePayment);

// DELETE Payment
router.delete("/:id", authMiddleware, paymentController.deletePayment);

module.exports = router;