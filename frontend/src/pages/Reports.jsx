import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Search, FileBarChart2 } from "lucide-react";

function Reports() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [loading, setLoading] = useState(false);
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
    if (!selectedStudentId) {
      alert("Please select a student");
      return;
    }

    setLoading(true);
    setStudentInfo(null);
    setCgpaData(null);
    setResultRows([]);
    setAttendanceSummary(null);

    try {
      const student = students.find(
        (s) => String(s.student_id) === String(selectedStudentId)
      );
      setStudentInfo(student);

      // CGPA
      try {
        const cgpaRes = await api.get(`/cgpa/${selectedStudentId}`);
        setCgpaData(cgpaRes.data.data);
      } catch (err) {
        setCgpaData(null);
      }

      // Results
      const resultsRes = await api.get("/results");
      const filteredResults = resultsRes.data.data.filter(
        (r) => String(r.student_id) === String(selectedStudentId)
      );
      setResultRows(filteredResults);

      // Attendance
      const attendanceRes = await api.get("/attendance");
      const filteredAttendance = attendanceRes.data.data.filter(
        (a) => String(a.student_id) === String(selectedStudentId)
      );

      const total = filteredAttendance.length;
      const present = filteredAttendance.filter(
        (a) => a.status === "Present"
      ).length;
      const absent = filteredAttendance.filter(
        (a) => a.status === "Absent"
      ).length;
      const late = filteredAttendance.filter(
        (a) => a.status === "Late"
      ).length;

      setAttendanceSummary({
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? ((present / total) * 100).toFixed(1) : "0.0",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500 mt-1">Student academic report summary</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <label className="text-sm font-medium text-slate-600">Student</label>
        <div className="flex gap-3 mt-1">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="border w-full max-w-md rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_name}
              </option>
            ))}
          </select>

          <button
            onClick={handleGenerateReport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Search size={18} />
            Generate Report
          </button>
        </div>
      </div>

      {loading && <p className="text-blue-600">Generating report...</p>}

      {!loading && !studentInfo && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <FileBarChart2 size={40} className="mb-3" />
          <p className="font-medium">No report generated yet</p>
          <p className="text-sm">Select a student and click Generate Report</p>
        </div>
      )}

      {!loading && studentInfo && (
        <div className="space-y-6">
          {/* Student Info + CGPA + Attendance Summary */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm text-slate-500 mb-1">Student</p>
              <p className="text-xl font-bold text-slate-800">
                {studentInfo.student_name}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {studentInfo.department_name}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
              <p className="text-sm text-slate-500 mb-1">CGPA</p>
              <p className="text-3xl font-bold text-blue-600">
                {cgpaData ? Number(cgpaData.cgpa).toFixed(2) : "N/A"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {cgpaData
                  ? `${cgpaData.total_courses} course${
                      cgpaData.total_courses > 1 ? "s" : ""
                    }`
                  : "No results yet"}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
              <p className="text-sm text-slate-500 mb-1">Attendance</p>
              <p className="text-3xl font-bold text-green-600">
                {attendanceSummary ? `${attendanceSummary.percentage}%` : "N/A"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {attendanceSummary
                  ? `${attendanceSummary.present}/${attendanceSummary.total} present`
                  : "No records yet"}
              </p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Result History</h2>
            </div>

            {resultRows.length === 0 ? (
              <p className="text-slate-400 p-6 text-sm">No results found for this student</p>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-slate-500">Course</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-500">Exam</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-500">Marks</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-500">Grade</th>
                    <th className="text-left p-4 text-sm font-semibold text-slate-500">GPA</th>
                  </tr>
                </thead>
                <tbody>
                  {resultRows.map((r) => (
                    <tr
                      key={r.result_id}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-800">{r.course_name}</td>
                      <td className="p-4 text-slate-600">{r.exam_type}</td>
                      <td className="p-4 text-slate-600">
                        {r.marks_obtained} / {r.total_marks}
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{r.grade_letter}</td>
                      <td className="p-4 text-slate-600">{r.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Attendance Breakdown */}
          {attendanceSummary && attendanceSummary.total > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h2 className="font-semibold text-slate-800 mb-4">Attendance Breakdown</h2>
              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {attendanceSummary.present}
                  </p>
                  <p className="text-sm text-slate-500">Present</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {attendanceSummary.absent}
                  </p>
                  <p className="text-sm text-slate-500">Absent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">
                    {attendanceSummary.late}
                  </p>
                  <p className="text-sm text-slate-500">Late</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}

export default Reports;