const express = require("express");

const router = express.Router();

const userController = require("../controllers/userController");

const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// GET All Users (Admin Only)
router.get(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    userController.getUsers
);

// UPDATE User Role (Admin Only)
router.put(
    "/:id/role",
    authMiddleware,
    roleMiddleware("admin"),
    userController.updateUserRole
);

// DELETE User (Admin Only)
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    userController.deleteUser
);

// RESET User Password (Admin Only)
router.post(
    "/:id/reset-password",
    authMiddleware,
    roleMiddleware("admin"),
    userController.resetUserPassword
);

module.exports = router;