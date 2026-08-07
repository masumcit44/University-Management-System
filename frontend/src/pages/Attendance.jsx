import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { CalendarCheck, BookOpen, User, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

// Small colour square per status - no pills, keeps the ledger look
const STATUS_DOTS = {
  Present: "bg-accent",
  Absent: "bg-danger",
  Late: "bg-warn",
};

const EMPTY_FORM = {
  enrollment_id: "",
  attendance_date: "",
  status: "",
};

// MySQL DATE columns arrive as ISO strings; <input type="date"> needs YYYY-MM-DD.
const toDateInput = (value) => (value ? String(value).split("T")[0] : "");

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-3 label-mono whitespace-nowrap";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap";

// Distinct course options out of a flat records array (for a course dropdown)
const distinctCourses = (records) => {
  const map = new Map();
  records.forEach((r) => {
    if (!map.has(r.course_id)) {
      map.set(r.course_id, {
        course_id: r.course_id,
        course_name: r.course_name,
        course_code: r.course_code,
      });
    }
  });
  return Array.from(map.values());
};

// Distinct dates out of a flat records array, newest first
const distinctDates = (records) =>
  [...new Set(records.map((r) => toDateInput(r.attendance_date)))].sort(
    (a, b) => (a < b ? 1 : -1)
  );

// Sort records chronologically (oldest first) - reads like a history log
const sortByDateAsc = (records) =>
  [...records].sort((a, b) =>
    toDateInput(a.attendance_date) < toDateInput(b.attendance_date) ? -1 : 1
  );

function Attendance() {
  // "course" -> pick a course, then pick a date, see that day's roster
  // "student"-> type a student ID, then pick a course, see every date's status
  const [mode, setMode] = useState("course");

  const [courseResults, setCourseResults] = useState(null);
  const [studentResults, setStudentResults] = useState(null);

  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [studentIdInput, setStudentIdInput] = useState("");
  const [searchedStudentId, setSearchedStudentId] = useState("");
  const [selectedStudentCourseId, setSelectedStudentCourseId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchEnrollments();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =======================
  // Mode switching
  // =======================
  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");

    setSelectedCourseId("");
    setSelectedDate("");
    setCourseResults(null);

    setStudentIdInput("");
    setSearchedStudentId("");
    setSelectedStudentCourseId("");
    setStudentResults(null);
  };

  const handleCourseSearch = async (course_id) => {
    setSelectedCourseId(course_id);
    setSelectedDate("");
    setCourseResults(null);

    if (!course_id) return;

    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/attendance/course/${course_id}`);
      setCourseResults(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load course attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentIdSearch = async () => {
    if (!studentIdInput) return;

    setSearchedStudentId(studentIdInput);
    setSelectedStudentCourseId("");
    setStudentResults(null);

    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/attendance/student/${studentIdInput}`);
      setStudentResults(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load student attendance");
    } finally {
      setLoading(false);
    }
  };

  // Refreshes whichever view is currently active, after create/edit/delete
  const refreshCurrentView = () => {
    if (mode === "course" && selectedCourseId) {
      handleCourseSearch(selectedCourseId);
    } else if (mode === "student" && searchedStudentId) {
      api
        .get(`/attendance/student/${searchedStudentId}`)
        .then((res) => setStudentResults(res.data.data))
        .catch((err) => console.error(err));
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setFormData({
      enrollment_id: record.enrollment_id,
      attendance_date: toDateInput(record.attendance_date),
      status: record.status,
    });
    setEditingId(record.attendance_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.enrollment_id ||
      !formData.attendance_date ||
      !formData.status
    ) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/attendance/${editingId}`, formData);
      } else {
        await api.post("/attendance", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      refreshCurrentView();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save attendance");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/attendance/${deletingId}`);
      setDeletingId(null);
      refreshCurrentView();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete attendance");
    }
  };

  const statusBadge = (status) => (
    <span className="inline-flex items-center gap-2">
      <span
        className={`w-2 h-2 shrink-0 ${STATUS_DOTS[status] || "bg-ink-mute"}`}
      />
      <span className="label-mono !text-ink">{status}</span>
    </span>
  );

  // =======================
  // Table renderer - ID Column Removed
  // =======================
  const AttendanceTable = ({ records, showStudent = true, showDate = false }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-paper border-b border-line">
            {showStudent && <th className={TH}>Student</th>}
            {showDate && <th className={TH}>Date</th>}
            <th className={TH}>Status</th>
            <th className={`${TH} text-center`}>Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr
              key={record.attendance_id}
              className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
            >
              {showStudent && (
                <td className="px-5 py-3.5 text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                  {record.student_name}
                </td>
              )}

              {showDate && (
                <td className={`${TD} font-mono`}>
                  {toDateInput(record.attendance_date)}
                </td>
              )}

              <td className="px-5 py-3.5 whitespace-nowrap">
                {statusBadge(record.status)}
              </td>

              <td className="px-5 py-3.5">
                <RowActions
                  onEdit={() => openEditModal(record)}
                  onDelete={() => setDeletingId(record.attendance_id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const summarize = (records) => ({
    Present: records.filter((r) => r.status === "Present").length,
    Absent: records.filter((r) => r.status === "Absent").length,
    Late: records.filter((r) => r.status === "Late").length,
  });

  // =======================
  // "Course" mode - course -> date drill-down (one day's roster)
  // =======================
  const courseDates = courseResults ? distinctDates(courseResults) : [];

  const dateFilteredRecords = (courseResults || []).filter(
    (r) => toDateInput(r.attendance_date) === selectedDate
  );

  // =======================
  // "Student" mode - student -> course (full date history for that course)
  // =======================
  const studentCourses = studentResults ? distinctCourses(studentResults) : [];

  const studentCourseRecords = sortByDateAsc(
    (studentResults || []).filter(
      (r) => String(r.course_id) === String(selectedStudentCourseId)
    )
  );

  const renderBody = () => {
    if (loading) return <Loader text="Loading attendance" />;

    if (error) {
      return <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>;
    }

    if (mode === "course") {
      if (!selectedCourseId) {
        return (
          <div className="p-5">
            <EmptyState
              icon={BookOpen}
              title="Select a course"
              hint="Choose a course above, then pick a class date to see that day's roster"
            />
          </div>
        );
      }

      if (courseDates.length === 0) {
        return (
          <div className="p-5">
            <EmptyState
              icon={CalendarCheck}
              title="No attendance recorded for this course yet"
              hint="Add the first attendance record to get started"
            />
          </div>
        );
      }

      if (!selectedDate) {
        return (
          <div className="p-5">
            <EmptyState
              icon={CalendarCheck}
              title="Select a date"
              hint={`${courseDates.length} class dates recorded for this course - pick one above`}
            />
          </div>
        );
      }

      const s = summarize(dateFilteredRecords);

      return (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-paper border-b border-line">
            <p className="label-mono">
              {dateFilteredRecords.length} students on {selectedDate}
            </p>
            <p className="label-mono">
              {s.Present} Present · {s.Absent} Absent · {s.Late} Late
            </p>
          </div>
          <AttendanceTable
            records={dateFilteredRecords}
            showStudent={true}
            showDate={false}
          />
        </>
      );
    }

    // mode === "student"
    if (!searchedStudentId) {
      return (
        <div className="p-5">
          <EmptyState
            icon={User}
            title="Enter a student ID"
            hint="Type a student ID above and press Search to begin"
          />
        </div>
      );
    }

    if (studentCourses.length === 0) {
      return (
        <div className="p-5">
          <EmptyState
            icon={CalendarCheck}
            title="No attendance recorded for this student yet"
            hint="Add the first attendance record to get started"
          />
        </div>
      );
    }

    if (!selectedStudentCourseId) {
      return (
        <div className="p-5">
          <EmptyState
            icon={BookOpen}
            title="Select a course"
            hint={`This student is enrolled in ${studentCourses.length} course(s) - pick one above`}
          />
        </div>
      );
    }

    const s = summarize(studentCourseRecords);
    const total = studentCourseRecords.length;
    const presentPct = total ? Math.round((s.Present / total) * 100) : 0;

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-paper border-b border-line">
          <p className="label-mono">{total} class dates recorded</p>
          <p className="label-mono">
            {s.Present} Present · {s.Absent} Absent · {s.Late} Late ·{" "}
            {presentPct}% attendance
          </p>
        </div>
        <AttendanceTable
          records={studentCourseRecords}
          showStudent={false}
          showDate={true}
        />
      </>
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Attendance"
        subtitle="Course by course presence log, recorded against each enrollment."
        actionLabel="Add Attendance"
        onAction={openCreateModal}
      />

      <div className="surface">
        {/* Mode toggle */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-b border-line">
          <button
            onClick={() => switchMode("course")}
            className={`label-mono px-3 py-1.5 border ${
              mode === "course"
                ? "border-ink text-ink bg-paper"
                : "border-line text-ink-mute"
            }`}
          >
            Search By Course
          </button>

          <button
            onClick={() => switchMode("student")}
            className={`label-mono px-3 py-1.5 border ${
              mode === "student"
                ? "border-ink text-ink bg-paper"
                : "border-line text-ink-mute"
            }`}
          >
            Search By Student ID
          </button>
        </div>

        {/* Mode-specific toolbar */}
        <div className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-line">
          {mode === "course" && (
            <>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseSearch(e.target.value)}
                className={`${CONTROL_CLASS} !mt-0 w-full sm:w-72`}
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_code} — {c.course_name}
                  </option>
                ))}
              </select>

              {courseDates.length > 0 && (
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`${CONTROL_CLASS} !mt-0 w-full sm:w-52`}
                >
                  <option value="">Select Date</option>
                  {courseDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          {mode === "student" && (
            <>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <input
                  type="number"
                  placeholder="Type Student ID"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStudentIdSearch()}
                  className={`${CONTROL_CLASS} !mt-0 w-full sm:w-52`}
                />

                <button onClick={handleStudentIdSearch} className="btn-solid">
                  <Search size={15} strokeWidth={2.5} />
                  Search
                </button>
              </div>

              {studentCourses.length > 0 && (
                <select
                  value={selectedStudentCourseId}
                  onChange={(e) => setSelectedStudentCourseId(e.target.value)}
                  className={`${CONTROL_CLASS} !mt-0 w-full sm:w-72`}
                >
                  <option value="">Select Course</option>
                  {studentCourses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_code} — {c.course_name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}
        </div>

        {renderBody()}
      </div>

      {showModal && (
        <Modal
          title={editingId ? "Edit Attendance" : "Add Attendance"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Enrollment">
            <select
              name="enrollment_id"
              value={formData.enrollment_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Enrollment</option>
              {enrollments.map((e) => (
                <option key={e.enrollment_id} value={e.enrollment_id}>
                  {e.student_name} — {e.course_name} ({e.course_code})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              name="attendance_date"
              value={formData.attendance_date}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Status">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </Field>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Attendance"
          message="Are you sure you want to delete this attendance record?"
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Attendance;