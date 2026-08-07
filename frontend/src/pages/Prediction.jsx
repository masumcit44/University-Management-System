import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Search, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

// Risk badge colours shared by the course table and the cohort table.
const RISK_CLASS = {
  High: "bg-red-50 text-red-700 border-red-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Completed: "bg-blue-50 text-blue-700 border-blue-200",
  Unknown: "bg-slate-100 text-slate-500 border-slate-200",
};

function RiskBadge({ level }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
        RISK_CLASS[level] || RISK_CLASS.Unknown
      }`}
    >
      {level}
    </span>
  );
}

// Percentages are null until marks or attendance exist for a course.
const percent = (value) =>
  value === null || value === undefined ? "—" : `${value}%`;

function Prediction() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [cohort, setCohort] = useState([]);
  const [cohortLoading, setCohortLoading] = useState(true);
  const [cohortAllowed, setCohortAllowed] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchCohort();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCohort = async () => {
    try {
      setCohortLoading(true);

      const res = await api.get("/predictions");
      setCohort(res.data.data);
    } catch (err) {
      console.error(err);

      // Students may not read the cohort overview - hide it instead of erroring.
      if (err.response?.status === 403) {
        setCohortAllowed(false);
      }
    } finally {
      setCohortLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!selectedStudentId) {
      alert("Please select a student");
      return;
    }

    setLoading(true);
    setReport(null);
    setNotFound(false);

    try {
      const res = await api.get(`/predictions/${selectedStudentId}`);
      setReport(res.data.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        alert(err.response?.data?.message || "Failed to generate prediction");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Performance Prediction"
        subtitle="Forecast final grades from attendance and continuous assessment"
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <label className="text-sm font-medium text-slate-600">Student</label>

        <div className="flex gap-3 mt-1 max-w-xl">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="border border-slate-200 w-full rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_name}
              </option>
            ))}
          </select>

          <button
            onClick={handlePredict}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Search size={18} />
            Predict
          </button>
        </div>

        {loading && <Loader text="Analysing performance..." />}

        {notFound && (
          <EmptyState
            icon={TrendingUp}
            title="No enrollment found for this student"
            hint="Prediction needs at least one enrolled course"
          />
        )}
      </div>

      {report && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm text-slate-500">Predicted GPA</p>
              <p className="text-4xl font-bold text-blue-600 mt-1">
                {report.predicted_gpa === null
                  ? "—"
                  : Number(report.predicted_gpa).toFixed(2)}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {report.total_credits} credits · {report.total_courses} courses
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm text-slate-500">Attendance</p>
              <p className="text-4xl font-bold text-slate-800 mt-1">
                {percent(report.overall_attendance)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Late counted as half</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm text-slate-500">Overall Risk</p>
              <div className="mt-3">
                <RiskBadge level={report.overall_risk} />
              </div>
              <p className="text-xs text-slate-400 mt-2">Worst active course</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-4xl font-bold text-slate-800 mt-1">
                {report.completed_courses}/{report.total_courses}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Finals already published
              </p>
            </div>
          </div>

          {/* Per course forecast */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                {report.student_name}
                <span className="text-slate-400 font-normal">
                  {" "}
                  · {report.department_name}
                </span>
              </h2>
            </div>

            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Course
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Credit
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Attendance
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Assessment
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Predicted
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Grade
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Risk
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Confidence
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.courses.map((course) => (
                  <tr
                    key={course.enrollment_id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-slate-800">
                        {course.course_code}
                      </p>
                      <p className="text-sm text-slate-500">
                        {course.course_name}
                      </p>
                    </td>
                    <td className="p-4 text-slate-600">{course.credit}</td>
                    <td className="p-4 text-slate-600">
                      {percent(course.attendance_rate)}
                      <span className="text-xs text-slate-400">
                        {" "}
                        ({course.total_classes})
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {percent(course.assessment_percentage)}
                      <span className="text-xs text-slate-400">
                        {" "}
                        ({course.assessment_count})
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {percent(course.predicted_percentage)}
                    </td>
                    <td className="p-4 font-semibold text-blue-600">
                      {course.predicted_grade || "—"}
                    </td>
                    <td className="p-4">
                      <RiskBadge level={course.risk_level} />
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {course.confidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-amber-500" />
              <h2 className="font-semibold text-slate-800">Recommendations</h2>
            </div>

            <ul className="space-y-2">
              {report.recommendations.map((text, index) => (
                <li key={index} className="flex gap-3 text-slate-600 text-sm">
                  <span className="text-slate-300">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Cohort overview */}
      {cohortAllowed && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-slate-800">Students At Risk</h2>
            <span className="text-sm text-slate-400">weakest first</span>
          </div>

          {cohortLoading ? (
            <Loader text="Scanning cohort..." />
          ) : cohort.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No enrolled students yet"
              hint="Enroll students in courses to build the risk overview"
            />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Student
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Department
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Courses
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Attendance
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Assessment
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Predicted
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Grade
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-slate-500">
                    Risk
                  </th>
                </tr>
              </thead>

              <tbody>
                {cohort.map((row) => (
                  <tr
                    key={row.student_id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudentId(String(row.student_id))}
                  >
                    <td className="p-4 font-medium text-slate-800">
                      {row.student_name}
                    </td>
                    <td className="p-4 text-slate-600">{row.department_name}</td>
                    <td className="p-4 text-slate-600">
                      {row.total_enrollments}
                    </td>
                    <td className="p-4 text-slate-600">
                      {percent(row.attendance_rate)}
                    </td>
                    <td className="p-4 text-slate-600">
                      {percent(row.assessment_percentage)}
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      {percent(row.predicted_percentage)}
                    </td>
                    <td className="p-4 font-semibold text-blue-600">
                      {row.predicted_grade || "—"}
                    </td>
                    <td className="p-4">
                      <RiskBadge level={row.risk_level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default Prediction;