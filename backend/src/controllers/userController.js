const User = require("../models/userModel");

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

    User.updateUserRole(id, role, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "User Role Updated Successfully"
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

    User.deleteUser(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "User Deleted Successfully"
        });

    });

};