const { getStudentCGPA } = require("../services/cgpaService");

// GET Student CGPA
exports.getStudentCGPA = (req, res) => {

    const { student_id } = req.params;

    getStudentCGPA(student_id, (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Student Result Not Found"
            });
        }

        res.status(200).json({
            success: true,
            data: result
        });

    });

};