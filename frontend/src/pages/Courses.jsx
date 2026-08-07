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
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsed, setCollapsed] = useState(() => new Set());

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setError("");

      const res = await api.get("/courses");
      setCourses(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load courses");
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

  const openEditModal = (course) => {
    setFormData({
      course_name: course.course_name,
      course_code: course.course_code,
      credit: course.credit,
      semester: course.semester,
      department_id: course.department_id,
    });
    setEditingId(course.course_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.course_name ||
      !formData.course_code ||
      !formData.credit ||
      !formData.semester ||
      !formData.department_id
    ) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, formData);
      } else {
        await api.post("/courses", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save course");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${deletingId}`);
      setDeletingId(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  // Department code lookup - falls back to derived initials if not loaded yet
  const codeByDept = useMemo(() => {
    const map = new Map();
    departments.forEach((d) => map.set(d.department_id, d.department_code));
    return map;
  }, [departments]);

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
        title="Courses"
        subtitle="Every course offered across the departments, grouped by department and semester."
        actionLabel="Add Course"
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
              placeholder="Search course, code or department"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control !pl-9"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="label-mono">
              {filteredCourses.length} of {courses.length} records
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

        {/* Department quick-jump strip */}
        {!loading && !error && groups.length > 1 && (
          <div className="flex items-center gap-1.5 px-5 py-3 border-b border-line overflow-x-auto">
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
                  ? "No courses found"
                  : "No courses match your search"
              }
              hint={
                courses.length === 0
                  ? "Add the first course to get started"
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
                    <span className="label-mono w-6 shrink-0 text-ink-mute">
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
                          <div className="flex items-center gap-2.5 mb-2.5">
                            <Layers size={12} className="text-ink-mute shrink-0" />
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
                                className="group relative surface p-3.5 hover:border-ink transition-colors"
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

                                  <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <RowActions
                                      onEdit={() => openEditModal(course)}
                                      onDelete={() => setDeletingId(course.course_id)}
                                    />
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

      {showModal && (
        <Modal
          title={editingId ? "Edit Course" : "Add Course"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Course Name">
            <input
              type="text"
              name="course_name"
              placeholder="e.g. Database Management Lab"
              value={formData.course_name}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Course Code">
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
            <Field label="Credit">
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
          </div>

          <Field label="Department">
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

      {deletingId && (
        <ConfirmDialog
          title="Delete Course"
          message="Are you sure you want to delete this course? Its enrollments, exams and timetable entries will be deleted too."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Courses;