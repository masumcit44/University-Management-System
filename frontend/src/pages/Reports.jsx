import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Search, FileBarChart2, AlertTriangle } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Field, { CONTROL_CLASS } from "../components/Field";

const STATUS_DOTS = {
  Present: "bg-accent",
  Absent: "bg-danger",
  Late: "bg-warn",
};

// Chronological order within a course, not schema/alphabetical order
const EXAM_ORDER = ["Quiz", "Assignment", "Mid", "Final"];

const TH = "text-left px-5 py-2.5 label-mono whitespace-nowrap align-middle";
const TD = "px-5 py-3 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

function Reports() {
  const [students, setStudents] = useState([]);
  const [studentIdInput, setStudentIdInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [studentInfo, setStudentInfo] = useState(null);
  const [cgpaData, setCgpaData] = useState(null);
  const [resultRows, setResultRows] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async () => {
    if (!studentIdInput.trim()) {
      setError("Enter a student ID to generate a report");
      return;
    }

    setLoading(true);
    setError("");
    setNotFound(false);
    setStudentInfo(null);
    setCgpaData(null);
    setResultRows([]);
    setAttendanceSummary(null);

    try {
      const student = students.find(
        (s) => String(s.student_id) === String(studentIdInput.trim())
      );

      if (!student) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setStudentInfo(student);

      try {
        const cgpaRes = await api.get(`/cgpa/${student.student_id}`);
        setCgpaData(cgpaRes.data.data);
      } catch (err) {
        setCgpaData(null);
      }

      const resultsRes = await api.get("/results");
      const filteredResults = resultsRes.data.data.filter(
        (r) => String(r.student_id) === String(student.student_id)
      );
      setResultRows(filteredResults);

      const attendanceRes = await api.get("/attendance");
      const filteredAttendance = attendanceRes.data.data.filter(
        (a) => String(a.student_id) === String(student.student_id)
      );

      const total = filteredAttendance.length;
      const present = filteredAttendance.filter((a) => a.status === "Present").length;
      const absent = filteredAttendance.filter((a) => a.status === "Absent").length;
      const late = filteredAttendance.filter((a) => a.status === "Late").length;

      setAttendanceSummary({
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? ((present / total) * 100).toFixed(1) : "0.0",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGenerateReport();
  };

  // Group flat result rows into one block per course, ordered Quiz → Assignment → Mid → Final
  const courseGroups = Object.values(
    resultRows.reduce((acc, r) => {
      if (!acc[r.course_id]) {
        acc[r.course_id] = {
          course_id: r.course_id,
          course_name: r.course_name,
          course_code: r.course_code,
          rows: [],
        };
      }
      acc[r.course_id].rows.push(r);
      return acc;
    }, {})
  )
    .map((group) => {
      const sortedRows = [...group.rows].sort(
        (a, b) => EXAM_ORDER.indexOf(a.exam_type) - EXAM_ORDER.indexOf(b.exam_type)
      );

      // Only Final exams count toward CGPA (same rule as the CGPA page and
      // backend gradeService), so the per-course GPA matches the CGPA tile.
      const finalRows = sortedRows.filter((r) => r.exam_type === "Final");
      const avgGpa =
        finalRows.length > 0
          ? (
              finalRows.reduce((sum, r) => sum + Number(r.grade_point), 0) /
              finalRows.length
            ).toFixed(2)
          : "—";

      return { ...group, rows: sortedRows, avgGpa };
    })
    .sort((a, b) => a.course_name.localeCompare(b.course_name));

  return (
    <MainLayout>
      <PageHeader
        title="Reports"
        subtitle="A single generated academic summary for one student at a time."
      />

      <div className="surface p-5 mb-6">
        <Field label="Student ID">
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="e.g. 1"
              value={studentIdInput}
              onChange={(e) => setStudentIdInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`${CONTROL_CLASS} max-w-xs !mt-0`}
            />

            <button
              onClick={handleGenerateReport}
              className="btn-solid btn-pushable whitespace-nowrap"
            >
              <Search size={15} strokeWidth={2.5} />
              Generate
            </button>
          </div>
        </Field>
      </div>

      {loading && <Loader text="Generating report" />}

      {!loading && error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-danger border-l-4 bg-danger-soft pl-3 pr-3.5 py-3 mb-6"
        >
          <AlertTriangle
            size={15}
            strokeWidth={2}
            className="text-danger shrink-0 mt-0.5"
          />
          <p className="text-[0.8125rem] text-danger leading-relaxed">
            {error}
          </p>
        </div>
      )}

      {!loading && notFound && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-danger border-l-4 bg-danger-soft pl-3 pr-3.5 py-3 mb-6"
        >
          <AlertTriangle
            size={15}
            strokeWidth={2}
            className="text-danger shrink-0 mt-0.5"
          />
          <p className="text-[0.8125rem] text-danger leading-relaxed">
            Student Not Found — no record exists with ID{" "}
            <span className="font-mono font-semibold">{studentIdInput}</span>.
          </p>
        </div>
      )}

      {!loading && !notFound && !studentInfo && (
        <div className="surface p-5">
          <EmptyState
            icon={FileBarChart2}
            title="No report generated yet"
            hint="Enter a student ID above and click Generate"
          />
        </div>
      )}

      {!loading && studentInfo && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="surface p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge badge-neutral">01</span>
                <p className="label-mono">Student</p>
              </div>
              <p className="font-display font-bold text-xl text-ink tracking-tight">
                {studentInfo.student_name}
              </p>
              <p className="text-[0.8125rem] text-ink-soft mt-1">
                {studentInfo.department_name}
              </p>
            </div>

            <div className="surface p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="badge badge-neutral">02</span>
                <p className="label-mono">CGPA</p>
              </div>
              <p className="font-display font-extrabold text-4xl text-ink tracking-tight">
                {cgpaData ? Number(cgpaData.cgpa).toFixed(2) : "—"}
              </p>
              <p className="label-mono mt-2">
                {cgpaData
                  ? `${cgpaData.total_courses} course${cgpaData.total_courses > 1 ? "s" : ""}`
                  : "No results yet"}
              </p>
            </div>

            <div className="surface p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="badge badge-neutral">03</span>
                <p className="label-mono">Attendance</p>
              </div>
              <p className="font-display font-extrabold text-4xl text-ink tracking-tight">
                {attendanceSummary ? `${attendanceSummary.percentage}%` : "—"}
              </p>
              <p className="label-mono mt-2">
                {attendanceSummary
                  ? `${attendanceSummary.present}/${attendanceSummary.total} present`
                  : "No records yet"}
              </p>
            </div>
          </div>

          {/* Result History - grouped one section per course */}
          <div>
            <p className="font-display font-bold text-base text-ink tracking-tight mb-3">
              Result History
            </p>

            {courseGroups.length === 0 ? (
              <div className="surface">
                <p className="text-[0.8125rem] text-ink-soft px-5 py-6">
                  No results found for this student
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {courseGroups.map((group) => (
                  <div key={group.course_id} className="surface overflow-hidden">
                    {/* Course header */}
                    <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-line bg-paper">
                      <div className="min-w-0">
                        <p className="text-[0.8125rem] font-semibold text-ink">
                          {group.course_name}
                        </p>
                        <p className="label-mono mt-0.5">{group.course_code}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="label-mono">Final GPA</p>
                        <p className="font-display font-bold text-lg text-ink tracking-tight">
                          {group.avgGpa}
                        </p>
                      </div>
                    </div>

                    {/* Exam rows for this course */}
                    <div className="table-scroll">
                      <table className="data-table w-full">
                        <thead>
                          <tr className="border-b border-line">
                            <th className={TH}>Exam</th>
                            <th className={TH}>Marks</th>
                            <th className={TH}>Grade</th>
                            <th className={TH}>GPA</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((r) => (
                            <tr
                              key={r.result_id}
                              className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                            >
                              <td className="px-5 py-3 whitespace-nowrap">
                                <span className="inline-block border border-line bg-paper px-2 py-1 label-mono text-ink-soft">
                                  {r.exam_type}
                                </span>
                              </td>
                              <td className={`${TD} font-mono`}>
                                {r.marks_obtained} / {r.total_marks}
                              </td>
                              <td className="px-5 py-3 text-[0.8125rem] font-semibold text-ink">
                                {r.grade_letter}
                              </td>
                              <td className={`${TD} font-mono`}>{r.grade_point}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {attendanceSummary && attendanceSummary.total > 0 && (
            <div className="surface p-6">
              <p className="font-display font-bold text-base text-ink tracking-tight mb-5">
                Attendance Breakdown
              </p>

              <div className="flex gap-8">
                {[
                  { label: "Present", value: attendanceSummary.present, key: "Present" },
                  { label: "Absent", value: attendanceSummary.absent, key: "Absent" },
                  { label: "Late", value: attendanceSummary.late, key: "Late" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-3">
                    <span className={`w-2 h-2 shrink-0 ${STATUS_DOTS[item.key]}`} />
                    <div>
                      <p className="font-display font-bold text-2xl text-ink tracking-tight">
                        {item.value}
                      </p>
                      <p className="label-mono">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default Reports;