import MainLayout from "../layouts/MainLayout";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  ClipboardList,
  Search,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  student_id: "",
  course_id: "",
  semester: "",
  session: "",
};

// Shared table cell styles - reused inside every course group
const TH = "text-left px-4 py-2.5 label-mono whitespace-nowrap";
const TD = "px-4 py-3 text-[0.8125rem] text-ink-soft whitespace-nowrap";

// Joins a set of values into "A, B, C" for display, e.g. mixed semesters/sessions
function joinDistinct(values) {
  return Array.from(new Set(values)).sort();
}

function Enrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setError("");

      const res = await api.get("/enrollments");
      setEnrollments(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load enrollments");
    } finally {
      setLoading(false);
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

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.data);
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

  const openEditModal = (enrollment) => {
    setFormData({
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      semester: enrollment.semester,
      session: enrollment.session,
    });
    setEditingId(enrollment.enrollment_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.student_id ||
      !formData.course_id ||
      !formData.semester ||
      !formData.session
    ) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/enrollments/${editingId}`, formData);
      } else {
        await api.post("/enrollments", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchEnrollments();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to save enrollment. This student may already be enrolled in that course for the same semester and session."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/enrollments/${deletingId}`);
      setDeletingId(null);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete enrollment");
    }
  };

  // department_name per course_id, sourced from the courses list
  const departmentByCourse = useMemo(() => {
    const map = new Map();
    courses.forEach((c) => map.set(c.course_id, c.department_name));
    return map;
  }, [courses]);

  const term = searchTerm.trim().toLowerCase();

  // Search matches course name or course code only - matching groups keep every student
  const filteredEnrollments = useMemo(() => {
    if (!term) return enrollments;

    return enrollments.filter(
      (e) =>
        e.course_name.toLowerCase().includes(term) ||
        e.course_code.toLowerCase().includes(term)
    );
  }, [enrollments, term]);

  // Course -> list of enrolled students
  const groups = useMemo(() => {
    const byCourse = new Map();

    filteredEnrollments.forEach((e) => {
      if (!byCourse.has(e.course_id)) {
        byCourse.set(e.course_id, {
          course_id: e.course_id,
          course_name: e.course_name,
          course_code: e.course_code,
          enrollments: [],
        });
      }
      byCourse.get(e.course_id).enrollments.push(e);
    });

    return Array.from(byCourse.values())
      .map((group) => ({
        ...group,
        enrollments: [...group.enrollments].sort((a, b) =>
          a.student_name.localeCompare(b.student_name)
        ),
        semesters: joinDistinct(group.enrollments.map((e) => e.semester)),
        sessions: joinDistinct(group.enrollments.map((e) => e.session)),
        department_name: departmentByCourse.get(group.course_id) || "",
      }))
      .sort((a, b) => a.course_code.localeCompare(b.course_code));
  }, [filteredEnrollments, departmentByCourse]);

  const toggleCourse = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const jumpToCourse = (id) => {
    setCollapsed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    requestAnimationFrame(() => {
      document
        .getElementById(`course-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const allCollapsed =
    groups.length > 0 && groups.every((g) => collapsed.has(g.course_id));

  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsed(new Set());
    } else {
      setCollapsed(new Set(groups.map((g) => g.course_id)));
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Enrollment"
        subtitle="Which students sit in which course, grouped course by course."
        actionLabel="Add Enrollment"
        onAction={openCreateModal}
      />

      <div className="surface">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
            />

            <input
              type="text"
              placeholder="Search course or code"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control !pl-9"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="label-mono">
              {filteredEnrollments.length} of {enrollments.length} records
            </p>

            {groups.length > 1 && (
              <button
                onClick={toggleAll}
                className="btn-ghost !py-1.5 !px-3 text-[0.6875rem]"
              >
                {allCollapsed ? "Expand All" : "Collapse All"}
              </button>
            )}
          </div>
        </div>

        {/* Course quick-jump strip */}
        {!loading && !error && groups.length > 1 && (
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-line overflow-x-auto">
            <span className="label-mono shrink-0 mr-1">Jump to</span>

            {groups.map((g) => (
              <button
                key={g.course_id}
                onClick={() => jumpToCourse(g.course_id)}
                className="shrink-0 font-mono text-[0.6875rem] tracking-wide uppercase border border-line px-2.5 py-1 text-ink-soft hover:border-ink hover:text-ink transition-colors"
              >
                {g.course_code}
                <span className="text-ink-mute ml-1.5">
                  {g.enrollments.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Loader text="Loading enrollments" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        ) : groups.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={ClipboardList}
              title={
                enrollments.length === 0
                  ? "No enrollments found"
                  : "No courses match your search"
              }
              hint={
                enrollments.length === 0
                  ? "Enroll the first student to get started"
                  : "Try a different course name or code"
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {groups.map((group, index) => {
              const isCollapsed = collapsed.has(group.course_id);

              return (
                <div
                  key={group.course_id}
                  id={`course-${group.course_id}`}
                  className="scroll-mt-6"
                >
                  {/* Course header - click to expand/collapse */}
                  <button
                    onClick={() => toggleCourse(group.course_id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-paper transition-colors"
                  >
                    <span className="label-mono w-6 shrink-0 text-ink-mute">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="shrink-0 inline-flex items-center justify-center border border-line px-2.5 py-1.5 label-mono text-ink-soft">
                      {group.course_code}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-bold text-[1.0625rem] tracking-tight text-ink truncate">
                        {group.course_name}
                      </span>
                      <span className="block text-[0.75rem] text-ink-soft mt-0.5">
                        {group.department_name && (
                          <>{group.department_name} · </>
                        )}
                        SEM {group.semesters.map((s) => String(s).padStart(2, "0")).join(", ")}
                        {" · "}
                        {group.sessions.join(", ")}
                      </span>
                    </span>

                    <span className="shrink-0 flex items-center gap-1.5 label-mono text-ink-mute">
                      <Users size={13} />
                      {group.enrollments.length}
                    </span>

                    <span className="shrink-0 text-ink-mute">
                      {isCollapsed ? (
                        <ChevronRight size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </span>
                  </button>

                  {/* Course body - enrolled students */}
                  {!isCollapsed && (
                    <div className="pb-4 sm:pl-[3.5rem]">
                      <div className="overflow-x-auto border border-line mx-5 mb-1">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-paper border-b border-line">
                              <th className={TH}>ID</th>
                              <th className={TH}>Student</th>
                              <th className={TH}>Semester</th>
                              <th className={TH}>Session</th>
                              <th className={`${TH} text-center`}>Action</th>
                            </tr>
                          </thead>

                          <tbody>
                            {group.enrollments.map((enrollment) => (
                              <tr
                                key={enrollment.enrollment_id}
                                className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                              >
                                <td className={`${TD} font-mono text-ink-mute`}>
                                  {String(enrollment.enrollment_id).padStart(3, "0")}
                                </td>

                                <td className="px-4 py-3 text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                                  {enrollment.student_name}
                                </td>

                                <td className={`${TD} font-mono`}>
                                  SEM {String(enrollment.semester).padStart(2, "0")}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="inline-block border border-line px-2 py-1 label-mono text-ink-soft">
                                    {enrollment.session}
                                  </span>
                                </td>

                                <td className="px-4 py-3">
                                  <RowActions
                                    onEdit={() => openEditModal(enrollment)}
                                    onDelete={() => setDeletingId(enrollment.enrollment_id)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingId ? "Edit Enrollment" : "Add Enrollment"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Student">
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Course">
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name} ({c.course_code})
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Semester">
              <input
                type="number"
                name="semester"
                placeholder="e.g. 4"
                value={formData.semester}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Session">
              <input
                type="text"
                name="session"
                placeholder="e.g. 2024-2025"
                value={formData.session}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>
          </div>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Enrollment"
          message="Are you sure you want to delete this enrollment? Its attendance and result records will be deleted too."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Enrollment;