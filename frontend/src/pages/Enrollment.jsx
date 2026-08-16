import MainLayout from "../layouts/MainLayout";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  ClipboardList,
  Search,
  ChevronDown,
  ChevronRight,
  Users,
  Check,
  X,
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

// Status badge colours for the enrollments table
const STATUS_BADGE = {
  approved: "badge-ok",
  pending: "badge-warn",
  rejected: "badge-danger",
};

const STATUS_DOTS = {
  approved: "bg-ok",
  pending: "bg-warn",
  rejected: "bg-danger",
};

// Status filter tabs shown in the toolbar
const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

// Shared table cell styles - reused inside every course group
const TH = "text-left px-4 py-2.5 label-mono whitespace-nowrap align-middle";
const TD = "px-4 py-3 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

// Joins a set of values into "A, B, C" for display, e.g. mixed semesters/sessions.
// All-numeric values sort numerically (so semester 10 comes after 2).
function joinDistinct(values) {
  const list = Array.from(new Set(values));
  const allNumeric = list.every((v) => v !== "" && !Number.isNaN(Number(v)));
  return allNumeric
    ? list.sort((a, b) => Number(a) - Number(b))
    : list.sort();
}

function Enrollment() {
  // Admins get full CRUD + review; teachers review only (backend scopes them
  // to their assigned courses)
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isTeacher = currentUser?.role === "teacher";

  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [collapsed, setCollapsed] = useState(() => new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [reviewError, setReviewError] = useState("");

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
    setErrors({});
    setModalError("");
    setSaved(false);
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
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = "Select a student";
    if (!formData.course_id) newErrors.course_id = "Select a course";
    if (!formData.semester) newErrors.semester = "Semester is required";
    if (!formData.session) newErrors.session = "Session is required";

    setErrors(newErrors);
    setModalError("");
    if (Object.keys(newErrors).length) return;

    try {
      if (editingId) {
        await api.put(`/enrollments/${editingId}`, formData);
      } else {
        await api.post("/enrollments", formData);
      }

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setSaved(false);
        fetchEnrollments();
      }, 600);
    } catch (err) {
      console.error(err);
      setModalError(
        err.response?.data?.message ||
          "Failed to save enrollment. This student may already be enrolled in that course for the same semester and session."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/enrollments/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete enrollment");
    }
  };

  const handleReview = async (id, action) => {
    try {
      await api.put(`/enrollments/${id}/review`, { action });
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      setReviewError(
        err.response?.data?.message ||
          (action === "approve"
            ? "Failed to approve enrollment"
            : "Failed to reject enrollment")
      );
    }
  };

  const confirmReject = async () => {
    setReviewError("");
    await handleReview(rejectingId, "reject");
    setRejectingId(null);
  };

  const statusBadge = (status) => (
    <span className={`badge ${STATUS_BADGE[status] || "badge-neutral"}`}>
      <span
        className={`w-1.5 h-1.5 shrink-0 ${STATUS_DOTS[status] || "bg-ink-mute"}`}
      />
      {status || "Unknown"}
    </span>
  );

  // department_name per course_id, sourced from the courses list
  const departmentByCourse = useMemo(() => {
    const map = new Map();
    courses.forEach((c) => map.set(c.course_id, c.department_name));
    return map;
  }, [courses]);

  const term = searchTerm.trim().toLowerCase();

  // Search matches course name or course code - matching groups keep every student
  const filteredEnrollments = useMemo(() => {
    const byStatus = statusFilter === "all"
      ? enrollments
      : enrollments.filter((e) => e.status === statusFilter);

    if (!term) return byStatus;

    return byStatus.filter(
      (e) =>
        e.course_name.toLowerCase().includes(term) ||
        e.course_code.toLowerCase().includes(term)
    );
  }, [enrollments, term, statusFilter]);

  // Count per status for the filter tabs
  const statusCounts = useMemo(() => {
    const counts = { all: enrollments.length };
    STATUS_TABS.forEach((t) => {
      if (t.key !== "all") {
        counts[t.key] = enrollments.filter((e) => e.status === t.key).length;
      }
    });
    return counts;
  }, [enrollments]);

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
        actionLabel={isTeacher ? undefined : "Add Enrollment"}
        onAction={isTeacher ? undefined : openCreateModal}
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
            <p className="label-mono shrink-0">
              <span className="font-mono text-ink">
                {filteredEnrollments.length}
              </span>
              <span className="text-ink-mute">
                {" "}of {enrollments.length} records
              </span>
            </p>

            {groups.length > 1 && (
              <button
                onClick={toggleAll}
                className="btn-ghost btn-pushable !py-1.5 !px-3 text-[0.6875rem]"
              >
                {allCollapsed ? "Expand All" : "Collapse All"}
              </button>
            )}
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 px-5 py-3 border-b border-line overflow-x-auto bg-paper">
          {STATUS_TABS.map((t) => {
            const active = statusFilter === t.key;
            const count = statusCounts[t.key] || 0;

            return (
              <button
                key={t.key}
                onClick={() => setStatusFilter(t.key)}
                className={`shrink-0 font-mono text-[0.6875rem] tracking-wide uppercase border px-2.5 py-1.5 transition-colors ${
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                {t.label}
                <span
                  className={`ml-1.5 ${active ? "text-white/60" : "text-ink-mute"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Course quick-jump strip */}
        {!loading && !error && groups.length > 1 && (
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-line overflow-x-auto bg-paper">
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
                  ? isTeacher
                    ? "Students in your assigned courses will appear here once enrolled"
                    : "Enroll the first student to get started"
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
                    <span className="label-mono w-8 shrink-0 text-center border border-line bg-paper py-1 text-ink-soft">
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
                      <div className="table-scroll border border-line mx-5 mb-1">
                        <table className="data-table w-full">
                          <thead>
                            <tr className="bg-paper border-b border-line">
                              <th className={TH}>ID</th>
                              <th className={TH}>Student</th>
                              <th className={TH}>Status</th>
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

                                <td className="px-4 py-3 whitespace-nowrap">
                                  {statusBadge(enrollment.status)}
                                  {enrollment.reviewed_by_name && (
                                    <span className="block text-[0.6875rem] text-ink-soft mt-1.5">
                                      by {enrollment.reviewed_by_name}
                                    </span>
                                  )}
                                </td>

                                <td className={`${TD} font-mono`}>
                                  SEM {String(enrollment.semester).padStart(2, "0")}
                                </td>

                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="inline-block border border-line bg-paper px-2 py-1 label-mono text-ink-soft">
                                    {enrollment.session}
                                  </span>
                                </td>

                                <td className="px-4 py-3">
                                  <div className="flex justify-center gap-1.5">
                                    {enrollment.status === "pending" && (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleReview(enrollment.enrollment_id, "approve")
                                          }
                                          title="Approve"
                                          aria-label="Approve"
                                          className="p-1.5 border border-line text-ink-mute hover:border-ok hover:text-ok hover:bg-ok-soft active:translate-y-px transition-colors"
                                        >
                                          <Check size={15} strokeWidth={1.9} />
                                        </button>
                                        <button
                                          onClick={() =>
                                            setRejectingId(enrollment.enrollment_id)
                                          }
                                          title="Reject"
                                          aria-label="Reject"
                                          className="p-1.5 border border-line text-ink-mute hover:border-danger hover:text-danger hover:bg-danger-soft active:translate-y-px transition-colors"
                                        >
                                          <X size={15} strokeWidth={1.9} />
                                        </button>
                                      </>
                                    )}

                                    {!isTeacher && (
                                      <RowActions
                                        onEdit={() => openEditModal(enrollment)}
                                        onDelete={() => setDeletingId(enrollment.enrollment_id)}
                                      />
                                    )}
                                  </div>
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
          saved={saved}
          modalError={modalError}
          saveHint="STUDENT + COURSE + SEMESTER + SESSION required"
        >
          <Field label="Student" error={errors.student_id}>
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

          <Field label="Course" error={errors.course_id}>
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
            <Field label="Semester" error={errors.semester}>
              <input
                type="number"
                name="semester"
                placeholder="e.g. 4"
                value={formData.semester}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Session" error={errors.session}>
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
          error={deleteError}
          onCancel={() => {
            setDeletingId(null);
            setDeleteError("");
          }}
          onConfirm={handleDelete}
        />
      )}

      {rejectingId && (
        <ConfirmDialog
          title="Reject Enrollment"
          message="Rejecting is final - the student will see the request refused and cannot undo this from their side."
          confirmLabel="Reject"
          error={reviewError}
          onCancel={() => {
            setRejectingId(null);
            setReviewError("");
          }}
          onConfirm={confirmReject}
        />
      )}
    </MainLayout>
  );
}

export default Enrollment;