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
        t.designation,
        t.gender,
        t.address,
        t.dob,
        t.joining_date,
        t.department_id,
        d.department_name
      FROM teachers t
      JOIN departments d
      ON t.department_id = d.department_id
    `;

    db.query(sql, callback);
  },

  // Get Teacher By ID
  getTeacherById: (id, callback) => {
    const sql = `
      SELECT
        t.teacher_id,
        t.teacher_name,
        t.teacher_email,
        t.teacher_phone,
        t.designation,
        t.gender,
        t.address,
        t.dob,
        t.joining_date,
        t.department_id,
        d.department_name
      FROM teachers t
      JOIN departments d
      ON t.department_id = d.department_id
      WHERE t.teacher_id = ?
    `;

    db.query(sql, [id], callback);
  },

  // Create Teacher
  createTeacher: (
    teacher_name,
    teacher_email,
    teacher_phone,
    department_id,
    designation,
    gender,
    address,
    dob,
    joining_date,
    callback
  ) => {

    const sql = `
      INSERT INTO teachers
      (teacher_name, teacher_email, teacher_phone, department_id, designation, gender, address, dob, joining_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [
        teacher_name,
        teacher_email,
        teacher_phone,
        department_id,
        designation,
        gender,
        address,
        dob,
        joining_date
      ],
      callback
    );
  },

  // Update Teacher
  updateTeacher: (
    id,
    teacher_name,
    teacher_email,
    teacher_phone,
    department_id,
    designation,
    gender,
    address,
    dob,
    joining_date,
    callback
  ) => {

    const sql = `
      UPDATE teachers
      SET teacher_name = ?, teacher_email = ?, teacher_phone = ?, department_id = ?, designation = ?, gender = ?, address = ?, dob = ?, joining_date = ?
      WHERE teacher_id = ?
    `;

    db.query(
      sql,
      [
        teacher_name,
        teacher_email,
        teacher_phone,
        department_id,
        designation,
        gender,
        address,
        dob,
        joining_date,
        id
      ],
      callback
    );
  },

  // Delete Teacher
  deleteTeacher: (id, callback) => {
    const sql = "DELETE FROM teachers WHERE teacher_id = ?";
    db.query(sql, [id], callback);
  },

  // =======================
  // Find Teacher By Email (used to link a login account)
  // =======================
  findTeacherByEmail: (email, callback) => {

    const sql = `
      SELECT teacher_id, teacher_email
      FROM teachers
      WHERE teacher_email = ?
    `;

    db.query(sql, [email], callback);
  },

  // =======================
  // Link a User Account to a Teacher Record
  // =======================
  linkUserToTeacher: (teacher_id, user_id, callback) => {

    const sql = `
      UPDATE teachers
      SET user_id = ?
      WHERE teacher_id = ?
    `;

    db.query(sql, [user_id, teacher_id], callback);
  },

  // =======================
  // Find Teacher By User ID (used at login to embed teacher_id in JWT)
  // =======================
  findTeacherByUserId: (user_id, callback) => {

    const sql = `
      SELECT teacher_id
      FROM teachers
      WHERE user_id = ?
    `;

    db.query(sql, [user_id], callback);
  }

};

module.exports = Teacher;