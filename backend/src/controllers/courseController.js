const Course = require("../models/courseModel");

// GET Courses
exports.getCourses = (req, res) => {

    Course.getCourses((err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err
            });
        }

        res.json({
            success: true,
            data: results
        });

    });

};

// GET Course By ID
exports.getCourseById = (req, res) => {

    const { id } = req.params;

    Course.getCourseById(id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Course Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: results[0]
        });

    });

};

// CREATE Course
exports.createCourse = (req, res) => {

    const {
        course_name,
        course_code,
        credit,
        semester,
        department_id
    } = req.body;

    if (
        !course_name ||
        !course_code ||
        !credit ||
        !semester ||
        !department_id
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Course.createCourse(
        course_name,
        course_code,
        credit,
        semester,
        department_id,
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err
                });
            }

            res.status(201).json({
                success: true,
                message: "Course Created Successfully"
            });

        }
    );

};

// UPDATE Course
exports.updateCourse = (req, res) => {

    const { id } = req.params;

    const {
        course_name,
        course_code,
        credit,
        semester,
        department_id
    } = req.body;

    if (
        !course_name ||
        !course_code ||
        !credit ||
        !semester ||
        !department_id
    ) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    Course.updateCourse(
        id,
        course_name,
        course_code,
        credit,
        semester,
        department_id,
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                message: "Course Updated Successfully"
            });

        }
    );

};

// DELETE Course
exports.deleteCourse = (req, res) => {

    const { id } = req.params;

    Course.deleteCourse(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            message: "Course Deleted Successfully"
        });

    });

};