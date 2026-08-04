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

    }

};

module.exports = User;