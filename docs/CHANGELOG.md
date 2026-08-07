# Changelog

All notable changes to this project will be documented here.

---

## Version 0.1.0

### Project Initialization

- Git initialized
- GitHub repository created
- Project folder structure created
- README added
- .gitignore added

---

### Documentation

- PROJECT_CONTEXT.md completed
- ROADMAP.md completed
- DATABASE.md completed
- API_SPEC.md completed
- TASKS.md completed

---

### Current Status

Project foundation completed.

Ready to start backend development.

---

## Version 0.2.0

### Backend Foundation

- Express server and environment configuration completed
- MySQL connection established through mysql2
- MVC folder structure completed
- Database schema created with 12 tables

---

### Authentication

- JWT authentication completed
- Password hashing with bcrypt completed
- Role based authorization middleware completed
- User management endpoints completed

---

### Modules

- Department module completed
- Student module completed
- Teacher module completed
- Course module completed
- Enrollment module completed
- Attendance module completed
- Exam module completed
- Result module completed with grade service
- Payment module completed
- Timetable module completed
- Dashboard analytics completed
- CGPA calculation completed

---

### Frontend

- React, Vite and Tailwind setup completed
- Protected routing and sidebar navigation completed
- Shared UI components completed
- CRUD pages completed for every module

---

## Version 0.3.0

### AI Integration - Student Performance Prediction

- Added src/models/predictionModel.js with per course, per enrollment and cohort aggregate queries
- Added src/services/predictionService.js implementing the prediction algorithm
- Added src/controllers/predictionController.js
- Added src/routes/predictionRoutes.js
- Mounted /api/predictions in src/app.js
- Added Prediction page, protected route and sidebar entry in the frontend

---

### Endpoints

- GET /api/predictions/:student_id returns the full per course forecast for one student
- GET /api/predictions returns the cohort risk overview, restricted to admin and teacher

---

### Prediction Algorithm

- Predicted percentage = 75% continuous assessment + 25% attendance
- Continuous assessment covers Mid, Quiz and Assignment, summed as raw marks
- Late attendance is counted as a half presence
- Predicted grade is derived from the existing gradeService scale, so predictions and real results always share one grading table
- A course with a published Final result reports its actual grade instead of a prediction
- Risk levels: High below 40 percent, Medium below 55 percent, otherwise Low
- Confidence is derived from the number of assessment and attendance records available

---

### Fixes

- Added the missing bcrypt and jsonwebtoken dependencies to backend/package.json, which were required by authService.js and authMiddleware.js but only installed at the repository root

---

### Documentation

- TASKS.md synced to the real project state
- ROADMAP.md phase markers updated

---

### Current Status

Phase 15 in progress.

AI Chat Assistant is the remaining module