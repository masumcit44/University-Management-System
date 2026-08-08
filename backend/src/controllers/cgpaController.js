const { getStudentCGPA } = require("../services/cgpaService");

// GET Student CGPA
exports.getStudentCGPA = (req, res) => {

    const { student_id } = req.params;

    // A student can only ever pull their own CGPA - not anyone else's
    if (
        req.user.role === "student" &&
        String(req.user.student_id) !== String(student_id)
    ) {
        return res.status(403).json({
            success: false,
            message: "Access Forbidden. You can only view your own CGPA."
        });
    }

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