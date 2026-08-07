const db = require("../config/db");

const Payment = {

    // =======================
    // Get All Payments
    // =======================
    getAllPayments: (callback) => {
        const sql = `
            SELECT
                payments.payment_id,
                payments.student_id,
                students.student_name,
                payments.amount,
                payments.status,
                payments.payment_date,
                payments.method
            FROM payments
            JOIN students
            ON payments.student_id = students.student_id
            ORDER BY payments.payment_date DESC
        `;

        db.query(sql, callback);
    },

    // =======================
    // Get Payment By ID
    // =======================
    getPaymentById: (id, callback) => {
        const sql = `
            SELECT
                payments.payment_id,
                payments.student_id,
                students.student_name,
                payments.amount,
                payments.status,
                payments.payment_date,
                payments.method
            FROM payments
            JOIN students
            ON payments.student_id = students.student_id
            WHERE payments.payment_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // =======================
    // Get Payments By Student (for Student's own payment history)
    // =======================
    getPaymentsByStudent: (student_id, callback) => {
        const sql = `
            SELECT
                payment_id,
                student_id,
                amount,
                status,
                payment_date,
                method
            FROM payments
            WHERE student_id = ?
            ORDER BY payment_date DESC
        `;

        db.query(sql, [student_id], callback);
    },

    // =======================
    // Create Payment
    // =======================
    createPayment: (
        student_id,
        amount,
        status,
        method,
        callback
    ) => {

        const sql = `
            INSERT INTO payments
            (student_id, amount, status, method)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [student_id, amount, status, method],
            callback
        );
    },

    // =======================
    // Update Payment
    // =======================
    updatePayment: (
        id,
        amount,
        status,
        method,
        callback
    ) => {

        const sql = `
            UPDATE payments
            SET amount = ?, status = ?, method = ?
            WHERE payment_id = ?
        `;

        db.query(
            sql,
            [amount, status, method, id],
            callback
        );
    },

    // =======================
    // Delete Payment
    // =======================
    deletePayment: (id, callback) => {
        const sql =
            "DELETE FROM payments WHERE payment_id = ?";

        db.query(sql, [id], callback);
    }

};

module.exports = Payment;