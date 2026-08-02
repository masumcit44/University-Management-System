const Result = require("../models/resultModel");

const {
    calculateTotalMarks,
    calculateGrade
} = require("../services/gradeService");


// GET Results
exports.getResults = (req, res) => {

    Result.getResults((err, results) => {

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


// CREATE Result
exports.createResult = (req, res) => {

    const {

        student_id,
        course_id,

        mid_marks,
        assignment_marks,
        quiz_marks,
        final_marks

    } = req.body;


    // Business Logic
    const total_marks = calculateTotalMarks(

        mid_marks,
        assignment_marks,
        quiz_marks,
        final_marks

    );


    const {

        grade,
        grade_point

    } = calculateGrade(total_marks);


    Result.createResult(

        student_id,
        course_id,

        mid_marks,
        assignment_marks,
        quiz_marks,
        final_marks,

        total_marks,
        grade,
        grade_point,

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    success: false,
                    message: err.message

                });

            }

            res.status(201).json({

                success: true,
                message: "Result Created Successfully"

            });

        }

    );

};