const db = require("../config/db");

const Teacher = {

  // Get All Teachers
  getAllTeachers: (callback) => {
    const sql = `
      SELECT
        t.teacher_id,
        t.teacher_name,
        t.teacher_email,
        t.teacher_phone,
        d.department_name
      FROM teachers t
      JOIN departments d
      ON t.department_id = d.department_id
    `;

    db.query(sql, callback);
  },

  // Create Teacher
  createTeacher: (
    teacher_name,
    teacher_email,
    teacher_phone,
    department_id,
    callback
  ) => {

    const sql = `
      INSERT INTO teachers
      (teacher_name, teacher_email, teacher_phone, department_id)
      VALUES (?, ?, ?, ?)
    `;

    db.query(
      sql,
      [teacher_name, teacher_email, teacher_phone, department_id],
      callback
    );
  }

};

module.exports = Teacher;