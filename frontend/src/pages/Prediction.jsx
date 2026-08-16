import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Search, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

// Risk badge colours shared by the course table and the cohort table.
const RISK_CLASS = {
  High: "badge-danger",
  Medium: "badge-warn",
  Low: "badge-ok",
  Completed: "badge-neutral",
  Unknown: "badge-neutral",
};

function RiskBadge({ level }) {
  return (
    <span className={`badge ${RISK_CLASS[level] || RISK_CLASS.Unknown}`}>
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
  const [error, setError] = useState("");

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
      setError("Select a student before predicting");
      return;
    }

    setLoading(true);
    setError("");
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
        setError(err.response?.data?.message || "Failed to generate prediction");
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

      <div className="surface p-6 mb-6">
        <label className="label-mono block">Student</label>

        <div className="flex gap-3 mt-2 max-w-xl">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="control w-auto flex-1"
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
            className="btn-solid btn-pushable whitespace-nowrap"
          >
            <Search size={16} />
            Predict
          </button>
        </div>

        {loading && <Loader text="Analysing performance..." />}

        {error && (
          <p className="mt-4 text-[0.8125rem] text-danger border-l-4 border-danger bg-danger-soft px-3 py-2">
            {error}
          </p>
        )}

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
            <div className="surface p-6">
              <p className="text-sm text-ink-soft">Predicted GPA</p>
              <p className="text-4xl font-bold text-accent mt-1">
                {report.predicted_gpa === null
                  ? "—"
                  : Number(report.predicted_gpa).toFixed(2)}
              </p>
              <p className="text-xs text-ink-mute mt-1">
                {report.total_credits} credits · {report.total_courses} courses
              </p>
            </div>

            <div className="surface p-6">
              <p className="text-sm text-ink-soft">Attendance</p>
              <p className="text-4xl font-bold text-ink mt-1">
                {percent(report.overall_attendance)}
              </p>
              <p className="text-xs text-ink-mute mt-1">Late counted as half</p>
            </div>

            <div className="surface p-6">
              <p className="text-sm text-ink-soft">Overall Risk</p>
              <div className="mt-3">
                <RiskBadge level={report.overall_risk} />
              </div>
              <p className="text-xs text-ink-mute mt-2">Worst active course</p>
            </div>

            <div className="surface p-6">
              <p className="text-sm text-ink-soft">Completed</p>
              <p className="text-4xl font-bold text-ink mt-1">
                {report.completed_courses}/{report.total_courses}
              </p>
              <p className="text-xs text-ink-mute mt-1">
                Finals already published
              </p>
            </div>
          </div>

          {/* Per course forecast */}
          <div className="surface overflow-hidden mb-6">
            <div className="p-4 border-b border-line">
              <h2 className="font-semibold text-ink">
                {report.student_name}
                <span className="text-ink-mute font-normal">
                  {" "}
                  · {report.department_name}
                </span>
              </h2>
            </div>

            <table className="data-table w-full">
              <thead className="bg-paper border-b border-line">
                <tr>
                  <th className="text-left p-4 label-mono">
                    Course
                  </th>
                  <th className="text-left p-4 label-mono">
                    Credit
                  </th>
                  <th className="text-left p-4 label-mono">
                    Attendance
                  </th>
                  <th className="text-left p-4 label-mono">
                    Assessment
                  </th>
                  <th className="text-left p-4 label-mono">
                    Predicted
                  </th>
                  <th className="text-left p-4 label-mono">
                    Grade
                  </th>
                  <th className="text-left p-4 label-mono">
                    Risk
                  </th>
                  <th className="text-left p-4 label-mono">
                    Confidence
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.courses.map((course) => (
                  <tr
                    key={course.enrollment_id}
                    className="border-b border-line hover:bg-paper transition-colors"
                  >
                    <td className="p-4">
                      <p className="font-medium text-ink">
                        {course.course_code}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {course.course_name}
                      </p>
                    </td>
                    <td className="p-4 text-ink-soft">{course.credit}</td>
                    <td className="p-4 text-ink-soft">
                      {percent(course.attendance_rate)}
                      <span className="text-xs text-ink-mute">
                        {" "}
                        ({course.total_classes})
                      </span>
                    </td>
                    <td className="p-4 text-ink-soft">
                      {percent(course.assessment_percentage)}
                      <span className="text-xs text-ink-mute">
                        {" "}
                        ({course.assessment_count})
                      </span>
                    </td>
                    <td className="p-4 font-medium text-ink">
                      {percent(course.predicted_percentage)}
                    </td>
                    <td className="p-4 font-semibold text-accent">
                      {course.predicted_grade || "—"}
                    </td>
                    <td className="p-4">
                      <RiskBadge level={course.risk_level} />
                    </td>
                    <td className="p-4 text-sm text-ink-soft">
                      {course.confidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="surface p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={18} className="text-warn" />
              <h2 className="font-semibold text-ink">Recommendations</h2>
            </div>

            <ul className="space-y-2">
              {report.recommendations.map((text, index) => (
                <li key={index} className="flex gap-3 text-ink-soft text-sm">
                  <span className="text-ink-mute">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Cohort overview */}
      {cohortAllowed && (
        <div className="surface overflow-hidden">
          <div className="p-4 border-b border-line flex items-center gap-2">
            <AlertTriangle size={18} className="text-warn" />
            <h2 className="font-semibold text-ink">Students At Risk</h2>
            <span className="text-sm text-ink-mute">weakest first</span>
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
            <table className="data-table w-full">
              <thead className="bg-paper border-b border-line">
                <tr>
                  <th className="text-left p-4 label-mono">
                    Student
                  </th>
                  <th className="text-left p-4 label-mono">
                    Department
                  </th>
                  <th className="text-left p-4 label-mono">
                    Courses
                  </th>
                  <th className="text-left p-4 label-mono">
                    Attendance
                  </th>
                  <th className="text-left p-4 label-mono">
                    Assessment
                  </th>
                  <th className="text-left p-4 label-mono">
                    Predicted
                  </th>
                  <th className="text-left p-4 label-mono">
                    Grade
                  </th>
                  <th className="text-left p-4 label-mono">
                    Risk
                  </th>
                </tr>
              </thead>

              <tbody>
                {cohort.map((row) => (
                  <tr
                    key={row.student_id}
                    className="border-b border-line hover:bg-paper transition-colors cursor-pointer"
                    onClick={() => setSelectedStudentId(String(row.student_id))}
                  >
                    <td className="p-4 font-medium text-ink">
                      {row.student_name}
                    </td>
                    <td className="p-4 text-ink-soft">{row.department_name}</td>
                    <td className="p-4 text-ink-soft">
                      {row.total_enrollments}
                    </td>
                    <td className="p-4 text-ink-soft">
                      {percent(row.attendance_rate)}
                    </td>
                    <td className="p-4 text-ink-soft">
                      {percent(row.assessment_percentage)}
                    </td>
                    <td className="p-4 font-medium text-ink">
                      {percent(row.predicted_percentage)}
                    </td>
                    <td className="p-4 font-semibold text-accent">
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