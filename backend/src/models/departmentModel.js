const db = require("../config/db");

const Department = {

    // Get All Departments
    getAllDepartments: (callback) => {
        const sql = "SELECT * FROM departments";
        db.query(sql, callback);
    },

    // Create Department
    createDepartment: (department_name, department_code, callback) => {
        const sql =
            "INSERT INTO departments (department_name, department_code) VALUES (?, ?)";

        db.query(sql, [department_name, department_code], callback);
    }

};

module.exports = Department;