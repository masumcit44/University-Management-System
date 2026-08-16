const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const TEACHER_ID = 1;
const STUDENT_ID = 1;
const DEPT_ID = 1;
const TEACHER_USER_ID = 2;
const SEMESTER = 5;
const SESSION = "2026";

const COURSES = [
    { code: "CSE201", name: "Data Structures", credit: "3.00", semester: SEMESTER },
    { code: "CSE203", name: "Database Management Systems", credit: "3.00", semester: SEMESTER },
    { code: "CSE305", name: "Operating Systems", credit: "3.00", semester: SEMESTER },
];

const TIMETABLE = {
    CSE201: [
        { room_no: "CSE Lab 2", day: "Sunday", start_time: "09:00:00", end_time: "10:30:00" },
        { room_no: "CSE Lab 2", day: "Wednesday", start_time: "11:00:00", end_time: "12:30:00" },
    ],
    CSE203: [
        { room_no: "CSE-301", day: "Monday", start_time: "09:00:00", end_time: "10:30:00" },
        { room_no: "CSE-301", day: "Thursday", start_time: "10:00:00", end_time: "11:30:00" },
    ],
    CSE305: [
        { room_no: "CSE Lab 1", day: "Tuesday", start_time: "09:00:00", end_time: "10:30:00" },
        { room_no: "CSE Lab 1", day: "Wednesday", start_time: "09:00:00", end_time: "10:30:00" },
    ],
};

const MATERIALS = {
    CSE201: [
        { title: "Data Structures — Lecture Notes (Unit 1)", description: "Arrays, Linked Lists and complexity analysis", file_path: "uploads/data-structures/unit1_notes.pdf", file_name: "unit1_notes.pdf", file_size: 2500000 },
        { title: "Assignment 1 — Sorting Algorithms", description: "Implement merge sort and quicksort, compare performance", file_path: "uploads/data-structures/assignment1_sorting.pdf", file_name: "assignment1_sorting.pdf", file_size: 850000 },
    ],
    CSE203: [
        { title: "ER Diagram & Relational Model — Slides", description: "Lecture slides covering ER diagrams and relational schema design", file_path: "uploads/dbms/er_model_slides.pdf", file_name: "er_model_slides.pdf", file_size: 1800000 },
        { title: "SQL Practice Problem Set", description: "Hands-on SQL exercises for SELECT/JOIN/GROUP BY", file_path: "uploads/dbms/sql_practice.pdf", file_name: "sql_practice.pdf", file_size: 640000 },
    ],
    CSE305: [
        { title: "Processes & Threads — Lecture Notes", description: "Process lifecycle, scheduling and threads", file_path: "uploads/os/processes_threads.pdf", file_name: "processes_threads.pdf", file_size: 2200000 },
        { title: "Lab Manual — Shell Scripting", description: "Lab exercises for bash scripting basics", file_path: "uploads/os/shell_lab.pdf", file_name: "shell_lab.pdf", file_size: 1300000 },
    ],
};

const ANNOUNCEMENTS = [
    { title: "Welcome to Database Management Systems (CSE203)", body: "Course materials are now available on the portal. Please review the ER diagram slides before our next class.", course_id_key: "CSE203", target_role: "student" },
    { title: "Midterm Schedule — Data Structures (CSE201)", body: "Midterm will be held during class time on the announced date. Please prepare Units 1-3.", course_id_key: "CSE201", target_role: "student" },
    { title: "Operating Systems (CSE305) — Lab Resources", body: "The shell scripting lab manual has been uploaded. Complete Exercise 1-5 before the next lab session.", course_id_key: "CSE305", target_role: "student" },
];

const ATTENDANCE = {
    CSE201: [
        { date: "2026-07-20", status: "Present" },
        { date: "2026-07-23", status: "Present" },
        { date: "2026-07-27", status: "Absent" },
        { date: "2026-07-30", status: "Present" },
        { date: "2026-08-03", status: "Late" },
        { date: "2026-08-06", status: "Present" },
        { date: "2026-08-10", status: "Present" },
        { date: "2026-08-13", status: "Present" },
    ],
    CSE203: [
        { date: "2026-07-21", status: "Present" },
        { date: "2026-07-24", status: "Present" },
        { date: "2026-07-28", status: "Present" },
        { date: "2026-07-31", status: "Late" },
        { date: "2026-08-04", status: "Present" },
        { date: "2026-08-07", status: "Absent" },
        { date: "2026-08-11", status: "Present" },
        { date: "2026-08-14", status: "Present" },
    ],
    CSE305: [
        { date: "2026-07-22", status: "Present" },
        { date: "2026-07-25", status: "Present" },
        { date: "2026-07-29", status: "Present" },
        { date: "2026-08-01", status: "Absent" },
        { date: "2026-08-05", status: "Present" },
        { date: "2026-08-08", status: "Late" },
        { date: "2026-08-12", status: "Present" },
        { date: "2026-08-15", status: "Present" },
    ],
};

