# Database Documentation

## Database Name

university_management_system

---

## Database Engine

MySQL

---

## Character Set

utf8mb4

---

## Collation

utf8mb4_unicode_ci

---

# Primary Entities

- Department
- Student
- Teacher
- Course
- Enrollment
- Attendance
- Exam
- Result
- Payment
- Timetable

---

# Primary Keys

Every table must have a single primary key.

Primary keys should use INT AUTO_INCREMENT.

Example

Student_ID

Department_ID

Teacher_ID

Course_ID

---

# Foreign Keys

Relationships will be enforced using foreign keys.

No duplicate relationship columns.

Every foreign key must reference an existing primary key.

---

# Constraints

NOT NULL

PRIMARY KEY

FOREIGN KEY

UNIQUE

CHECK (if applicable)

DEFAULT (if applicable)

---

# Naming Convention

Database

lowercase

Example

university_management_system

Tables

PascalCase

Student

Teacher

Department

Columns

PascalCase

Student_ID

Department_ID

Course_Name

Relationships

Always use foreign keys.

---

# Development Rule

Database schema will be implemented manually.

No ORM.

No Sequelize.

No Prisma.

Only MySQL.

---

# Current Status

Documentation Started