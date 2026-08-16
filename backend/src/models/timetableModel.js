const db = require("../config/db");

const Timetable = {

    // =======================
    // Get All Timetable Entries
    // =======================
    getAllTimetable: (callback) => {
        const sql = `
            SELECT
                timetable.timetable_id,
                timetable.room_no,
                timetable.day,
                timetable.start_time,
                timetable.end_time,
                courses.course_id,
                courses.course_name,
                courses.course_code,
                teachers.teacher_id,
                teachers.teacher_name
            FROM timetable
            JOIN courses
            ON timetable.course_id = courses.course_id
            JOIN teachers
            ON timetable.teacher_id = teachers.teacher_id
            ORDER BY
                FIELD(timetable.day, 'Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'),
                timetable.start_time
        `;

        db.query(sql, callback);
    },

    // =======================
    // Get Timetable By ID
    // =======================
    getTimetableById: (id, callback) => {
        const sql = `
            SELECT
                timetable.timetable_id,
                timetable.room_no,
                timetable.day,
                timetable.start_time,
                timetable.end_time,
                timetable.course_id,
                timetable.teacher_id,
                courses.course_name,
                teachers.teacher_name
            FROM timetable
            JOIN courses
            ON timetable.course_id = courses.course_id
            JOIN teachers
            ON timetable.teacher_id = teachers.teacher_id
            WHERE timetable.timetable_id = ?
        `;

        db.query(sql, [id], callback);
    },

    // =======================
    // Get Timetable By Teacher (Teacher's own schedule)
    // =======================
    getTimetableByTeacher: (teacher_id, callback) => {
        const sql = `
            SELECT
                MIN(timetable.timetable_id) AS timetable_id,
                timetable.course_id,
                timetable.teacher_id,
                timetable.room_no,
                NULLIF(SUBSTRING_INDEX(timetable.room_no, '-', 1), timetable.room_no) AS building,
                timetable.day,
                timetable.start_time,
                timetable.end_time,
                courses.course_name,
                courses.course_code,
                courses.credit,
                courses.semester AS course_semester,
                departments.department_name,
                teachers.teacher_name,
                teachers.teacher_email
            FROM timetable
            JOIN courses
                ON timetable.course_id = courses.course_id
            JOIN departments
                ON courses.department_id = departments.department_id
            JOIN teachers
                ON timetable.teacher_id = teachers.teacher_id
            WHERE timetable.teacher_id = ?
            GROUP BY
                timetable.course_id, timetable.teacher_id, timetable.room_no,
                timetable.day, timetable.start_time, timetable.end_time,
                courses.course_name, courses.course_code, courses.credit,
                courses.semester, departments.department_name,
                teachers.teacher_name, teachers.teacher_email
            ORDER BY
                FIELD(timetable.day, 'Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'),
                timetable.start_time
        `;

        db.query(sql, [teacher_id], callback);
    },

    // =======================
    // Get Timetable By Course
    // =======================
    getTimetableByCourse: (course_id, callback) => {
        const sql = `
            SELECT
                timetable.timetable_id,
                timetable.room_no,
                timetable.day,
                timetable.start_time,
                timetable.end_time,
                teachers.teacher_name
            FROM timetable
            JOIN teachers
            ON timetable.teacher_id = teachers.teacher_id
            WHERE timetable.course_id = ?
            ORDER BY
                FIELD(timetable.day, 'Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'),
                timetable.start_time
        `;

        db.query(sql, [course_id], callback);
    },

    // =======================
    // Get Timetable By Student (via their enrollments - a student's
    // schedule is the union of every course they're enrolled in).
    // Only APPROVED enrollments count as "active" - pending/rejected
    // requests are excluded so a student never sees classes they are
    // not yet part of.
    // =======================
    getTimetableByStudent: (student_id, callback) => {
        const sql = `
            SELECT
                MIN(timetable.timetable_id) AS timetable_id,
                timetable.course_id,
                timetable.teacher_id,
                timetable.room_no,
                NULLIF(SUBSTRING_INDEX(timetable.room_no, '-', 1), timetable.room_no) AS building,
                timetable.day,
                timetable.start_time,
                timetable.end_time,
                courses.course_name,
                courses.course_code,
                courses.credit,
                courses.semester AS course_semester,
                departments.department_name,
                teachers.teacher_name,
                teachers.teacher_email,
                enrollments.semester AS enrolled_semester,
                enrollments.session,
                enrollments.status AS enrollment_status
            FROM timetable
            JOIN courses
                ON timetable.course_id = courses.course_id
            JOIN departments
                ON courses.department_id = departments.department_id
            JOIN teachers
                ON timetable.teacher_id = teachers.teacher_id
            JOIN enrollments
                ON enrollments.course_id = timetable.course_id
            WHERE enrollments.student_id = ?
                AND enrollments.status = 'approved'
            GROUP BY
                timetable.course_id, timetable.teacher_id, timetable.room_no,
                timetable.day, timetable.start_time, timetable.end_time,
                courses.course_name, courses.course_code, courses.credit,
                courses.semester, departments.department_name,
                teachers.teacher_name, teachers.teacher_email,
                enrollments.semester, enrollments.session, enrollments.status
            ORDER BY
                FIELD(timetable.day, 'Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'),
                timetable.start_time
        `;

        db.query(sql, [student_id], callback);
    },

    // =======================
    // Create Timetable Entry
    // =======================
    createTimetable: (
        course_id,
        teacher_id,
        room_no,
        day,
        start_time,
        end_time,
        callback
    ) => {

        const sql = `
            INSERT INTO timetable
            (course_id, teacher_id, room_no, day, start_time, end_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [course_id, teacher_id, room_no, day, start_time, end_time],
            callback
        );
    },

    // =======================
    // Update Timetable Entry
    // =======================
    updateTimetable: (
        id,
        course_id,
        teacher_id,
        room_no,
        day,
        start_time,
        end_time,
        callback
    ) => {

        const sql = `
            UPDATE timetable
            SET course_id = ?, teacher_id = ?, room_no = ?, day = ?, start_time = ?, end_time = ?
            WHERE timetable_id = ?
        `;

        db.query(
            sql,
            [course_id, teacher_id, room_no, day, start_time, end_time, id],
            callback
        );
    },

    // =======================
    // Delete Timetable Entry
    // =======================
    deleteTimetable: (id, callback) => {
        const sql =
            "DELETE FROM timetable WHERE timetable_id = ?";

        db.query(sql, [id], callback);
    }

};

module.exports = Timetable;