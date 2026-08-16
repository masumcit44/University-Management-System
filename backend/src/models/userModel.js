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

    // Find User By ID
    findUserById: (id, callback) => {

        const sql = `
            SELECT
                user_id,
                username,
                email,
                role,
                password,
                is_active
            FROM users
            WHERE user_id = ?
        `;

        db.query(sql, [id], callback);

    },

    // Fetch a user together with their linked student/teacher record.
    // Used by authMiddleware so every request sees fresh role + owner state.
    findUserWithOwner: (userId, callback) => {

        const sql = `
            SELECT
                u.user_id,
                u.username,
                u.email,
                u.role,
                u.is_active,
                u.created_at,
                s.student_id,
                t.teacher_id
            FROM users u
            LEFT JOIN students s ON s.user_id = u.user_id
            LEFT JOIN teachers t ON t.user_id = u.user_id
            WHERE u.user_id = ?
        `;

        db.query(sql, [userId], callback);

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

    },

    // Update Password (change / admin reset)
    updatePassword: (userId, hashedPassword, callback) => {

        const sql = "UPDATE users SET password = ? WHERE user_id = ?";
        db.query(sql, [hashedPassword, userId], callback);

    },

    // Update Last Login Time
    updateLastLogin: (userId, callback) => {

        const sql = "UPDATE users SET last_login_at = NOW() WHERE user_id = ?";
        db.query(sql, [userId], callback);

    }

};

module.exports = User;