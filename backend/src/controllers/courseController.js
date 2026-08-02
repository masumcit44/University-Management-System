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


// CREATE Course
exports.createCourse = (req, res) => {

    const {
        course_name,
        course_code,
        credit,
        department_id
    } = req.body;

    Course.createCourse(
        course_name,
        course_code,
        credit,
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