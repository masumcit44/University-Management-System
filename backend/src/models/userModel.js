const db = require("../config/db");

const User = {

    // Create User
    createUser: (
        username,
        email,
        password,
        role,
        callback
    ) => {

        const sql = `
            INSERT INTO users
            (
                username,
                email,
                password,
                role
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [
                username,
                email,
                password,
                role
            ],
            callback
        );

    },

    // Find User By Email
    findUserByEmail: (email, callback) => {

        const sql = `
            SELECT *
            FROM users
            WHERE email = ?
        `;

        db.query(sql, [email], callback);

    },

    // Get All Users (Admin Panel)
    getAllUsers: (callback) => {

        const sql = `
            SELECT
                user_id,
                username,
                email,
                role,
                created_at
            FROM users
            ORDER BY created_at DESC
        `;

        db.query(sql, callback);

    },

    // Update User Role (Admin Panel)
    updateUserRole: (id, role, callback) => {

        const sql = `
            UPDATE users
            SET role = ?
            WHERE user_id = ?
        `;

        db.query(sql, [role, id], callback);

    },

    // Delete User (Admin Panel)
    deleteUser: (id, callback) => {

        const sql = "DELETE FROM users WHERE user_id = ?";
        db.query(sql, [id], callback);

    }

};

module.exports = User;