import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { FileText, Search, ChevronDown, ChevronUp, X } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  enrollment_id: "",
  exam_id: "",
  marks_obtained: "",
};

// Colour the grade so a failing result is obvious at a glance.
const gradeStyle = (grade) => {
  if (grade === "F") return "text-danger";
  if (grade === "D" || grade === "C") return "text-warn";
  return "text-ink";
};

// Same scale as backend/src/services/gradeService.js - kept in sync so the
// "overall" grade shown here always matches how a single exam is graded.
const gradeFromPercentage = (percentage) => {
  if (percentage >= 80) return { grade: "A+", grade_point: 4.0 };
  if (percentage >= 75) return { grade: "A", grade_point: 3.75 };
  if (percentage >= 70) return { grade: "A-", grade_point: 3.5 };
  if (percentage >= 65) return { grade: "B+", grade_point: 3.25 };
  if (percentage >= 60) return { grade: "B", grade_point: 3.0 };
  if (percentage >= 55) return { grade: "B-", grade_point: 2.75 };
  if (percentage >= 50) return { grade: "C+", grade_point: 2.5 };
  if (percentage >= 45) return { grade: "C", grade_point: 2.25 };
  if (percentage >= 40) return { grade: "D", grade_point: 2.0 };
  return { grade: "F", grade_point: 0.0 };
};

// Overall grade for a group of results = total marks obtained across every
// exam in that group, out of the total marks possible.
// UPDATED: If ANY individual exam has an "F" grade, the overall grade is automatically "F".
const overallGrade = (rows) => {
  if (!rows || rows.length === 0) return { grade: "—", grade_point: null, percentage: 0 };

  // Check if any individual exam has failed (F grade)
  const hasFailedExam = rows.some((r) => r.grade_letter === "F" || Number(r.grade_point) === 0);

  const obtained = rows.reduce((sum, r) => sum + Number(r.marks_obtained), 0);
  const total = rows.reduce((sum, r) => sum + Number(r.total_marks), 0);

  if (total === 0) return { grade: "—", grade_point: null, percentage: 0 };

  const percentage = (obtained / total) * 100;

  if (hasFailedExam) {
    return { grade: "F", grade_point: 0.0, percentage };
  }

  return { ...gradeFromPercentage(percentage), percentage };
};

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-3 label-mono whitespace-nowrap";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap";

