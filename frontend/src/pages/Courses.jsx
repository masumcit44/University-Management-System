import MainLayout from "../layouts/MainLayout";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { BookOpen, Search, ChevronDown, ChevronRight, Layers } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  course_name: "",
  course_code: "",
  credit: "",
  semester: "",
  department_id: "",
};

// Status badge colours - approved courses are simply "enrolled" so only
// non-approved states are flagged on the student course cards
const STATUS_BADGE = {
  pending: "badge-warn",
  rejected: "badge-danger",
};

const STATUS_DOTS = {
  pending: "bg-warn",
  rejected: "bg-danger",
};

// Fallback monogram when a department has no department_code yet
// e.g. "Computer Science and Engineering" -> "CSE"
const STOP_WORDS = new Set(["and", "of", "the", "for", "in"]);

function fallbackCode(name) {
  const letters = name
    .split(" ")
    .filter((w) => w && !STOP_WORDS.has(w.toLowerCase()))
    .map((w) => w[0].toUpperCase())
    .join("");

  return letters.slice(0, 4) || name.slice(0, 2).toUpperCase();
}

function Courses() {
  // Students see only the courses they're enrolled in ("My Courses") and
  // can't create/edit/delete - admin/teacher keep the full directory, but only
  // admin can create/edit/delete.
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isStudent = currentUser?.role === "student";
  const isAdmin = currentUser?.role === "admin";

  const [courses, setCourses] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ course_id: "", session: "" });

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [enrollErrors, setEnrollErrors] = useState({});
  const [enrollError, setEnrollError] = useState("");
  const [enrollSaved, setEnrollSaved] = useState(false);
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    if (isStudent) fetchCatalog();
  }, []);

  const fetchCourses = async () => {
    try {
      setError("");

      const res = isStudent
        ? await api.get(`/enrollments/student/${currentUser.student_id}`)
        : await api.get("/courses");

      setCourses(res.data.data);
    } catch (err) {
      console.error(err);
      setError(
        isStudent ? "Failed to load your courses" : "Failed to load courses"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Full course directory - lets students pick a course to request enrollment in
  const fetchCatalog = async () => {
    try {
      const res = await api.get("/courses");
      setCatalog(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollChange = (e) => {
    setEnrollForm({
      ...enrollForm,
      [e.target.name]: e.target.value,
    });
  };

  const openEnrollModal = () => {
    setEnrollForm({ course_id: "", session: "" });
    setEnrollErrors({});
    setEnrollError("");
    setEnrollSaved(false);
    setEnrollSubmitting(false);
    setShowEnrollModal(true);
  };

  const handleEnroll = async () => {
    if (enrollSubmitting) return;

    const newErrors = {};
    if (!enrollForm.course_id) newErrors.course_id = "Select a course";
    if (!enrollForm.session) newErrors.session = "Session is required";

    setEnrollErrors(newErrors);
    setEnrollError("");
    if (Object.keys(newErrors).length) return;

    setEnrollSubmitting(true);
    try {
      await api.post("/enrollments/enroll", enrollForm);
      setEnrollSaved(true);
      setTimeout(() => {
        setShowEnrollModal(false);
        setEnrollForm({ course_id: "", session: "" });
        setEnrollSaved(false);
        setEnrollSubmitting(false);
        fetchCourses();
      }, 600);
    } catch (err) {
      console.error(err);
      setEnrollSubmitting(false);
      setEnrollError(err.response?.data?.message || "Failed to submit enrollment");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Pending/Rejected flag shown on student course cards (approved = enrolled)
  const statusBadge = (status) => (
    <span className={`badge ${STATUS_BADGE[status] || "badge-neutral"}`}>
      <span
        className={`w-1.5 h-1.5 shrink-0 ${STATUS_DOTS[status] || "bg-ink-mute"}`}
      />
      {status === "pending" ? "Pending" : "Rejected"}
    </span>
  );

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setFormData({
      course_name: course.course_name,
      course_code: course.course_code,
      credit: course.credit,
      semester: course.semester,
      department_id: course.department_id,
    });
    setEditingId(course.course_id);
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.course_name) newErrors.course_name = "Course name is required";
    if (!formData.course_code) newErrors.course_code = "Course code is required";
    if (!formData.credit) newErrors.credit = "Credit is required";
    if (!formData.semester) newErrors.semester = "Semester is required";
    if (!formData.department_id) newErrors.department_id = "Select a department";

    setErrors(newErrors);
    setModalError("");
    if (Object.keys(newErrors).length) return;

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, formData);
      } else {
        await api.post("/courses", formData);
      }

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setSaved(false);
        fetchCourses();
      }, 600);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to save course");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      fetchCourses();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete course");
    }
  };

  // Department code lookup - falls back to derived initials if not loaded yet
  const codeByDept = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.department_id, d.department_code));
    return map;
  }, [departments]);

  // Course ids the student is already pending/approved in - hidden from the
  // enrollment picker (rejected courses can be re-requested)
  const enrolledCourseIds = useMemo(() => {
    const set = new Set();
    courses.forEach((c) => {
      if (c.status !== "rejected") set.add(c.course_id);
    });
    return set;
  }, [courses]);

  const availableCatalog = useMemo(
    () => catalog.filter((c) => !enrolledCourseIds.has(c.course_id)),
    [catalog, enrolledCourseIds]
  );

  const term = searchTerm.trim().toLowerCase();

  const filteredCourses = useMemo(() => {
    if (!term) return courses;

    return courses.filter(
      (c) =>
        c.course_name.toLowerCase().includes(term) ||
        c.course_code.toLowerCase().includes(term) ||
        c.department_name.toLowerCase().includes(term)
    );
  }, [courses, term]);

  // Department -> Semester -> Courses
  const groups = useMemo(() => {
    const byDept = new Map();

    filteredCourses.forEach((course) => {
      if (!byDept.has(course.department_id)) {
        byDept.set(course.department_id, {
          department_id: course.department_id,
          department_name: course.department_name,
          courses: [],
        });
      }
      byDept.get(course.department_id).courses.push(course);
    });

    return Array.from(byDept.values())
      .map((dept) => {
        const bySem = new Map();

        dept.courses.forEach((c) => {
          if (!bySem.has(c.semester)) bySem.set(c.semester, []);
          bySem.get(c.semester).push(c);
        });

        const semesters = Array.from(bySem.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([semester, list]) => ({
            semester,
            courses: [...list].sort((a, b) =>
              a.course_code.localeCompare(b.course_code)
            ),
          }));

        const totalCredit = dept.courses.reduce(
          (sum, c) => sum + Number(c.credit),
          0
        );

        return {
          ...dept,
          semesters,
          totalCredit,
          count: dept.courses.length,
        };
      })
      .sort((a, b) => a.department_name.localeCompare(b.department_name));
  }, [filteredCourses]);

  const toggleDept = (id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const jumpToDept = (id) => {
    setCollapsed((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    requestAnimationFrame(() => {
      document
        .getElementById(`dept-${id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const allCollapsed =
    groups.length > 0 && groups.every((g) => collapsed.has(g.department_id));

  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsed(new Set());
    } else {
      setCollapsed(new Set(groups.map((g) => g.department_id)));
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title={isStudent ? "My Courses" : "Courses"}
        subtitle={
          isStudent
            ? "Every course you're currently enrolled in, grouped by department and semester."
            : "Every course offered across the departments, grouped by department and semester."
        }
        actionLabel={isStudent ? "Enroll in Course" : isAdmin ? "Add Course" : undefined}
        onAction={isStudent ? openEnrollModal : isAdmin ? openCreateModal : undefined}
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
              placeholder="Search course, code or department"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control !pl-9"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="label-mono shrink-0">
              <span className="font-mono text-ink">
                {filteredCourses.length}
              </span>
              <span className="text-ink-mute">
                {" "}of {courses.length} records
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

        {/* Department quick-jump strip */}
        {!loading && !error && groups.length > 1 && (
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-line overflow-x-auto bg-paper">
            <span className="label-mono shrink-0 mr-1">Jump to</span>

            {groups.map((g) => (
              <button
                key={g.department_id}
                onClick={() => jumpToDept(g.department_id)}
                className="shrink-0 font-mono text-[0.6875rem] tracking-wide uppercase border border-line px-2.5 py-1 text-ink-soft hover:border-ink hover:text-ink transition-colors"
              >
                {codeByDept.get(g.department_id) || fallbackCode(g.department_name)}
                <span className="text-ink-mute ml-1.5">{g.count}</span>
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <Loader text="Loading courses" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        ) : groups.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={BookOpen}
              title={
                courses.length === 0
                  ? isStudent
                    ? "You're not enrolled in any courses yet"
                    : "No courses found"
                  : "No courses match your search"
              }
              hint={
                courses.length === 0
                  ? isStudent
                    ? "Use 'Enroll in Course' to request a spot"
                    : "Add the first course to get started"
                  : "Try a different name, code or department"
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-line">
            {groups.map((dept, index) => {
              const isCollapsed = collapsed.has(dept.department_id);
              const code = codeByDept.get(dept.department_id) || fallbackCode(dept.department_name);

              return (
                <div
                  key={dept.department_id}
                  id={`dept-${dept.department_id}`}
                  className="scroll-mt-6"
                >
                  {/* Department header - click to expand/collapse */}
                  <button
                    onClick={() => toggleDept(dept.department_id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-paper transition-colors"
                  >
                    <span className="label-mono w-8 shrink-0 text-center border border-line bg-paper py-1 text-ink-soft">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="shrink-0 inline-flex items-center justify-center border border-line px-2.5 py-1.5 label-mono text-ink-soft min-w-[3rem]">
                      {code}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block font-display font-bold text-[1.0625rem] tracking-tight text-ink truncate">
                        {dept.department_name}
                      </span>
                      <span className="block text-[0.75rem] text-ink-soft mt-0.5">
                        {dept.count} course{dept.count !== 1 ? "s" : ""} ·{" "}
                        {dept.totalCredit.toFixed(2)} credit hours ·{" "}
                        {dept.semesters.length} semester
                        {dept.semesters.length !== 1 ? "s" : ""}
                      </span>
                    </span>

                    <span className="shrink-0 text-ink-mute">
                      {isCollapsed ? (
                        <ChevronRight size={17} />
                      ) : (
                        <ChevronDown size={17} />
                      )}
                    </span>
                  </button>

                  {/* Department body - semester groups */}
                  {!isCollapsed && (
                    <div className="px-5 pb-6 sm:pl-[5.25rem] space-y-6">
                      {dept.semesters.map((sem) => (
                        <div key={sem.semester}>
                          <div className="flex items-center gap-2.5 mb-3 px-3 py-2 border border-line bg-paper">
                            <Layers size={12} className="text-accent shrink-0" />
                            <span className="label-mono whitespace-nowrap">
                              SEM {String(sem.semester).padStart(2, "0")}
                            </span>
                            <span className="h-px flex-1 bg-line" />
                            <span className="label-mono text-ink-mute whitespace-nowrap">
                              {sem.courses.length} course
                              {sem.courses.length !== 1 ? "s" : ""}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                            {sem.courses.map((course) => (
                              <div
                                key={course.course_id}
                                className="group relative surface p-3.5 hover:border-ink hover:shadow-[3px_3px_0_0_rgba(11,11,11,0.06)] transition-all duration-150"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="font-mono text-[0.6875rem] tracking-wide text-ink-mute">
                                      {course.course_code}
                                    </p>
                                    <p className="text-[0.8125rem] font-semibold text-ink mt-1 leading-snug">
                                      {course.course_name}
                                    </p>
                                  </div>

                                  <span className="shrink-0 label-mono border border-line px-1.5 py-1 text-ink-soft whitespace-nowrap">
                                    {Number(course.credit).toFixed(2)} CR
                                  </span>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                                  <span className="font-mono text-[0.6875rem] text-ink-mute">
                                    #{String(course.course_id).padStart(3, "0")}
                                  </span>

                                  <div className="flex items-center gap-2">
                                    {isStudent &&
                                      course.status &&
                                      course.status !== "approved" &&
                                      statusBadge(course.status)}

                                    {isAdmin && (
                                      <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                        <RowActions
                                          onEdit={() => openEditModal(course)}
                                          onDelete={() => setDeletingId(course.course_id)}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isStudent && showEnrollModal && (
        <Modal
          title="Enroll in a Course"
          onClose={() => setShowEnrollModal(false)}
          onSave={handleEnroll}
          saveLabel="Request Enrollment"
          saved={enrollSaved}
          modalError={enrollError}
          saveHint="COURSE + SESSION required"
        >
          {availableCatalog.length === 0 ? (
            <p className="text-[0.8125rem] text-ink-soft">
              You already have a pending or approved enrollment in every course.
            </p>
          ) : (
            <>
              <Field label="Course" error={enrollErrors.course_id}>
                <select
                  name="course_id"
                  value={enrollForm.course_id}
                  onChange={handleEnrollChange}
                  className={CONTROL_CLASS}
                >
                  <option value="">Select Course</option>
                  {availableCatalog.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name} ({c.course_code}) · SEM{" "}
                      {String(c.semester).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Session" error={enrollErrors.session}>
                <input
                  type="text"
                  name="session"
                  placeholder="e.g. 2026"
                  value={enrollForm.session}
                  onChange={handleEnrollChange}
                  className={CONTROL_CLASS}
                />
              </Field>

              <p className="text-[0.75rem] text-ink-mute">
                Your request will show as pending until an admin or your teacher
                approves it.
              </p>
            </>
          )}
        </Modal>
      )}

      {!isStudent && showModal && (
        <Modal
          title={editingId ? "Edit Course" : "Add Course"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
          saved={saved}
          modalError={modalError}
          saveHint="NAME + CODE + CREDIT + SEMESTER required"
        >
          <Field label="Course Name" error={errors.course_name}>
            <input
              type="text"
              name="course_name"
              placeholder="e.g. Database Management Lab"
              value={formData.course_name}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Course Code" error={errors.course_code}>
            <input
              type="text"
              name="course_code"
              placeholder="e.g. 06123228"
              value={formData.course_code}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Credit" error={errors.credit}>
              <input
                type="number"
                step="0.25"
                name="credit"
                placeholder="3.00"
                value={formData.credit}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

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
          </div>

          <Field label="Department" error={errors.department_id}>
            <select
              name="department_id"
              value={formData.department_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </select>
          </Field>
        </Modal>
      )}

      {!isStudent && deletingId && (
        <ConfirmDialog
          title="Delete Course"
          message="Are you sure you want to delete this course? Its enrollments, exams and timetable entries will be deleted too."
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

export default Courses;