module.exports = (req, res, next) => {

    const {

        student_id,
        course_id,
        mid_marks,
        assignment_marks,
        quiz_marks,
        final_marks

    } = req.body;


    if (
        !student_id ||
        !course_id ||
        mid_marks === undefined ||
        assignment_marks === undefined ||
        quiz_marks === undefined ||
        final_marks === undefined
    ) {

        return res.status(400).json({

            success: false,
            message: "All fields are required."

        });

    }


    next();

};