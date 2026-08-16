import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import TeacherDashboard from "../pages/TeacherDashboard";
import StudentDashboard from "../pages/StudentDashboard";
import Departments from "../pages/Departments";
import Students from "../pages/Students";
import Teachers from "../pages/Teachers";
import Courses from "../pages/Courses";
import Payments from "../pages/Payments";
import Timetable from "../pages/Timetable";
import Enrollment from "../pages/Enrollment";
import Attendance from "../pages/Attendance";
import Results from "../pages/Results";
import Cgpa from "../pages/Cgpa";
import Exam from "../pages/Exam";
import Reports from "../pages/Reports";
import Prediction from "../pages/Prediction";
import Chat from "../pages/Chat";
import AdminPanel from "../pages/AdminPanel";
import TeacherCourses from "../pages/TeacherCourses";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin only - matches dashboardRoutes.js roleMiddleware("admin") */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher only */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute allowedRoles={["teacher"]}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Student only */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin only - matches departmentRoutes.js write ops (read is open backend-side, but page itself is an admin management screen) */}
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Departments />
            </ProtectedRoute>
          }
        />

        {/* Admin & Teacher - matches studentRoutes.js roleMiddleware("admin", "teacher") on GET / */}
        <Route
          path="/students"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <Students />
            </ProtectedRoute>
          }
        />

        {/* Admin only - matches teacherRoutes.js roleMiddleware("admin") on GET / */}
        <Route
          path="/teachers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Teachers />
            </ProtectedRoute>
          }
        />

        {/* Admin, Teacher, Student - courses are readable reference data for all roles */}
        <Route
          path="/courses"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
              <Courses />
            </ProtectedRoute>
          }
        />

        {/* Admin & Teacher - admin manages enrollment; teacher approves/rejects pending requests in assigned courses */}
        <Route
          path="/enrollment"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <Enrollment />
            </ProtectedRoute>
          }
        />

        {/* Admin only - matches teacherCourseRoutes.js roleMiddleware("admin") on all endpoints */}
        <Route
          path="/teacher-courses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TeacherCourses />
            </ProtectedRoute>
          }
        />

        {/* Admin, Teacher, Student - matches attendanceRoutes.js role set */}
        <Route
          path="/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />

        {/* Admin, Teacher, Student - matches resultRoutes.js role set */}
        <Route
          path="/results"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
              <Results />
            </ProtectedRoute>
          }
        />

        {/* Admin & Student only - matches cgpaRoutes.js roleMiddleware("admin", "student") */}
        <Route
          path="/cgpa"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Cgpa />
            </ProtectedRoute>
          }
        />

        {/* Admin, Teacher, Student - matches examRoutes.js role set */}
        <Route
          path="/exams"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
              <Exam />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Admin & Teacher - matches predictionRoutes.js roleMiddleware("admin", "teacher") */}
        <Route
          path="/prediction"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher"]}>
              <Prediction />
            </ProtectedRoute>
          }
        />

        {/* Any authenticated role - AI feature to be wired by the team later */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Admin only - matches userRoutes.js roleMiddleware("admin") */}
        <Route
          path="/admin-panel"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Admin & Student only - matches paymentRoutes.js role set */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={["admin", "student"]}>
              <Payments />
            </ProtectedRoute>
          }
        />

        {/* Admin, Teacher, Student - matches timetableRoutes.js role set */}
        <Route
          path="/timetable"
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "student"]}>
              <Timetable />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;