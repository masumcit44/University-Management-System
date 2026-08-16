const {
    registerUser,
    loginUser,
    changePassword
} = require("../services/authService");

const auditService = require("../services/auditService");

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

// Change Own Password (Authenticated)
exports.changePassword = (req, res) => {

    const {
        currentPassword,
        newPassword
    } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            message: "Current and new password are required"
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters"
        });
    }

    changePassword(
        req.user.user_id,
        currentPassword,
        newPassword,
        (err) => {

            if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            auditService.log(
                req.user,
                "auth.password.change",
                "users",
                req.user.user_id,
                null,
                req.ip
            );

            res.status(200).json({
                success: true,
                message: "Password Changed Successfully"
            });

        }
    );

};