const Payment = require("../models/paymentModel");

// =======================
// GET All Payments
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

        res.status(200).json({
            success: true,
            data: results[0]
        });

    });

};

// =======================
// GET Payments By Student
// =======================
exports.getPaymentsByStudent = (req, res) => {

    const { student_id } = req.params;

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
// CREATE Payment
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
// UPDATE Payment
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
// DELETE Payment
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