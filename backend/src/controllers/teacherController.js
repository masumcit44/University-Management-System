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

// GET Teacher By ID
exports.getTeacherById = (req, res) => {
  const { id } = req.params;

  // A teacher can only ever open their own profile - not anyone else's
  if (
    req.user.role === "teacher" &&
    String(req.user.teacher_id) !== String(id)
  ) {
    return res.status(403).json({
      success: false,
      message: "Access Forbidden. You can only view your own profile.",
    });
  }

  Teacher.getTeacherById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Teacher Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: results[0],
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
    designation,
    gender,
    address,
    dob,
    joining_date,
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
    designation || null,
    gender || null,
    address || null,
    dob || null,
    joining_date || null,
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

// UPDATE Teacher
exports.updateTeacher = (req, res) => {
  const { id } = req.params;

  const {
    teacher_name,
    teacher_email,
    teacher_phone,
    department_id,
    designation,
    gender,
    address,
    dob,
    joining_date,
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

  Teacher.updateTeacher(
    id,
    teacher_name,
    teacher_email,
    teacher_phone,
    department_id,
    designation || null,
    gender || null,
    address || null,
    dob || null,
    joining_date || null,
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(200).json({
        success: true,
        message: "Teacher Updated Successfully",
      });
    }
  );
};

// DELETE Teacher
exports.deleteTeacher = (req, res) => {
  const { id } = req.params;

  Teacher.deleteTeacher(id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Teacher Deleted Successfully",
    });
  });
};