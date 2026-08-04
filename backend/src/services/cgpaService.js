const CGPA = require("../models/cgpaModel");

exports.getStudentCGPA = (student_id, callback) => {

    CGPA.getStudentCGPA(student_id, (err, results) => {

        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, null);
        }

        callback(null, results[0]);

    });

};