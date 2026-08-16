const db = require("../config/db");

const TeacherCourse = {

    // Get All Assignments (Admin) - teacher + course names joined
    getAssignments: (callback) => {

        const sql = `
            SELECT
                tc.teacher_course_id,
                tc.teacher_id,
                tc.course_id,
                tc.assigned_at,
                t.teacher_name,
                t.teacher_email,
                c.course_name,
                c.course_code
            FROM teacher_courses tc
            JOIN teachers t
                ON tc.teacher_id = t.teacher_id
            JOIN courses c
                ON tc.course_id = c.course_id
            ORDER BY tc.assigned_at DESC
        `;

        db.query(sql, callback);
    },

    // Get Courses Assigned To A Teacher (Teacher "My Courses")
    getCoursesByTeacher: (teacher_id, callback) => {

        const sql = `
            SELECT
                c.course_id,
                c.course_name,
                c.course_code,
                c.credit,
                c.semester,
                c.department_id,
                d.department_name,
                tc.assigned_at
            FROM teacher_courses tc
            JOIN courses c
                ON tc.course_id = c.course_id
            JOIN departments d
                ON c.department_id = d.department_id
            WHERE tc.teacher_id = ?
            ORDER BY c.course_code
        `;

        db.query(sql, [teacher_id], callback);
    },

    // Ownership Check: is this teacher assigned to this course?
    isTeacherAssigned: (teacher_id, course_id, callback) => {

        const sql = `
            SELECT 1
            FROM teacher_courses
            WHERE teacher_id = ? AND course_id = ?
            LIMIT 1
        `;

        db.query(sql, [teacher_id, course_id], callback);
    },

    // Assign Teacher To A Course (Admin)
    assign: (teacher_id, course_id, callback) => {

        const sql = `
            INSERT INTO teacher_courses
            (teacher_id, course_id)
            VALUES (?, ?)
        `;

        db.query(sql, [teacher_id, course_id], callback);
    },

    // Unassign (Admin)
    unassign: (teacher_course_id, callback) => {

        const sql = "DELETE FROM teacher_courses WHERE teacher_course_id = ?";

        db.query(sql, [teacher_course_id], callback);
    }

};

module.exports = TeacherCourse;
