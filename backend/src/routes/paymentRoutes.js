const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET All Payments (Admin Only)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    paymentController.getPayments
);

// GET Payments By Student (Student's own history - ownership checked in controller)
router.get(
    "/student/:student_id",
    authMiddleware,
    roleMiddleware("admin", "student"),
    paymentController.getPaymentsByStudent
);

// GET Payment By ID (ownership checked in controller)
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "student"),
    paymentController.getPaymentById
);

// CREATE Payment (Admin Only)
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    paymentController.createPayment
);

// UPDATE Payment (Admin Only)
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    paymentController.updatePayment
);

// DELETE Payment (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    paymentController.deletePayment
);

module.exports = router;