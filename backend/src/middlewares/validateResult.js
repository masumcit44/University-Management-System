module.exports = (req, res, next) => {

    const {

        enrollment_id,
        exam_id,
        marks_obtained

    } = req.body;


    if (
        !enrollment_id ||
        !exam_id ||
        marks_obtained === undefined
    ) {

        return res.status(400).json({

            success: false,
            message: "All fields are required."

        });

    }


    next();

};