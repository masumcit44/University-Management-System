-- =========================================================
-- Migration 001: RBAC & Workflows
-- Brings an EXISTING database up to the current schema.sql.
--
-- Target: MariaDB 10.4+ (the live server). Uses ADD COLUMN
-- IF NOT EXISTS so the file is safe to re-run.
--
-- NOTE: students.user_id / teachers.user_id already exist in
-- the live DB (schema drift) along with their FKs, so they are
-- intentionally not re-added here. Fresh installs get the full
-- definition from schema.sql.
-- =========================================================

USE university_management_system;

-- ---------------------------------------------------------
-- users: account state + last login tracking
-- ---------------------------------------------------------
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP NULL DEFAULT NULL AFTER is_active;

-- ---------------------------------------------------------
-- students / teachers: back-link to auth user (FK kept in
-- schema.sql; the live DB already carries these constraints)
-- ---------------------------------------------------------
ALTER TABLE students
    ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL AFTER department_id;

ALTER TABLE teachers
    ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL AFTER department_id;

-- ---------------------------------------------------------
-- enrollments: approval workflow
-- Existing admin-created enrollments stay approved.
-- ---------------------------------------------------------
ALTER TABLE enrollments
    ADD COLUMN IF NOT EXISTS status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'approved' AFTER enrollment_date,
    ADD COLUMN IF NOT EXISTS reviewed_by INT DEFAULT NULL AFTER status,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP NULL DEFAULT NULL AFTER reviewed_by,
    ADD CONSTRAINT fk_enrollment_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL;

-- ---------------------------------------------------------
-- results: draft / publish workflow
-- Existing rows stay published so nothing disappears.
-- ---------------------------------------------------------
ALTER TABLE results
    ADD COLUMN IF NOT EXISTS is_published TINYINT(1) NOT NULL DEFAULT 1 AFTER grade_point,
    ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL DEFAULT NULL AFTER is_published;

-- ---------------------------------------------------------
-- teacher_courses: faculty-to-course assignment (RBAC scoping)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_courses (
    teacher_course_id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    course_id INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_teachercourse_teacher
        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE,

    CONSTRAINT fk_teachercourse_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,

    CONSTRAINT uq_teacher_course UNIQUE (teacher_id, course_id)
);

-- ---------------------------------------------------------
-- course_materials: teacher uploads, student downloads
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_materials (
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
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,

    CONSTRAINT fk_material_teacher
        FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- announcements: role / course targeted broadcasts
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    target_role ENUM('all', 'admin', 'teacher', 'student') NOT NULL DEFAULT 'all',
    course_id INT DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_announcement_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,

    CONSTRAINT fk_announcement_user
        FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ---------------------------------------------------------
-- audit_logs: every permission-sensitive action
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) DEFAULT NULL,
    details JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,

    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_type, entity_id)
);
