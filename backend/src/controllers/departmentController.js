const Department = require("../models/departmentModel");

// =======================
// GET All Departments
// =======================
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

// =======================
// CREATE Department
// =======================
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
    (err) => {
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

// =======================
// UPDATE Department
// =======================
exports.updateDepartment = (req, res) => {
  const { id } = req.params;
  const { department_name, department_code } = req.body;

  Department.updateDepartment(
    id,
    department_name,
    department_code,
    (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      res.status(200).json({
        success: true,
        message: "Department Updated Successfully",
      });
    }
  );
};

// =======================
// DELETE Department
// =======================
exports.deleteDepartment = (req, res) => {
  const { id } = req.params;

  Department.deleteDepartment(id, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    res.status(200).json({
      success: true,
      message: "Department Deleted Successfully",
    });
  });
};