const EXAMS = {
    CSE201: [
        { type: "Mid", date: "2026-08-06", total_marks: "30.00" },
        { type: "Final", date: "2026-08-13", total_marks: "50.00" },
    ],
    CSE203: [
        { type: "Mid", date: "2026-08-06", total_marks: "30.00" },
        { type: "Final", date: "2026-08-13", total_marks: "50.00" },
    ],
    CSE305: [
        { type: "Mid", date: "2026-08-06", total_marks: "30.00" },
        { type: "Final", date: "2026-08-13", total_marks: "50.00" },
    ],
};

const RESULTS = {
    CSE201: {
        Mid: { marks_obtained: "24.00", grade_letter: "A+", grade_point: "4.00" },
        Final: { marks_obtained: "42.00", grade_letter: "A+", grade_point: "4.00" },
    },
    CSE203: {
        Mid: { marks_obtained: "22.00", grade_letter: "A-", grade_point: "3.50" },
        Final: { marks_obtained: "38.00", grade_letter: "A", grade_point: "3.75" },
    },
    CSE305: {
        Mid: { marks_obtained: "18.00", grade_letter: "B", grade_point: "3.00" },
        Final: { marks_obtained: "35.00", grade_letter: "A-", grade_point: "3.50" },
    },
};

const PAYMENTS = [
    { amount: "37500.00", status: "Paid", method: "Mobile Banking", payment_date: "2026-07-05" },
    { amount: "25000.00", status: "Pending", method: "Card", payment_date: "2026-08-01" },
];

function buildCloudConfig() {
    const host = process.env.DB_HOST;
    const port = Number(process.env.DB_PORT) || 3306;
    const user = process.env.DB_USER;
    const password = process.env.DB_PASSWORD || "";
    const database = process.env.DB_NAME;

    if (!host || !user || !database) {
        console.error("❌ Missing required env variables. Check backend/.env");
        process.exit(1);
    }

    const config = { host, port, user, password, database };

    if (process.env.DB_SSL && process.env.DB_SSL !== "false" && process.env.DB_SSL !== "0") {
        config.ssl = { rejectUnauthorized: false };
    } else if (host !== "localhost" && host !== "127.0.0.1") {
        config.ssl = { rejectUnauthorized: false };
    }

    return config;
}

const stats = { courses: 0, teacherCourses: 0, timetable: 0, materials: 0, announcements: 0, enrollments: 0, attendance: 0, exams: 0, results: 0, payments: 0 };

async function insertIgnore(conn, sql, params) {
    try {
        const [r] = await conn.query(sql, params);
        return r.affectedRows;
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") return 0;
        throw err;
    }
}

async function exists(conn, sql, params) {
    const [rows] = await conn.query(sql, params);
    return rows.length > 0;
}

