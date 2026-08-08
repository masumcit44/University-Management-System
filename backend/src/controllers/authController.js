const {
    registerUser,
    loginUser
} = require("../services/authService");

// Register
exports.register = (req, res) => {

    const {
        username,
        email,
        password,
        role
    } = req.body;

    registerUser(
        username,
        email,
        password,
        role,
        (err, result) => {

            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "User Registered Successfully"
            });

        }
    );

};
// Login
exports.login = (req, res) => {

    const {
        email,
        password
    } = req.body;

    loginUser(
        email,
        password,
        (err, data) => {

            if (err) {
                return res.status(401).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Login Successful",
                token: data.token,
                user: {
                    user_id: data.user.user_id,
                    username: data.user.username,
                    email: data.user.email,
                    role: data.user.role,
                    student_id: data.user.student_id,
                    teacher_id: data.user.teacher_id
                }
            });

        }
    );

};