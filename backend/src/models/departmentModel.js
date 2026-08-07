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
  // Get Department By ID
  // =======================
  getDepartmentById: (id, callback) => {
    const sql = "SELECT * FROM departments WHERE department_id = ?";
    db.query(sql, [id], callback);
  },

  // =======================
  // Create Department
  // =======================
  createDepartment: (
    department_name,
    department_code,
    department_head,
    callback
  ) => {

    const sql =
      "INSERT INTO departments (department_name, department_code, department_head) VALUES (?, ?, ?)";

    db.query(
      sql,
      [department_name, department_code, department_head],
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
    department_head,
    callback
  ) => {

    const sql =
      "UPDATE departments SET department_name = ?, department_code = ?, department_head = ? WHERE department_id = ?";

    db.query(
      sql,
      [department_name, department_code, department_head, id],
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
