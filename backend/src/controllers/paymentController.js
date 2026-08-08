const Payment = require("../models/paymentModel");

// =======================
// GET All Payments (Admin only - route already enforces this,
// this is a defense-in-depth check)
// =======================
exports.getPayments = (req, res) => {

    Payment.getAllPayments((err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });

    });

};

// =======================
// GET Payment By ID
// =======================
exports.getPaymentById = (req, res) => {

    const { id } = req.params;

    Payment.getPaymentById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment Not Found"
            });
        }

        const payment = results[0];

        // A student can only open their own payment record
        if (
            req.user.role === "student" &&
            String(req.user.student_id) !== String(payment.student_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "Access Forbidden. This is not your payment record."
            });
        }

        res.status(200).json({
            success: true,
            data: payment
        });

    });

};

// =======================
// GET Payments By Student
// =======================
exports.getPaymentsByStudent = (req, res) => {

    const { student_id } = req.params;

    // A student can only pull their own payment history
    if (
        req.user.role === "student" &&
        String(req.user.student_id) !== String(student_id)
    ) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. You can only view your own payments."
        });
    }

    Payment.getPaymentsByStudent(student_id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });

    });

};

// =======================
// CREATE Payment (Admin only - enforced at route level)
// =======================
exports.createPayment = (req, res) => {

    const {
        student_id,
        amount,
        status,
        method
    } = req.body;

    if (!student_id || !amount) {
        return res.status(400).json({
            success: false,
            message: "student_id and amount are required"
        });
    }

    Payment.createPayment(
        student_id,
        amount,
        status || "Pending",
        method || null,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Payment Created Successfully"
            });

        }
    );

};

// =======================
// UPDATE Payment (Admin only - enforced at route level)
// =======================
exports.updatePayment = (req, res) => {

    const { id } = req.params;

    const {
        amount,
        status,
        method
    } = req.body;

    if (!amount || !status) {
        return res.status(400).json({
            success: false,
            message: "amount and status are required"
        });
    }

    Payment.updatePayment(
        id,
        amount,
        status,
        method || null,
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Payment Updated Successfully"
            });

        }
    );

};

// =======================
// DELETE Payment (Admin only - enforced at route level)
// =======================
exports.deletePayment = (req, res) => {

    const { id } = req.params;

    Payment.deletePayment(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Payment Deleted Successfully"
        });

    });

};