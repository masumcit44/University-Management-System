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
// GET Department By ID
// =======================
exports.getDepartmentById = (req, res) => {
  const { id } = req.params;

  Department.getDepartmentById(id, (err, results) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Department Not Found",
      });
    }

    res.status(200).json({
      success: true,
      data: results[0],
    });
  });
};

// =======================
// CREATE Department
// =======================
exports.createDepartment = (req, res) => {
  const { department_name, department_code, department_head } = req.body;

  if (!department_name || !department_code) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  Department.createDepartment(
    department_name,
    department_code,
    department_head || null,
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
  const { department_name, department_code, department_head } = req.body;

  if (!department_name || !department_code) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  Department.updateDepartment(
    id,
    department_name,
    department_code,
    department_head || null,
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
