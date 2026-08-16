const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const Student = require("../models/studentModel");
const Teacher = require("../models/teacherModel");

// Register User
exports.registerUser = async (
    username,
    email,
    password,
    role,
    callback
) => {

    try {

        // Public self-registration may only ever create a "student" or
        // "teacher" account. "admin" (or anything else) must NEVER be
        // accepted from this endpoint - otherwise anyone could POST
        // { role: "admin" } directly to the API and grant themselves
        // full access. Admin accounts are created another way (seeded
        // directly in the database / promoted by an existing admin via
        // PUT /users/:id/role), never through /auth/register.
        const ALLOWED_SELF_REGISTER_ROLES = ["student", "teacher"];

        if (!ALLOWED_SELF_REGISTER_ROLES.includes(role)) {
            return callback(
                new Error(
                    "Invalid role. Self-registration is only allowed for 'student' or 'teacher'."
                ),
                null
            );
        }

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

            // Student/Teacher accounts must match an existing record -
            // this is how we know WHICH student/teacher just logged in
            if (role === "student") {

                Student.findStudentByEmail(email, async (err, studentResults) => {

                    if (err) return callback(err, null);

                    if (studentResults.length === 0) {
                        return callback(
                            new Error(
                                "No student record found with this email. Ask your admin to add you as a student first."
                            ),
                            null
                        );
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);

                    User.createUser(username, email, hashedPassword, role, (err, result) => {

                        if (err) return callback(err, null);

                        const newUserId = result.insertId;

                        Student.linkUserToStudent(
                            studentResults[0].student_id,
                            newUserId,
                            (err) => {
                                if (err) return callback(err, null);
                                callback(null, { insertId: newUserId });
                            }
                        );
                    });

                });

            } else if (role === "teacher") {

                Teacher.findTeacherByEmail(email, async (err, teacherResults) => {

                    if (err) return callback(err, null);

                    if (teacherResults.length === 0) {
                        return callback(
                            new Error(
                                "No teacher record found with this email. Ask your admin to add you as a teacher first."
                            ),
                            null
                        );
                    }

                    const hashedPassword = await bcrypt.hash(password, 10);

                    User.createUser(username, email, hashedPassword, role, (err, result) => {

                        if (err) return callback(err, null);

                        const newUserId = result.insertId;

                        Teacher.linkUserToTeacher(
                            teacherResults[0].teacher_id,
                            newUserId,
                            (err) => {
                                if (err) return callback(err, null);
                                callback(null, { insertId: newUserId });
                            }
                        );
                    });

                });

            }

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

        // Disabled accounts are refused even with a correct password
        if (Number(user.is_active) !== 1) {
            return callback(
                new Error("Account is disabled. Please contact the administrator."),
                null
            );
        }

        // Track last successful login (non-blocking)
        User.updateLastLogin(user.user_id, () => {});

        // Look up which student/teacher record belongs to this user,
        // so the frontend/backend both know "who" this login actually is
        const attachOwnerId = (ownerKey, callbackInner) => {

            if (user.role === "student") {

                Student.findStudentByUserId(user.user_id, (err, rows) => {
                    if (err) return callbackInner(err);
                    ownerKey.student_id = rows.length > 0 ? rows[0].student_id : null;
                    callbackInner(null);
                });

            } else if (user.role === "teacher") {

                Teacher.findTeacherByUserId(user.user_id, (err, rows) => {
                    if (err) return callbackInner(err);
                    ownerKey.teacher_id = rows.length > 0 ? rows[0].teacher_id : null;
                    callbackInner(null);
                });

            } else {
                callbackInner(null);
            }

        };

        const owner = {};

        attachOwnerId(owner, (err) => {

            if (err) {
                return callback(err, null);
            }

            // Generate Token - student_id/teacher_id baked in so every
            // request already knows the owner without an extra DB lookup
            const token = jwt.sign(

                {
                    user_id: user.user_id,
                    role: user.role,
                    student_id: owner.student_id || null,
                    teacher_id: owner.teacher_id || null
                },

                process.env.JWT_SECRET || "mysecretkey",

                {
                    expiresIn: "7d"
                }

            );

            callback(null, {
                token,
                user: {
                    ...user,
                    student_id: owner.student_id || null,
                    teacher_id: owner.teacher_id || null
                }
            });

        });

    });

};

// Change Own Password (authenticated user)
exports.changePassword = async (
    userId,
    currentPassword,
    newPassword,
    callback
) => {

    try {

        User.findUserById(userId, async (err, results) => {

            if (err) return callback(err);

            if (results.length === 0) {
                return callback(new Error("User not found"), null);
            }

            const user = results[0];

            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return callback(new Error("Current password is incorrect"), null);
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            User.updatePassword(userId, hashedPassword, (err2) => {
                if (err2) return callback(err2);
                callback(null, { userId });
            });

        });

    } catch (error) {

        callback(error, null);

    }

};

// Reset Password (admin sets a new one without the old password)
exports.resetPassword = async (
    userId,
    newPassword,
    callback
) => {

    try {

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        User.updatePassword(userId, hashedPassword, (err) => {
            if (err) return callback(err);
            callback(null, { userId });
        });

    } catch (error) {

        callback(error, null);

    }

};