async function main() {
    let conn;
    try {
        conn = await mysql.createConnection(buildCloudConfig());
    } catch (err) {
        console.error("❌ Connection failed:");
        console.error(err);
        process.exit(1);
    }

    try {
        const courseIds = {};

        // 1. Courses (if not exist)
        for (const c of COURSES) {
            stats.courses += await insertIgnore(
                conn,
                "INSERT IGNORE INTO courses (course_code, course_name, credit, semester, department_id) VALUES (?, ?, ?, ?, ?)",
                [c.code, c.name, c.credit, c.semester, DEPT_ID]
            );
            const [rows] = await conn.query("SELECT course_id FROM courses WHERE course_code = ?", [c.code]);
            courseIds[c.code] = rows[0].course_id;
        }

        // 2. teacher_courses
        for (const code of Object.keys(courseIds)) {
            stats.teacherCourses += await insertIgnore(
                conn,
                "INSERT IGNORE INTO teacher_courses (teacher_id, course_id) VALUES (?, ?)",
                [TEACHER_ID, courseIds[code]]
            );
        }

        // 3. Timetable
        for (const code of Object.keys(courseIds)) {
            for (const slot of TIMETABLE[code]) {
                if (await exists(
                    conn,
                    "SELECT 1 FROM timetable WHERE course_id = ? AND teacher_id = ? AND day = ? AND start_time = ? LIMIT 1",
                    [courseIds[code], TEACHER_ID, slot.day, slot.start_time]
                )) continue;
                await conn.query(
                    "INSERT INTO timetable (course_id, teacher_id, room_no, day, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)",
                    [courseIds[code], TEACHER_ID, slot.room_no, slot.day, slot.start_time, slot.end_time]
                );
                stats.timetable++;
            }
        }

        // 4. Course materials
        for (const code of Object.keys(courseIds)) {
            for (const m of MATERIALS[code]) {
                if (await exists(
                    conn,
                    "SELECT 1 FROM course_materials WHERE course_id = ? AND teacher_id = ? AND title = ? LIMIT 1",
                    [courseIds[code], TEACHER_ID, m.title]
                )) continue;
                await conn.query(
                    "INSERT INTO course_materials (course_id, teacher_id, title, description, file_path, file_name, file_size) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [courseIds[code], TEACHER_ID, m.title, m.description, m.file_path, m.file_name, m.file_size]
                );
                stats.materials++;
            }
        }

        // 5. Announcements by teacher1
        for (const a of ANNOUNCEMENTS) {
            if (await exists(
                conn,
                "SELECT 1 FROM announcements WHERE created_by = ? AND title = ? LIMIT 1",
                [TEACHER_USER_ID, a.title]
            )) continue;
            await conn.query(
                "INSERT INTO announcements (title, body, target_role, course_id, created_by) VALUES (?, ?, ?, ?, ?)",
                [a.title, a.body, a.target_role, courseIds[a.course_id_key], TEACHER_USER_ID]
            );
            stats.announcements++;
        }

        // 6. Enroll student1 in teacher1's courses (status 'approved' — 'enrolled' is not a valid enum value)
        for (const code of Object.keys(courseIds)) {
            stats.enrollments += await insertIgnore(
                conn,
                "INSERT IGNORE INTO enrollments (student_id, course_id, semester, session, status) VALUES (?, ?, ?, ?, 'approved')",
                [STUDENT_ID, courseIds[code], SEMESTER, SESSION]
            );
        }

        // 7. Attendance for student1
        const enrollmentIds = {};
        for (const code of Object.keys(courseIds)) {
            const [rows] = await conn.query(
                "SELECT enrollment_id FROM enrollments WHERE student_id = ? AND course_id = ? AND semester = ? AND session = ? LIMIT 1",
                [STUDENT_ID, courseIds[code], SEMESTER, SESSION]
            );
            enrollmentIds[code] = rows[0].enrollment_id;
        }
        for (const code of Object.keys(courseIds)) {
            for (const att of ATTENDANCE[code]) {
                stats.attendance += await insertIgnore(
                    conn,
                    "INSERT IGNORE INTO attendance (enrollment_id, attendance_date, status) VALUES (?, ?, ?)",
                    [enrollmentIds[code], att.date, att.status]
                );
            }
        }

        // 8. Exams + results
        const examIds = {};
        for (const code of Object.keys(courseIds)) {
            for (const ex of EXAMS[code]) {
                let [rows] = await conn.query(
                    "SELECT exam_id FROM exams WHERE course_id = ? AND exam_type = ? AND exam_date = ? LIMIT 1",
                    [courseIds[code], ex.type, ex.date]
                );
                if (rows.length === 0) {
                    const [r] = await conn.query(
                        "INSERT INTO exams (course_id, exam_type, exam_date, total_marks) VALUES (?, ?, ?, ?)",
                        [courseIds[code], ex.type, ex.date, ex.total_marks]
                    );
                    stats.exams++;
                    rows = [{ exam_id: r.insertId }];
                }
                examIds[`${code}_${ex.type}`] = rows[0].exam_id;
            }
        }
        for (const code of Object.keys(courseIds)) {
            for (const ex of EXAMS[code]) {
                const res = RESULTS[code][ex.type];
                stats.results += await insertIgnore(
                    conn,
                    "INSERT IGNORE INTO results (enrollment_id, exam_id, marks_obtained, grade_letter, grade_point, is_published, published_at) VALUES (?, ?, ?, ?, ?, 1, ?)",
                    [enrollmentIds[code], examIds[`${code}_${ex.type}`], res.marks_obtained, res.grade_letter, res.grade_point, `${ex.date} 18:00:00`]
                );
            }
        }

        // 9. Payments for student1
        for (const p of PAYMENTS) {
            if (await exists(
                conn,
                "SELECT 1 FROM payments WHERE student_id = ? AND amount = ? AND payment_date = ? LIMIT 1",
                [STUDENT_ID, p.amount, p.payment_date]
            )) continue;
            await conn.query(
                "INSERT INTO payments (student_id, amount, status, payment_date, method) VALUES (?, ?, ?, ?, ?)",
                [STUDENT_ID, p.amount, p.status, p.payment_date, p.method]
            );
            stats.payments++;
        }

        console.log("\n✅ Demo data seeding completed!\n");
        console.log("===== SUMMARY =====");
        console.log(`  📚 Courses created:               ${stats.courses}`);
        console.log(`  🔗 Teacher-course links:          ${stats.teacherCourses}`);
        console.log(`  🕐 Timetable entries:             ${stats.timetable}`);
        console.log(`  📄 Course materials:              ${stats.materials}`);
        console.log(`  📣 Announcements:                 ${stats.announcements}`);
        console.log(`  🎓 Enrollments (student1):        ${stats.enrollments}`);
        console.log(`  ✅ Attendance records:            ${stats.attendance}`);
        console.log(`  📝 Exams created:                 ${stats.exams}`);
        console.log(`  🏆 Results:                       ${stats.results}`);
        console.log(`  💳 Payments:                      ${stats.payments}`);
        console.log("\nNote: enrollments use status 'approved' because 'enrolled' is not a valid value in the enrollments.status enum.");
    } catch (err) {
        console.error("❌ Error during demo seeding:");
        console.error(err);
        process.exitCode = 1;
    } finally {
        if (conn) await conn.end();
    }
}

main();
