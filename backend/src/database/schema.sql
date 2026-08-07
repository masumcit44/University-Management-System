-- =========================================================
-- University Management System - Database Schema
-- Database: university_management_system
-- Engine: MySQL
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- Aligned with: projectERD.jpg (Eastern University - DBMS Lab Proposal)
-- =========================================================

CREATE DATABASE IF NOT EXISTS university_management_system
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE university_management_system;

-- =========================================================
-- Users (Authentication)
-- =========================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
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

    CONSTRAINT fk_student_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT
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

    CONSTRAINT fk_teacher_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON DELETE RESTRICT
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

    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON DELETE CASCADE,

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
        ON DELETE CASCADE
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