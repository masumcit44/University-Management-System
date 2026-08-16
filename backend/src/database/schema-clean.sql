-- =========================================================
-- University Management System - Database Schema
-- Database: university_management_system
-- Engine: MySQL
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- Aligned with: projectERD.jpg (Eastern University - DBMS Lab Proposal)
-- =========================================================

-- =========================================================
-- Users (Authentication)
-- =========================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- Departments
-- =========================================================
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(150) NOT NULL,
    department_code VARCHAR(20) NOT NULL UNIQUE,
    department_head VARCHAR(150) DEFAULT NULL
);

-- =========================================================
-- Students
-- =========================================================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(150) NOT NULL,
    student_email VARCHAR(150) NOT NULL UNIQUE,
    student_phone VARCHAR(20) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    dob DATE DEFAULT NULL,
    admission_date DATE DEFAULT NULL,
    department_id INT NOT NULL,
    user_id INT DEFAULT NULL,

    CONSTRAINT fk_student_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_student_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

-- =========================================================
-- Teachers
-- =========================================================
CREATE TABLE teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_name VARCHAR(150) NOT NULL,
    teacher_email VARCHAR(150) NOT NULL UNIQUE,
    teacher_phone VARCHAR(20) NOT NULL,
    designation VARCHAR(100) DEFAULT NULL,
    gender ENUM('Male', 'Female', 'Other') DEFAULT NULL,
    address VARCHAR(255) DEFAULT NULL,
    dob DATE DEFAULT NULL,
    joining_date DATE DEFAULT NULL,
    department_id INT NOT NULL,
    user_id INT DEFAULT NULL,

    CONSTRAINT fk_teacher_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_teacher_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL
);

-- =========================================================
-- Courses
-- =========================================================
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    course_name VARCHAR(150) NOT NULL,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    credit DECIMAL(3,2) NOT NULL,
    semester INT NOT NULL,
    department_id INT NOT NULL,

    CONSTRAINT fk_course_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT
);

-- =========================================================
-- Enrollments
-- =========================================================
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester INT NOT NULL,
    session VARCHAR(20) NOT NULL,
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved',
    reviewed_by INT DEFAULT NULL,
    reviewed_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_reviewer
        FOREIGN KEY (reviewed_by)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    CONSTRAINT uq_enrollment UNIQUE (student_id, course_id, semester, session)
);

-- =========================================================
-- Attendance (linked via Enrollment, per ERD)
-- =========================================================
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL,

    CONSTRAINT fk_attendance_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(enrollment_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_attendance_enrollment_date UNIQUE (enrollment_id, attendance_date)
);

-- =========================================================
-- Exams
-- =========================================================
CREATE TABLE exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    exam_type ENUM('Mid', 'Assignment', 'Quiz', 'Final') NOT NULL,
    exam_date DATE NOT NULL,
    total_marks DECIMAL(5,2) NOT NULL,

    CONSTRAINT fk_exam_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE
);

-- =========================================================
-- Results (linked via Enrollment + Exam, per ERD)
-- =========================================================
CREATE TABLE results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    exam_id INT NOT NULL,
    marks_obtained DECIMAL(5,2) NOT NULL,
    grade_letter VARCHAR(5) DEFAULT NULL,
    grade_point DECIMAL(3,2) DEFAULT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    published_at TIMESTAMP NULL DEFAULT NULL,

    CONSTRAINT fk_result_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(enrollment_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_exam
        FOREIGN KEY (exam_id)
        REFERENCES exams(exam_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_result UNIQUE (enrollment_id, exam_id)
);

-- =========================================================
-- Payments
-- =========================================================
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('Paid', 'Pending', 'Failed') NOT NULL DEFAULT 'Pending',
    payment_date DATE DEFAULT (CURRENT_DATE),
    method ENUM('Cash', 'Card', 'Bank Transfer', 'Mobile Banking') DEFAULT NULL,

    CONSTRAINT fk_payment_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE
);

-- =========================================================
-- TimeTable
-- =========================================================
CREATE TABLE timetable (
    timetable_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    room_no VARCHAR(20) NOT NULL,
    day ENUM('Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    CONSTRAINT fk_timetable_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_timetable_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON DELETE CASCADE
);

-- =========================================================
-- Teacher <-> Course Assignments (RBAC scoping source)
-- =========================================================
CREATE TABLE teacher_courses (
    teacher_course_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_teachercourse_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_teachercourse_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT uq_teacher_course UNIQUE (teacher_id, course_id)
);

-- =========================================================
-- Course Materials (Teacher uploads / Student downloads)
-- =========================================================
CREATE TABLE course_materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500) DEFAULT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_material_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_material_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON DELETE CASCADE
);

-- =========================================================
-- Announcements (Role / Course targeted)
-- =========================================================
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    target_role ENUM('all', 'admin', 'teacher', 'student') NOT NULL DEFAULT 'all',
    course_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_announcement_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_announcement_user
        FOREIGN KEY (created_by)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

-- =========================================================
-- Audit Logs (every permission-sensitive action)
-- =========================================================
CREATE TABLE audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) DEFAULT NULL,
    details JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE SET NULL,

    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id)
);
