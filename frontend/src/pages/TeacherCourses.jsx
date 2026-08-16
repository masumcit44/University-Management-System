import MainLayout from "../layouts/MainLayout";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { Link2, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const TH = "text-left px-5 py-3 label-mono whitespace-nowrap align-middle";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

function TeacherCourses() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ teacher_id: "", course_id: "" });
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  // Assignments list + the two dropdown sources, all loaded in parallel.
  const fetchData = async () => {
    try {
      setError("");

      const [assignmentRes, teacherRes, courseRes] = await Promise.all([
        api.get("/teacher-courses"),
        api.get("/teachers"),
        api.get("/courses"),
      ]);

      setAssignments(assignmentRes.data.data || []);
      setTeachers(teacherRes.data.data || []);
      setCourses(courseRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get("/teacher-courses");
      setAssignments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setAssignForm({
      ...assignForm,
      [e.target.name]: e.target.value,
    });
  };

  const openAssignModal = () => {
    setAssignForm({ teacher_id: "", course_id: "" });
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const handleAssign = async () => {
    const newErrors = {};
    if (!assignForm.teacher_id) newErrors.teacher_id = "Select a teacher";
    if (!assignForm.course_id) newErrors.course_id = "Select a course";

    setErrors(newErrors);
    setModalError("");
    if (Object.keys(newErrors).length) return;

    try {
      await api.post("/teacher-courses", {
        teacher_id: Number(assignForm.teacher_id),
        course_id: Number(assignForm.course_id),
      });

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setAssignForm({ teacher_id: "", course_id: "" });
        setSaved(false);
        fetchAssignments();
      }, 600);
    } catch (err) {
      // Backend rejects duplicate pairs - surface its exact message,
      // e.g. "Teacher is already assigned to this course"
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to assign teacher");
    }
  };

  const handleUnassign = async () => {
    try {
      await api.delete(`/teacher-courses/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to unassign teacher");
    }
  };

  const toDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const term = searchTerm.trim().toLowerCase();

  const filteredAssignments = useMemo(() => {
    if (!term) return assignments;

    return assignments.filter(
      (a) =>
        a.teacher_name.toLowerCase().includes(term) ||
        a.course_name.toLowerCase().includes(term) ||
        a.course_code.toLowerCase().includes(term)
    );
  }, [assignments, term]);

  return (
    <MainLayout>
      <PageHeader
        title="Teacher Assignments"
        subtitle="Link a teacher to each course, or unassign them. Assignments power every teacher-scoped feature - attendance, exams, results and enrollment review."
        actionLabel="Assign Teacher"
        onAction={openAssignModal}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search teacher, course or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="control !pl-9"
          />
        </div>

        <p className="label-mono shrink-0">
          <span className="font-mono text-ink">
            {filteredAssignments.length}
          </span>
          <span className="text-ink-mute">
            {" "}of {assignments.length} assignments
          </span>
        </p>
      </div>

      {loading ? (
        <div className="surface">
          <Loader text="Loading assignments" />
        </div>
      ) : error ? (
        <div className="surface">
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="surface p-5">
          <EmptyState
            icon={Link2}
            title={
              assignments.length === 0
                ? "No assignments yet"
                : "No assignments match your search"
            }
            hint={
              assignments.length === 0
                ? "Use 'Assign Teacher' to link a teacher to a course"
                : "Try a different teacher, course or code"
            }
          />
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <div className="table-scroll">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className={TH}>Teacher</th>
                  <th className={TH}>Course</th>
                  <th className={TH}>Assigned</th>
                  <th className={`${TH} text-center`}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.teacher_course_id}>
                    <td className="px-5 py-3.5">
                      <p className="text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                        {assignment.teacher_name}
                      </p>
                      <p className="label-mono text-ink-mute mt-0.5">
                        {assignment.teacher_email}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                        {assignment.course_name}
                      </p>
                      <span className="badge badge-neutral px-1.5 py-0.5 mt-1">
                        {assignment.course_code}
                      </span>
                    </td>

                    <td className={`${TD} font-mono`}>
                      {toDate(assignment.assigned_at)}
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      <RowActions
                        onDelete={() => setDeletingId(assignment.teacher_course_id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal
          title="Assign Teacher"
          onClose={() => setShowModal(false)}
          onSave={handleAssign}
          saveLabel="Assign"
          saved={saved}
          modalError={modalError}
          saveHint="TEACHER + COURSE required"
        >
          <Field label="Teacher" error={errors.teacher_id}>
            <select
              name="teacher_id"
              value={assignForm.teacher_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.teacher_id} value={teacher.teacher_id}>
                  {teacher.teacher_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Course" error={errors.course_id}>
            <select
              name="course_id"
              value={assignForm.course_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name} ({course.course_code})
                </option>
              ))}
            </select>
          </Field>

          <p className="text-[0.75rem] text-ink-mute">
            A teacher can only be assigned to a course once. Re-assigning
            requires unassigning them first.
          </p>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Unassign Teacher"
          message="Are you sure you want to unassign this teacher from the course? Teacher-scoped records for the course will remain, but the teacher will lose access to them."
          confirmLabel="Unassign"
          error={deleteError}
          onCancel={() => {
            setDeletingId(null);
            setDeleteError("");
          }}
          onConfirm={handleUnassign}
        />
      )}
    </MainLayout>
  );
}

export default TeacherCourses;
