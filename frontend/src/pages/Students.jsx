import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Users, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  student_name: "",
  student_email: "",
  student_phone: "",
  department_id: "",
  gender: "",
  address: "",
  dob: "",
  admission_date: "",
};

// MySQL DATE columns arrive as ISO strings; <input type="date"> needs YYYY-MM-DD.
const toDateInput = (value) => (value ? String(value).split("T")[0] : "");

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-2.5 label-mono whitespace-nowrap";
const TD = "px-5 py-3 text-[0.8125rem] text-ink-soft whitespace-nowrap";

function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesterMap, setSemesterMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchId, setSearchId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
    fetchSemesters();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/students");
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load students");
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

  // A student's "current semester" is the highest semester across their
  // enrollments - enrollments carry semester, students don't.
  const fetchSemesters = async () => {
    try {
      const res = await api.get("/enrollments");
      const map = {};

      res.data.data.forEach((en) => {
        const sid = en.student_id;
        const sem = Number(en.semester);

        if (!map[sid] || sem > map[sid]) {
          map[sid] = sem;
        }
      });

      setSemesterMap(map);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setFormData({
      student_name: student.student_name,
      student_email: student.student_email,
      student_phone: student.student_phone,
      department_id: student.department_id,
      gender: student.gender || "",
      address: student.address || "",
      dob: toDateInput(student.dob),
      admission_date: toDateInput(student.admission_date),
    });
    setEditingId(student.student_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.student_name ||
      !formData.student_email ||
      !formData.student_phone ||
      !formData.department_id
    ) {
      alert("Name, email, phone and department are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, formData);
      } else {
        await api.post("/students", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchStudents();
      fetchSemesters();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save student");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/students/${deletingId}`);
      setDeletingId(null);
      fetchStudents();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete student");
    }
  };

  // Search is ID-only - matches the raw id or the zero-padded display id
  const filteredStudents = students.filter((student) => {
    if (!searchId.trim()) return true;

    const term = searchId.trim();
    const paddedId = String(student.student_id).padStart(3, "0");

    return (
      String(student.student_id).includes(term) || paddedId.includes(term)
    );
  });

  // Department -> Semester -> [students], each level sorted for a stable layout
  const departmentGroups = Object.values(
    filteredStudents.reduce((acc, s) => {
      const deptKey = s.department_name;

      if (!acc[deptKey]) {
        acc[deptKey] = { department_name: deptKey, students: [] };
      }

      acc[deptKey].students.push(s);
      return acc;
    }, {})
  )
    .map((dept) => {
      const semesterGroups = Object.values(
        dept.students.reduce((acc, s) => {
          const sem = semesterMap[s.student_id];
          const key = sem || "unassigned";

          if (!acc[key]) {
            acc[key] = { semester: sem || null, students: [] };
          }

          acc[key].students.push(s);
          return acc;
        }, {})
      ).sort((a, b) => {
        if (a.semester === null) return 1;
        if (b.semester === null) return -1;
        return a.semester - b.semester;
      });

      return { ...dept, semesterGroups };
    })
    .sort((a, b) => a.department_name.localeCompare(b.department_name));

  return (
    <MainLayout>
      <PageHeader
        title="Students"
        subtitle="Every enrolled student across the ten departments of Eastern University."
        actionLabel="Add Student"
        onAction={openCreateModal}
      />

      <div className="surface p-5 mb-6">
        <Field label="Search by Student ID">
          <div className="relative max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
            />
            <input
              type="number"
              placeholder="e.g. 5"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className={`${CONTROL_CLASS} !mt-0 !pl-9`}
            />
          </div>
        </Field>

        <p className="label-mono mt-1">
          {filteredStudents.length} of {students.length} records
        </p>
      </div>

      {loading ? (
        <div className="surface">
          <Loader text="Loading students" />
        </div>
      ) : error ? (
        <div className="surface">
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        </div>
      ) : departmentGroups.length === 0 ? (
        <div className="surface p-5">
          <EmptyState
            icon={Users}
            title={
              students.length === 0
                ? "No students found"
                : "No student matches that ID"
            }
            hint={
              students.length === 0
                ? "Add the first student to get started"
                : "Try a different student ID"
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
                  {dept.students.length} student
                  {dept.students.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-4">
                {dept.semesterGroups.map((group) => (
                  <div
                    key={group.semester || "unassigned"}
                    className="surface overflow-hidden"
                  >
                    <div className="px-5 py-2.5 border-b border-line bg-paper">
                      <p className="label-mono">
                        {group.semester
                          ? `Semester ${group.semester}`
                          : "Semester — Unassigned"}
                      </p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-line">
                            <th className={TH}>ID</th>
                            <th className={TH}>Name</th>
                            <th className={TH}>Email</th>
                            <th className={TH}>Phone</th>
                            <th className={TH}>Gender</th>
                            <th className={TH}>Admitted</th>
                            <th className={`${TH} text-center`}>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.students.map((student) => (
                            <tr
                              key={student.student_id}
                              className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                            >
                              <td className={`${TD} font-mono text-ink-mute`}>
                                {String(student.student_id).padStart(3, "0")}
                              </td>

                              <td className="px-5 py-3 text-[0.8125rem] font-semibold text-ink whitespace-nowrap">
                                {student.student_name}
                              </td>

                              <td className={TD}>{student.student_email}</td>

                              <td className={`${TD} font-mono`}>
                                {student.student_phone}
                              </td>

                              <td className={TD}>{student.gender || "—"}</td>

                              <td className={`${TD} font-mono`}>
                                {toDateInput(student.admission_date) || "—"}
                              </td>

                              <td className="px-5 py-3 text-center">
                                <RowActions
                                  onEdit={() => openEditModal(student)}
                                  onDelete={() => setDeletingId(student.student_id)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title={editingId ? "Edit Student" : "Add Student"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
          wide
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Full Name">
              <input
                type="text"
                name="student_name"
                placeholder="e.g. Masum Akondha"
                value={formData.student_name}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                name="student_email"
                placeholder="student@easternuni.edu.bd"
                value={formData.student_email}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Phone">
              <input
                type="text"
                name="student_phone"
                placeholder="01XXXXXXXXX"
                value={formData.student_phone}
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

            <Field label="Admission Date">
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
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
          title="Delete Student"
          message="Are you sure you want to delete this student? Their enrollments, attendance, results and payments will be deleted too."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Students;