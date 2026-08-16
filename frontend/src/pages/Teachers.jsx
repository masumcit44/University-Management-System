import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { toDateInput } from "../services/date";
import { GraduationCap, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  teacher_name: "",
  teacher_email: "",
  teacher_phone: "",
  department_id: "",
  designation: "",
  gender: "",
  address: "",
  dob: "",
  joining_date: "",
};

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-2.5 label-mono whitespace-nowrap align-middle";
const TD = "px-5 py-3 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courseMap, setCourseMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
    fetchCoursesTaught();
  }, []);

  const fetchTeachers = async () => {
    try {
      setError("");

      const res = await api.get("/teachers");
      setTeachers(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load teachers");
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

  // Teachers aren't linked to courses directly - the link lives in the
  // Timetable (course_id + teacher_id per class), so derive it from there.
  const fetchCoursesTaught = async () => {
    try {
      const res = await api.get("/timetable");
      const map = {};

      res.data.data.forEach((entry) => {
        const tid = entry.teacher_id;

        if (!map[tid]) {
          map[tid] = new Map();
        }

        // de-duplicate by course_code - a teacher may have several
        // timetable slots for the same course
        map[tid].set(entry.course_code, entry.course_name);
      });

      setCourseMap(map);
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

  const openEditModal = (teacher) => {
    setFormData({
      teacher_name: teacher.teacher_name,
      teacher_email: teacher.teacher_email,
      teacher_phone: teacher.teacher_phone,
      department_id: teacher.department_id,
      designation: teacher.designation || "",
      gender: teacher.gender || "",
      address: teacher.address || "",
      dob: toDateInput(teacher.dob),
      joining_date: toDateInput(teacher.joining_date),
    });
    setEditingId(teacher.teacher_id);
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.teacher_name) newErrors.teacher_name = "Full name is required";
    if (!formData.teacher_email) newErrors.teacher_email = "Email is required";
    if (!formData.teacher_phone) newErrors.teacher_phone = "Phone is required";
    if (!formData.department_id) newErrors.department_id = "Select a department";

    setErrors(newErrors);
    setModalError("");
    if (Object.keys(newErrors).length) return;

    try {
      if (editingId) {
        await api.put(`/teachers/${editingId}`, formData);
      } else {
        await api.post("/teachers", formData);
      }

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setSaved(false);
        fetchTeachers();
      }, 600);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to save teacher");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/teachers/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      fetchTeachers();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete teacher");
    }
  };

  // Search is ID-only - matches the raw id or the zero-padded display id
  const filteredTeachers = teachers.filter((teacher) => {
    if (!searchId.trim()) return true;

    const term = searchId.trim();
    const paddedId = String(teacher.teacher_id).padStart(3, "0");

    return (
      String(teacher.teacher_id).includes(term) || paddedId.includes(term)
    );
  });

  // Group by department - sorted alphabetically for a stable layout
  const departmentGroups = Object.values(
    filteredTeachers.reduce((acc, t) => {
      const key = t.department_name;

      if (!acc[key]) {
        acc[key] = { department_name: key, teachers: [] };
      }

      acc[key].teachers.push(t);
      return acc;
    }, {})
  ).sort((a, b) => a.department_name.localeCompare(b.department_name));

  const renderCourses = (teacherId) => {
    const courses = courseMap[teacherId];

    if (!courses || courses.size === 0) {
      return <span className="text-ink-soft">—</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
        {[...courses.keys()].map((code) => (
          <span
            key={code}
            className="inline-block border border-line px-2 py-1 label-mono text-ink-soft"
          >
            {code}
          </span>
        ))}
      </div>
    );
  };

  return (
    <MainLayout>
      <PageHeader
        title="Teachers"
        subtitle="Faculty members appointed across the ten departments of Eastern University."
        actionLabel="Add Teacher"
        onAction={openCreateModal}
      />

      <div className="surface p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="w-full sm:max-w-xs">
            <label className="label-mono block mb-2">Search by Teacher ID</label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
              />
              <input
                type="number"
                placeholder="e.g. 3"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className={`${CONTROL_CLASS} !mt-0 !pl-9`}
              />
            </div>
          </div>

          <p className="label-mono shrink-0">
            <span className="font-mono text-ink">
              {filteredTeachers.length}
            </span>
            <span className="text-ink-mute">
              {" "}of {teachers.length} records
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="surface">
          <Loader text="Loading teachers" />
        </div>
      ) : error ? (
        <div className="surface">
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        </div>
      ) : departmentGroups.length === 0 ? (
        <div className="surface p-5">
          <EmptyState
            icon={GraduationCap}
            title={
              teachers.length === 0
                ? "No teachers found"
                : "No teacher matches that ID"
            }
            hint={
              teachers.length === 0
                ? "Add the first faculty member to get started"
                : "Try a different teacher ID"
            }
          />
        </div>
      ) : (
        <div className="space-y-8">
          {departmentGroups.map((dept, index) => (
            <div key={dept.department_name}>
              {/* Department header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="badge badge-neutral px-1.5 py-0.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display font-bold text-lg text-ink tracking-tight">
                  {dept.department_name}
                </h2>
                <span className="h-px flex-1 bg-line" />
                <span className="badge badge-neutral px-1.5 py-0.5">
                  {dept.teachers.length}{" "}
                  {dept.teachers.length > 1 ? "teachers" : "teacher"}
                </span>
              </div>

              <div className="surface overflow-hidden">
                <div className="table-scroll">
                  <table className="data-table w-full">
                    <thead>
                      <tr className="bg-paper border-b border-line">
                        <th className={TH}>ID</th>
                        <th className={TH}>Name</th>
                        <th className={TH}>Designation</th>
                        <th className={TH}>Email</th>
                        <th className={TH}>Phone</th>
                        <th className={TH}>Courses</th>
                        <th className={TH}>Joined</th>
                        <th className={`${TH} text-center`}>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dept.teachers.map((teacher) => (
                        <tr
                          key={teacher.teacher_id}
                          className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                        >
                          <td className={`${TD} font-mono text-ink-mute`}>
                            {String(teacher.teacher_id).padStart(3, "0")}
                          </td>

                          <td className="px-5 py-3 text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                            {teacher.teacher_name}
                          </td>

                          <td className={TD}>{teacher.designation || "—"}</td>

                          <td className={TD}>{teacher.teacher_email}</td>

                          <td className={`${TD} font-mono`}>{teacher.teacher_phone}</td>

                          <td className="px-5 py-3">
                            {renderCourses(teacher.teacher_id)}
                          </td>

                          <td className={`${TD} font-mono`}>
                            {toDateInput(teacher.joining_date) || "—"}
                          </td>

                          <td className="px-5 py-3 text-center">
                            <RowActions
                              onEdit={() => openEditModal(teacher)}
                              onDelete={() => setDeletingId(teacher.teacher_id)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editingId ? "Edit Teacher" : "Add Teacher"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
          saved={saved}
          modalError={modalError}
          saveHint="NAME + EMAIL + PHONE + DEPARTMENT required"
          wide
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Full Name" error={errors.teacher_name}>
              <input
                type="text"
                name="teacher_name"
                placeholder="e.g. Dr. Momtaj Hossain"
                value={formData.teacher_name}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Designation">
              <input
                type="text"
                name="designation"
                placeholder="e.g. Assistant Professor"
                value={formData.designation}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Email" error={errors.teacher_email}>
              <input
                type="email"
                name="teacher_email"
                placeholder="teacher@easternuni.edu.bd"
                value={formData.teacher_email}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Phone" error={errors.teacher_phone}>
              <input
                type="text"
                name="teacher_phone"
                placeholder="01XXXXXXXXX"
                value={formData.teacher_phone}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

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

            <Field label="Gender">
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={CONTROL_CLASS}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="Date of Birth">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Joining Date">
              <input
                type="date"
                name="joining_date"
                value={formData.joining_date}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>
          </div>

          <Field label="Address">
            <input
              type="text"
              name="address"
              placeholder="e.g. Ashulia, Savar, Dhaka"
              value={formData.address}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Teacher"
          message="Are you sure you want to delete this teacher? Their timetable entries will be removed as well."
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

export default Teachers;