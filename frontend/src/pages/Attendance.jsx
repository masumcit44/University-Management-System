import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { toDateInput, todayInputValue } from "../services/date";
import { CalendarCheck, BookOpen, User, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import SortableTh from "../components/SortableTh";
import Field, { CONTROL_CLASS } from "../components/Field";
import { useSort } from "../services/useSort";

// Small colour square per status - rendered inside the status badge
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

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-3 label-mono whitespace-nowrap align-middle";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

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
    (a, b) => (a < b ? 1 : a > b ? -1 : 0)
  );

// Sort records chronologically (oldest first) - reads like a history log
const sortByDateAsc = (records) =>
  [...records].sort((a, b) => {
    const x = toDateInput(a.attendance_date);
    const y = toDateInput(b.attendance_date);
    return x < y ? -1 : x > y ? 1 : 0;
  });

function Attendance() {
  // "course" -> pick a course, then pick a date, see that day's roster
  // "student"-> type a student ID, then pick a course, see every date's status
  // Teachers are scoped to their assigned courses (backend enforces this too)
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isTeacher = currentUser?.role === "teacher";
  const isStudent = currentUser?.role === "student";
  const canManage = !isStudent;

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
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // "Mark Attendance" modal state - roster + per-student status picker
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markDate, setMarkDate] = useState("");
  const [markRoster, setMarkRoster] = useState([]);
  const [markRecords, setMarkRecords] = useState([]);
  const [markDrafts, setMarkDrafts] = useState({});
  const [markSaved, setMarkSaved] = useState({});
  const [markBusy, setMarkBusy] = useState(false);
  const [markError, setMarkError] = useState("");

  useEffect(() => {
    // Students land straight on their own attendance - no search, no writes.
    if (isStudent) {
      if (currentUser.student_id) {
        setMode("student");
        setSearchedStudentId(currentUser.student_id);
        setLoading(true);
        api
          .get(`/attendance/student/${currentUser.student_id}`)
          .then((res) => setStudentResults(res.data.data))
          .catch((err) => {
            console.error(err);
            setError("Failed to load your attendance");
          })
          .finally(() => setLoading(false));
      } else {
        setError(
          "No student profile is linked to your account. Please contact the administration."
        );
      }
      return;
    }

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

  // Teachers only see their assigned courses in every dropdown
  const fetchCourses = async () => {
    try {
      const res = isTeacher
        ? await api.get("/teacher-courses/my")
        : await api.get("/courses");
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

  // =======================
  // "Mark Attendance" - roster-driven bulk marking for one course + date
  // =======================
  const openMarkModal = async () => {
    if (!selectedCourseId) return;

    setMarkDate(todayInputValue());
    setMarkDrafts({});
    setMarkSaved({});
    setShowMarkModal(true);

    try {
      setMarkBusy(true);

      // Teacher roster comes from the scoped endpoint; admin derives it from
      // the full enrollment list (approved only)
      let roster;
      if (isTeacher) {
        const res = await api.get(`/enrollments/course/${selectedCourseId}`);
        roster = res.data.data.map((r) => ({
          enrollment_id: r.enrollment_id,
          student_name: r.student_name,
        }));
      } else {
        roster = enrollments
          .filter(
            (e) =>
              String(e.course_id) === String(selectedCourseId) &&
              e.status === "approved"
          )
          .map((e) => ({
            enrollment_id: e.enrollment_id,
            student_name: e.student_name,
          }));
      }

      setMarkRoster(roster);

      const rec = await api.get(`/attendance/course/${selectedCourseId}`);
      setMarkRecords(rec.data.data);
    } catch (err) {
      console.error(err);
      setMarkError(err.response?.data?.message || "Failed to load roster");
    } finally {
      setMarkBusy(false);
    }
  };

  const existingFor = (enrollment_id) =>
    markRecords.find(
      (r) =>
        String(r.enrollment_id) === String(enrollment_id) &&
        toDateInput(r.attendance_date) === markDate
    );

  const rowStatus = (enrollment_id) => {
    if (markDrafts[enrollment_id]) return markDrafts[enrollment_id];
    const ex = existingFor(enrollment_id);
    return ex ? ex.status : "Present";
  };

  const setRowStatus = (enrollment_id, status) => {
    setMarkDrafts((prev) => ({ ...prev, [enrollment_id]: status }));
    setMarkSaved((prev) => ({ ...prev, [enrollment_id]: false }));
  };

  const saveRow = async (enrollment_id) => {
    const status = rowStatus(enrollment_id);
    const ex = existingFor(enrollment_id);

    try {
      setMarkBusy(true);

      if (ex) {
        await api.put(`/attendance/${ex.attendance_id}`, {
          enrollment_id,
          attendance_date: markDate,
          status,
        });
      } else {
        await api.post("/attendance", {
          enrollment_id,
          attendance_date: markDate,
          status,
        });
      }

      setMarkSaved((prev) => ({ ...prev, [enrollment_id]: true }));
      refreshCurrentView();
    } catch (err) {
      console.error(err);
      setMarkError(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setMarkBusy(false);
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
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setFormData({
      enrollment_id: record.enrollment_id,
      attendance_date: toDateInput(record.attendance_date),
      status: record.status,
    });
    setEditingId(record.attendance_id);
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.enrollment_id) newErrors.enrollment_id = "Select an enrollment";
    if (!formData.attendance_date) newErrors.attendance_date = "Date is required";
    if (!formData.status) newErrors.status = "Select a status";

    setErrors(newErrors);
    setModalError("");
    if (Object.keys(newErrors).length) return;

    try {
      if (editingId) {
        await api.put(`/attendance/${editingId}`, formData);
      } else {
        await api.post("/attendance", formData);
      }

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setSaved(false);
        refreshCurrentView();
      }, 600);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to save attendance");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/attendance/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      refreshCurrentView();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete attendance");
    }
  };

  const statusBadge = (status) => (
    <span
      className={`badge ${
        status === "Present"
          ? "badge-ok"
          : status === "Absent"
          ? "badge-danger"
          : status === "Late"
          ? "badge-warn"
          : "badge-neutral"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 shrink-0 ${STATUS_DOTS[status] || "bg-ink-mute"}`}
      />
      {status}
    </span>
  );

  // Coloured count summary - "<n> Present · <n> Absent · <n> Late [· extra]".
  // Each count carries a letter glyph (P/A/L) so meaning isn't color-only.
  const summaryLine = (s, extra) => (
    <span className="label-mono">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 h-4 inline-flex items-center justify-center border border-ok/40 bg-ok-soft font-mono text-[0.5625rem] font-bold text-ok">
          P
        </span>
        <span className="font-mono text-ok">{s.Present}</span> Present
      </span>
      <span className="text-line px-1.5">·</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 h-4 inline-flex items-center justify-center border border-danger/40 bg-danger-soft font-mono text-[0.5625rem] font-bold text-danger">
          A
        </span>
        <span className="font-mono text-danger">{s.Absent}</span> Absent
      </span>
      <span className="text-line px-1.5">·</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 h-4 inline-flex items-center justify-center border border-warn/40 bg-warn-soft font-mono text-[0.5625rem] font-bold text-warn">
          L
        </span>
        <span className="font-mono text-warn">{s.Late}</span> Late
      </span>
      {extra && (
        <>
          <span className="text-line px-1.5">·</span>
          <span className="font-mono text-ink">{extra}</span>
        </>
      )}
    </span>
  );

  // Mono legend - documents the P/A/L glyphs used in the summary line.
  const statusLegend = (
    <p className="label-mono text-ink-mute flex items-center gap-4 px-5 py-3 border-t border-line flex-wrap">
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 h-4 inline-flex items-center justify-center border border-ok/40 bg-ok-soft font-mono text-[0.5625rem] font-bold text-ok">
          P
        </span>
        Present &mdash; attended
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 h-4 inline-flex items-center justify-center border border-danger/40 bg-danger-soft font-mono text-[0.5625rem] font-bold text-danger">
          A
        </span>
        Absent &mdash; missed class
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="w-4 h-4 inline-flex items-center justify-center border border-warn/40 bg-warn-soft font-mono text-[0.5625rem] font-bold text-warn">
          L
        </span>
        Late &mdash; arrived after start
      </span>
    </p>
  );

  // =======================
  // Table renderer - ID Column Removed
  // =======================
  const AttendanceTable = ({ records, showStudent = true, showDate = false }) => {
    const { sorted, sortKey, sortDir, toggle } = useSort(records, {
      accessors: {
        student: (record) => String(record.student_name ?? ""),
        date: (record) => String(record.attendance_date ?? ""),
        status: (record) => String(record.status ?? ""),
      },
    });

    return (
      <div className="table-scroll">
        <table className="data-table w-full">
          <thead>
            <tr className="bg-paper border-b border-line">
              {showStudent && (
                <SortableTh
                  label="Student"
                  sortKey="student"
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggle}
                  className={TH}
                />
              )}
              {showDate && (
                <SortableTh
                  label="Date"
                  sortKey="date"
                  activeKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggle}
                  className={TH}
                />
              )}
              <SortableTh
                label="Status"
                sortKey="status"
                activeKey={sortKey}
                sortDir={sortDir}
                onSort={toggle}
                className={TH}
              />
              {canManage && <th className={`${TH} text-center`}>Action</th>}
            </tr>
          </thead>

          <tbody>
            {sorted.map((record) => (
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

                {canManage && (
                  <td className="px-5 py-3.5">
                    <RowActions
                      onEdit={() => openEditModal(record)}
                      onDelete={() => setDeletingId(record.attendance_id)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
            {summaryLine(s)}
          </div>
          <AttendanceTable
            records={dateFilteredRecords}
            showStudent={true}
            showDate={false}
          />
          {statusLegend}
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
            hint={
              isStudent
                ? "Attendance will appear once your teachers record class sessions"
                : "Add the first attendance record to get started"
            }
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
          {summaryLine(s, `${presentPct}% attendance`)}
        </div>
        <AttendanceTable
          records={studentCourseRecords}
          showStudent={false}
          showDate={true}
        />
        {statusLegend}
      </>
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title={isStudent ? "My Attendance" : "Attendance"}
        subtitle={
          isStudent
            ? "Your course-by-course presence log, with a live attendance percentage."
            : "Course by course presence log, recorded against each enrollment."
        }
        actionLabel={canManage ? "Add Attendance" : undefined}
        onAction={canManage ? openCreateModal : undefined}
      />

      <div className="surface">
        {/* Mode toggle - students only ever see their own attendance */}
        {canManage && (
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
        )}

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

              {canManage && selectedCourseId && (
                <button
                  onClick={openMarkModal}
                  className="btn-solid btn-pushable"
                >
                  Mark Attendance
                </button>
              )}
            </>
          )}

          {mode === "student" && (
            <>
              {canManage && (
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <input
                    type="number"
                    placeholder="Type Student ID"
                    value={studentIdInput}
                    onChange={(e) => setStudentIdInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleStudentIdSearch()}
                    className={`${CONTROL_CLASS} !mt-0 w-full sm:w-52`}
                  />

                  <button onClick={handleStudentIdSearch} className="btn-solid btn-pushable">
                    <Search size={15} strokeWidth={2.5} />
                    Search
                  </button>
                </div>
              )}

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

      {canManage && showMarkModal && (
        <Modal
          title="Mark Attendance"
          onClose={() => setShowMarkModal(false)}
          hideActions
          modalError={markError}
        >
          <Field label="Class Date">
            <input
              type="date"
              value={markDate}
              onChange={(e) => {
                setMarkDate(e.target.value);
                setMarkSaved({});
              }}
              className={CONTROL_CLASS}
            />
          </Field>

          <div className="mt-1 mb-3 flex items-center justify-between">
            <p className="label-mono text-ink-mute">
              {markRoster.length} student{markRoster.length !== 1 ? "s" : ""} in
              this course
            </p>
            <p className="label-mono text-ink-mute">
              {markDate ? "on " + markDate : "pick a date"}
            </p>
          </div>

          {markBusy && !markRoster.length ? (
            <Loader text="Loading roster" />
          ) : markRoster.length === 0 ? (
            <p className="text-[0.8125rem] text-ink-soft">
              No approved enrollments in this course yet.
            </p>
          ) : (
            <div className="table-scroll border border-line">
              <table className="data-table w-full">
                <thead>
                  <tr className="bg-paper border-b border-line">
                    <th className={TH}>Student</th>
                    <th className={`${TH} text-center`}>Status</th>
                    <th className={`${TH} text-center`}>Save</th>
                  </tr>
                </thead>

                <tbody>
                  {markRoster.map((row) => {
                    const isSaved = markSaved[row.enrollment_id];
                    const hasRecord = !!existingFor(row.enrollment_id);

                    return (
                      <tr
                        key={row.enrollment_id}
                        className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                      >
                        <td className="px-5 py-2.5 text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                          {row.student_name}
                        </td>

                        <td className="px-5 py-2.5 text-center whitespace-nowrap">
                          <select
                            value={rowStatus(row.enrollment_id)}
                            onChange={(e) =>
                              setRowStatus(row.enrollment_id, e.target.value)
                            }
                            disabled={isSaved}
                            className="control !mt-0 !py-1.5 !text-[0.75rem] w-32"
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Late">Late</option>
                          </select>
                        </td>

                        <td className="px-5 py-2.5 text-center whitespace-nowrap">
                          {isSaved ? (
                            <span className="label-mono text-ok">
                              {hasRecord ? "Updated" : "Saved"}
                            </span>
                          ) : (
                            <button
                              onClick={() => saveRow(row.enrollment_id)}
                              disabled={markBusy}
                              className="btn-ghost btn-pushable !py-1 !px-2.5 text-[0.6875rem] disabled:opacity-40"
                            >
                              {hasRecord ? "Update" : "Save"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}

      {canManage && showModal && (
        <Modal
          title={editingId ? "Edit Attendance" : "Add Attendance"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
          saved={saved}
          modalError={modalError}
          saveHint="ENROLLMENT + DATE + STATUS required"
        >
          <Field label="Enrollment" error={errors.enrollment_id}>
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

          <Field label="Date" error={errors.attendance_date}>
            <input
              type="date"
              name="attendance_date"
              value={formData.attendance_date}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Status" error={errors.status}>
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

      {canManage && deletingId && (
        <ConfirmDialog
          title="Delete Attendance"
          message="Are you sure you want to delete this attendance record?"
          error={deleteError}
          onCancel={() => {
            setDeletingId(null);
            setDeleteError("");
          }}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Attendance;