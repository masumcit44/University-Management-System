const CGPA = require("../models/cgpaModel");

exports.getStudentCGPA = (student_id, callback) => {

    CGPA.getStudentCGPA(student_id, (err, results) => {

        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, null);
        }

        const summary = results[0];

        // Attach the per-course breakdown the CGPA was derived from
        CGPA.getStudentCourseGrades(student_id, (err, courses) => {

            if (err) {
                return callback(err, null);
            }

            callback(null, {
                ...summary,
                courses
            });

        });

    });

};
