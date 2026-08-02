const Teacher = require("../models/teacherModel");

// GET All Teachers
exports.getTeachers = (req, res) => {
  Teacher.getAllTeachers((err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      data: results,
    });
  });
};

// CREATE Teacher
exports.createTeacher = (req, res) => {
  const {
    teacher_name,
    teacher_email,
    teacher_phone,
    department_id,
  } = req.body;

  if (
    !teacher_name ||
    !teacher_email ||
    !teacher_phone ||
    !department_id
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  Teacher.createTeacher(
    teacher_name,
    teacher_email,
    teacher_phone,
    department_id,
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Teacher Created Successfully",
      });
    }
  );
};