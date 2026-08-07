const db = require("../config/db");

const Department = {

  // =======================
  // Get All Departments
  // =======================
  getAllDepartments: (callback) => {
    const sql = "SELECT * FROM departments ORDER BY department_id ASC";
    db.query(sql, callback);
  },

  // =======================
  // Create Department
  // =======================
  createDepartment: (
    department_name,
    department_code,
    callback
  ) => {

    const sql =
      "INSERT INTO departments (department_name, department_code) VALUES (?, ?)";

    db.query(
      sql,
      [department_name, department_code],
      callback
    );

  },

  // =======================
  // Update Department
  // =======================
  updateDepartment: (
    id,
    department_name,
    department_code,
    callback
  ) => {

    const sql =
      "UPDATE departments SET department_name = ?, department_code = ? WHERE department_id = ?";

    db.query(
      sql,
      [department_name, department_code, id],
      callback
    );

  },

  // =======================
  // Delete Department
  // =======================
  deleteDepartment: (
    id,
    callback
  ) => {

    const sql =
      "DELETE FROM departments WHERE department_id = ?";

    db.query(sql, [id], callback);

  }

};

module.exports = Department;