function Results() {
  const [results, setResults] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // "student" -> pick a student by ID, see one row per course they're enrolled in.
  // "course" -> pick a course, see one row per student.
  const [viewMode, setViewMode] = useState("student");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // Student picker is an ID search, not a manual dropdown.
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentIdQuery, setStudentIdQuery] = useState("");

  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchResults();
    fetchEnrollments();
    fetchExams();
    fetchCourses();
    fetchStudents();
  }, []);

  const fetchResults = async () => {
    try {
      setError("");

      const res = await api.get("/results");
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await api.get("/exams");
      setExams(res.data.data);
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

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
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

  const openEditModal = (result) => {
    setFormData({
      enrollment_id: result.enrollment_id,
      exam_id: result.exam_id,
      marks_obtained: result.marks_obtained,
    });
    setEditingId(result.result_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.enrollment_id ||
      !formData.exam_id ||
      formData.marks_obtained === ""
    ) {
      alert("All fields are required");
      return;
    }

    if (Number(formData.marks_obtained) < 0) {
      alert("Marks obtained cannot be negative");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/results/${editingId}`, formData);
      } else {
        await api.post("/results", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchResults();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to save result. A result for this enrollment and exam may already exist."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/results/${deletingId}`);
      setDeletingId(null);
      fetchResults();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete result");
    }
  };

  const toggleExpanded = (key) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const switchMode = (mode) => {
    setViewMode(mode);
    setSearchTerm("");
    setExpandedKeys(new Set());
  };

  // ------------------------------------------------------------------
  // Student ID search (student mode only)
  // ------------------------------------------------------------------

  const studentIdMatches =
    studentIdQuery && !selectedStudentId
      ? students
          .filter((s) => String(s.student_id).includes(studentIdQuery.trim()))
          .slice(0, 8)
      : [];

  const selectedStudent = students.find(
    (s) => String(s.student_id) === String(selectedStudentId)
  );

  const pickStudent = (student) => {
    setSelectedStudentId(student.student_id);
    setStudentIdQuery("");
    setExpandedKeys(new Set());
  };

  const clearStudent = () => {
    setSelectedStudentId("");
    setStudentIdQuery("");
    setExpandedKeys(new Set());
  };

  // ------------------------------------------------------------------
  // Group results for the currently selected course/student.
  // ------------------------------------------------------------------

  const scopedResults =
    viewMode === "course"
      ? selectedCourseId
        ? results.filter(
            (r) => String(r.course_id) === String(selectedCourseId)
          )
        : []
      : selectedStudentId
      ? results.filter(
          (r) => String(r.student_id) === String(selectedStudentId)
        )
      : [];

  // course mode -> grouped by student. student mode -> grouped by course.
  const groupMap = new Map();

  scopedResults.forEach((r) => {
    const key = viewMode === "course" ? r.student_id : r.course_id;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        label: viewMode === "course" ? r.student_name : r.course_name,
        subLabel: viewMode === "student" ? r.course_code : null,
        rows: [],
      });
    }

    groupMap.get(key).rows.push(r);
  });

  let groups = Array.from(groupMap.values());

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    groups = groups.filter(
      (g) =>
        g.label.toLowerCase().includes(term) ||
        (g.subLabel && g.subLabel.toLowerCase().includes(term))
    );
  }

  const selectedCourse = courses.find(
    (c) => String(c.course_id) === String(selectedCourseId)
  );

  const nothingSelected =
    viewMode === "course" ? !selectedCourseId : !selectedStudentId;

  return (
    <MainLayout>
      <PageHeader
        title="Results"
        subtitle="Marks recorded per exam, with the grade letter and grade point derived automatically."
        actionLabel="Add Result"
        onAction={openCreateModal}
      />

      <div className="surface">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
          <div className="flex flex-wrap items-center gap-3">
            {/* Mode toggle */}
            <div className="inline-flex border border-line">
              <button
                onClick={() => switchMode("course")}
                className={`px-3 py-2 label-mono transition-colors ${
                  viewMode === "course"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper"
                }`}
              >
                By Course
              </button>
              <button
                onClick={() => switchMode("student")}
                className={`px-3 py-2 label-mono transition-colors border-l border-line ${
                  viewMode === "student"
                    ? "bg-ink text-paper"
                    : "text-ink-soft hover:bg-paper"
                }`}
              >
                By Student
              </button>
            </div>

            {viewMode === "course" ? (
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setExpandedKeys(new Set());
                }}
                className="control w-full sm:w-64"
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name} ({c.course_code})
                  </option>
                ))}
              </select>
            ) : selectedStudent ? (
              <div className="flex items-center gap-2 border border-line px-3 py-2 w-full sm:w-64">
                <span className="text-[0.8125rem] font-semibold text-ink truncate">
                  {selectedStudent.student_name}
                </span>
                <span className="font-mono text-ink-mute text-xs">
                  #{selectedStudent.student_id}
                </span>
                <button
                  onClick={clearStudent}
                  className="ml-auto text-ink-mute hover:text-ink"
                  title="Change student"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="relative w-full sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
                />

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Search by Student ID"
                  value={studentIdQuery}
                  onChange={(e) => setStudentIdQuery(e.target.value)}
                  className="control !pl-9"
                />

                {studentIdMatches.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full border border-line bg-paper max-h-56 overflow-y-auto">
                    {studentIdMatches.map((s) => (
                      <button
                        key={s.student_id}
                        onClick={() => pickStudent(s)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-[0.8125rem] hover:bg-line/40 transition-colors"
                      >
                        <span className="text-ink">{s.student_name}</span>
                        <span className="font-mono text-ink-mute text-xs">
                          #{s.student_id}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!nothingSelected && (
              <div className="relative w-full sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
                />

                <input
                  type="text"
                  placeholder={
                    viewMode === "course"
                      ? "Search student"
                      : "Search course"
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="control !pl-9"
                />
              </div>
            )}
          </div>

          {!nothingSelected && (
            <p className="label-mono">
              {groups.length} {viewMode === "course" ? "students" : "courses"}
            </p>
          )}
        </div>

        {loading ? (
          <Loader text="Loading results" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        ) : nothingSelected ? (
          <div className="p-5">
            <EmptyState
              icon={FileText}
              title={
                viewMode === "course"
                  ? "Select a course"
                  : "Search for a student"
              }
              hint={
                viewMode === "course"
                  ? "Choose a course above to see every student's grade"
                  : "Type a student ID above to see their grade by course"
              }
            />
          </div>
        ) : groups.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={FileText}
              title={
                scopedResults.length === 0
                  ? viewMode === "course"
                    ? `No results found for ${
                        selectedCourse?.course_name || "this course"
                      }`
                    : `No results found for ${
                        selectedStudent?.student_name || "this student"
                      }`
                  : "No matches for your search"
              }
              hint={
                scopedResults.length === 0
                  ? "Add the first result to get started"
                  : "Try a different name"
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper border-b border-line">
                  <th className={TH}>
                    {viewMode === "course" ? "Student" : "Course"}
                  </th>
                  <th className={`${TH} text-right`}>Grade</th>
                  <th className={`${TH} text-center`}>Details</th>
                </tr>
              </thead>

              <tbody>
                {groups.map((g) => {
                  const isOpen = expandedKeys.has(g.key);
                  const overall = overallGrade(g.rows);

                  return (
                    <>
                      <tr
                        key={g.key}
                        className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                      >
                        <td className="px-5 py-3.5 text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                          {g.label}
                          {g.subLabel && (
                            <span className="ml-2 font-mono text-ink-mute">
                              {g.subLabel}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <span
                            className={`font-mono text-sm font-semibold ${gradeStyle(
                              overall.grade
                            )}`}
                          >
                            {overall.grade}
                          </span>
                          {overall.grade_point !== null && (
                            <span className="ml-2 font-mono text-xs text-ink-mute">
                              {overall.grade_point.toFixed(2)}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => toggleExpanded(g.key)}
                            className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 label-mono text-ink-soft hover:bg-paper transition-colors"
                          >
                            {isOpen ? (
                              <>
                                Hide Details
                                <ChevronUp size={14} />
                              </>
                            ) : (
                              <>
                                Show Details
                                <ChevronDown size={14} />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr className="border-b border-line last:border-b-0">
                          <td colSpan={3} className="bg-paper px-5 py-4">
                            <table className="w-full border-collapse border border-line">
                              <thead>
                                <tr className="border-b border-line">
                                  <th className={TH}>
                                    {viewMode === "course"
                                      ? "Exam"
                                      : "Course / Exam"}
                                  </th>
                                  <th className={`${TH} text-right`}>
                                    Marks
                                  </th>
                                  <th className={`${TH} text-right`}>
                                    Grade
                                  </th>
                                  <th className={`${TH} text-right`}>GPA</th>
                                  <th className={`${TH} text-center`}>
                                    Action
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {g.rows.map((r) => (
                                  <tr
                                    key={r.result_id}
                                    className="border-b border-line last:border-b-0"
                                  >
                                    <td className="px-5 py-3 text-[0.8125rem]">
                                      <span className="inline-block border border-line px-2 py-1 label-mono text-ink-soft">
                                        {r.exam_type}
                                      </span>
                                      {viewMode === "student" && (
                                        <span className="ml-2 text-ink-soft">
                                          {r.course_name}
                                        </span>
                                      )}
                                    </td>

                                    <td className={`${TD} font-mono text-right`}>
                                      {Number(r.marks_obtained).toFixed(0)}
                                      <span className="text-ink-mute">
                                        {" / "}
                                        {Number(r.total_marks).toFixed(0)}
                                      </span>
                                    </td>

                                    <td
                                      className={`px-5 py-3 font-mono text-sm font-semibold text-right ${gradeStyle(
                                        r.grade_letter
                                      )}`}
                                    >
                                      {r.grade_letter || "—"}
                                    </td>

                                    <td className={`${TD} font-mono text-right`}>
                                      {r.grade_point === null ||
                                      r.grade_point === undefined
                                        ? "—"
                                        : Number(r.grade_point).toFixed(2)}
                                    </td>

                                    <td className="px-5 py-3">
                                      <RowActions
                                        onEdit={() => openEditModal(r)}
                                        onDelete={() =>
                                          setDeletingId(r.result_id)
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingId ? "Edit Result" : "Add Result"}
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

          <Field label="Exam">
            <select
              name="exam_id"
              value={formData.exam_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Exam</option>
              {exams.map((ex) => (
                <option key={ex.exam_id} value={ex.exam_id}>
                  {ex.course_name} — {ex.exam_type} (Total: {ex.total_marks})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Marks Obtained">
            <input
              type="number"
              step="0.01"
              min="0"
              name="marks_obtained"
              placeholder="e.g. 78"
              value={formData.marks_obtained}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <p className="text-xs text-ink-mute -mt-1 border-l-2 border-line pl-3">
            The grade letter and grade point are calculated automatically from
            the exam's total marks.
          </p>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Result"
          message="Are you sure you want to delete this result? It will affect the student's CGPA."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Results;