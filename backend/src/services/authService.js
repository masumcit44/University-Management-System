const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

// Register User
exports.registerUser = async (
    username,
    email,
    password,
    role,
    callback
) => {

    try {

        // Check Existing User
        User.findUserByEmail(email, async (err, results) => {

            if (err) {
                return callback(err, null);
            }

            if (results.length > 0) {
                return callback(
                    new Error("Email already exists"),
                    null
                );
            }

            // Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Save User
            User.createUser(
                username,
                email,
                hashedPassword,
                role,
                callback
            );

        });

    } catch (error) {

        callback(error, null);

    }

};

// Login User
exports.loginUser = (email, password, callback) => {

    User.findUserByEmail(email, async (err, results) => {

        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(new Error("Invalid Email or Password"), null);
        }

        const user = results[0];

        // Compare Password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return callback(new Error("Invalid Email or Password"), null);
        }

        // Generate Token
        const token = jwt.sign(

            {
                user_id: user.user_id,
                role: user.role
            },

            process.env.JWT_SECRET || "mysecretkey",

            {
                expiresIn: "7d"
            }

        );

        callback(null, {
            token,
            user
        });

    });

};