import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
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

// MySQL DATE columns arrive as ISO strings; <input type="date"> needs YYYY-MM-DD.
const toDateInput = (value) => (value ? value.split("T")[0] : "");

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-2.5 label-mono whitespace-nowrap";
const TD = "px-5 py-3 text-[0.8125rem] text-ink-soft whitespace-nowrap";

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
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.teacher_name ||
      !formData.teacher_email ||
      !formData.teacher_phone ||
      !formData.department_id
    ) {
      alert("Name, email, phone and department are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/teachers/${editingId}`, formData);
      } else {
        await api.post("/teachers", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save teacher");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/teachers/${deletingId}`);
      setDeletingId(null);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete teacher");
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

      <div className="surface p-5 mb-6">
        <Field label="Search by Teacher ID">
          <div className="relative max-w-xs">
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
        </Field>

        <p className="label-mono mt-1">
          {filteredTeachers.length} of {teachers.length} records
        </p>
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
          {departmentGroups.map((dept) => (
            <div key={dept.department_name}>
              {/* Department header */}
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h2 className="font-display font-bold text-lg text-ink tracking-tight">
                  {dept.department_name}
                </h2>
                <p className="label-mono">
                  {dept.teachers.length} teacher
                  {dept.teachers.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="surface overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
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
          wide
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Full Name">
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

            <Field label="Email">
              <input
                type="email"
                name="teacher_email"
                placeholder="teacher@easternuni.edu.bd"
                value={formData.teacher_email}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Phone">
              <input
                type="text"
                name="teacher_phone"
                placeholder="01XXXXXXXXX"
                value={formData.teacher_phone}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

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
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Teachers;