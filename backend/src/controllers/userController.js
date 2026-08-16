const User = require("../models/userModel");
const auditService = require("../services/auditService");
const { resetPassword } = require("../services/authService");

// GET All Users
exports.getUsers = (req, res) => {

    User.getAllUsers((err, results) => {

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

// UPDATE User Role
exports.updateUserRole = (req, res) => {

    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "teacher", "student"];

    if (!role || !validRoles.includes(role)) {
        return res.status(400).json({
            success: false,
            message: "Valid role is required (admin, teacher, student)"
        });
    }

    // Never let an admin demote their own account - that would lock
    // them out of the system permanently.
    if (req.user && String(req.user.user_id) === String(id)) {
        return res.status(400).json({
            success: false,
            message: "You Cannot Change Your Own Role"
        });
    }

    // Read the current role first so the change is fully auditable
    User.findUserById(id, (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const oldRole = rows[0].role;

        User.updateUserRole(id, role, (err2) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            auditService.log(
                req.user,
                "user.role.update",
                "users",
                id,
                { from: oldRole, to: role },
                req.ip
            );

            res.status(200).json({
                success: true,
                message: "User Role Updated Successfully"
            });

        });

    });

};

// DELETE User
exports.deleteUser = (req, res) => {

    const { id } = req.params;

    // Prevent Admin From Deleting Their Own Account
    if (req.user && String(req.user.user_id) === String(id)) {
        return res.status(400).json({
            success: false,
            message: "You Cannot Delete Your Own Account"
        });
    }

    // Read the username first so the deletion is fully auditable
    User.findUserById(id, (err, rows) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const username = rows[0].username;

        User.deleteUser(id, (err2) => {

            if (err2) {
                return res.status(500).json({
                    success: false,
                    message: err2.message
                });
            }

            auditService.log(
                req.user,
                "user.delete",
                "users",
                id,
                { username },
                req.ip
            );

            res.status(200).json({
                success: true,
                message: "User Deleted Successfully"
            });

        });

    });

};

// RESET User Password (Admin Only)
exports.resetUserPassword = (req, res) => {

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            message: "New password must be at least 6 characters"
        });
    }

    resetPassword(id, newPassword, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        auditService.log(
            req.user,
            "user.password.reset",
            "users",
            id,
            null,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: "Password Reset Successfully"
        });

    });

};