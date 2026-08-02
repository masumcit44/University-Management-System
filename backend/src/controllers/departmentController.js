const Department = require("../models/departmentModel");

// GET All Departments
exports.getDepartments = (req, res) => {
  Department.getAllDepartments((err, results) => {
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

// CREATE Department
exports.createDepartment = (req, res) => {
  const { department_name, department_code } = req.body;

  if (!department_name || !department_code) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  Department.createDepartment(
    department_name,
    department_code,
    (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(201).json({
        success: true,
        message: "Department Created Successfully",
      });
    }
  );
};