import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { toDateInput } from "../services/date";
import { Users, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import SortableTh from "../components/SortableTh";
import Field, { CONTROL_CLASS } from "../components/Field";
import { useSort } from "../services/useSort";

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

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-2.5 label-mono whitespace-nowrap align-middle";
const TD = "px-5 py-3 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

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
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = currentUser?.role === "admin";

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
  // APPROVED enrollments - pending/rejected requests don't count.
  const fetchSemesters = async () => {
    try {
      const res = await api.get("/enrollments");
      const map = {};

      res.data.data
        .filter((en) => en.status === "approved")
        .forEach((en) => {
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
    setErrors({});
    setModalError("");
    setSaved(false);
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
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.student_name) newErrors.student_name = "Full name is required";
    if (!formData.student_email) newErrors.student_email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.student_email))
      newErrors.student_email = "Enter a valid email address";
    if (!formData.student_phone) newErrors.student_phone = "Phone is required";
    else if (!/^[0-9+\-\s]{7,20}$/.test(formData.student_phone))
      newErrors.student_phone = "Enter a valid phone number";
    if (!formData.department_id) newErrors.department_id = "Select a department";

    setErrors(newErrors);
    setModalError("");
    if (Object.keys(newErrors).length) return;

    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, formData);
      } else {
        await api.post("/students", formData);
      }

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setSaved(false);
        fetchStudents();
        fetchSemesters();
      }, 600);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to save student");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/students/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      fetchStudents();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete student");
    }
  };

  // Search by name or ID - name matches case-insensitively, ID matches the
  // raw id or the zero-padded display id
  const filteredStudents = students.filter((student) => {
    const term = searchId.trim().toLowerCase();
    if (!term) return true;

    const paddedId = String(student.student_id).padStart(3, "0");

    return (
      student.student_name?.toLowerCase().includes(term) ||
      String(student.student_id).includes(term) ||
      paddedId.includes(term)
    );
  });

  const { sorted: sortedStudents, sortKey, sortDir, toggle } = useSort(filteredStudents, {
    accessors: {
      id: (s) => Number(s.student_id) || 0,
      name: (s) => String(s.student_name ?? ""),
      email: (s) => String(s.student_email ?? ""),
      phone: (s) => String(s.student_phone ?? ""),
      gender: (s) => String(s.gender ?? ""),
      admitted: (s) => String(s.admission_date ?? ""),
    },
  });

  // Department -> Semester -> [students], each level sorted for a stable layout
  const departmentGroups = Object.values(
    sortedStudents.reduce((acc, s) => {
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
        actionLabel={isAdmin ? "Add Student" : undefined}
        onAction={isAdmin ? openCreateModal : undefined}
      />

      <div className="surface p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="w-full sm:max-w-xs">
            <label className="label-mono block mb-2">Search by Name or ID</label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
              />
              <input
                type="text"
                placeholder="e.g. Masum or 5"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className={`${CONTROL_CLASS} !mt-0 !pl-9`}
              />
            </div>
          </div>

          <p className="label-mono shrink-0">
            <span className="font-mono text-ink">
              {filteredStudents.length}
            </span>
            <span className="text-ink-mute">
              {" "}of {students.length} records
            </span>
          </p>
        </div>
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
                  {dept.students.length}{" "}
                  {dept.students.length > 1 ? "students" : "student"}
                </span>
              </div>

              <div className="space-y-4">
                {dept.semesterGroups.map((group) => (
                  <div
                    key={group.semester || "unassigned"}
                    className="surface overflow-hidden"
                  >
                    <div className="px-5 py-2.5 border-b border-line bg-paper flex items-center justify-between">
                      <p className="label-mono">
                        {group.semester
                          ? `Semester ${group.semester}`
                          : "Semester — Unassigned"}
                      </p>
                      <span className="label-mono">
                        {group.students.length}
                      </span>
                    </div>

                    <div className="table-scroll">
                      <table className="data-table w-full">
                        <thead>
                          <tr className="bg-paper border-b border-line">
                            <SortableTh
                              label="Name"
                              sortKey="name"
                              activeKey={sortKey}
                              sortDir={sortDir}
                              onSort={toggle}
                              className={TH}
                            />
                            <SortableTh
                              label="Email"
                              sortKey="email"
                              activeKey={sortKey}
                              sortDir={sortDir}
                              onSort={toggle}
                              className={TH}
                            />
                            <SortableTh
                              label="Phone"
                              sortKey="phone"
                              activeKey={sortKey}
                              sortDir={sortDir}
                              onSort={toggle}
                              className={TH}
                            />
                            <SortableTh
                              label="Gender"
                              sortKey="gender"
                              activeKey={sortKey}
                              sortDir={sortDir}
                              onSort={toggle}
                              className={TH}
                            />
                            <SortableTh
                              label="Admitted"
                              sortKey="admitted"
                              activeKey={sortKey}
                              sortDir={sortDir}
                              onSort={toggle}
                              className={TH}
                            />
                            <SortableTh
                              label="ID"
                              sortKey="id"
                              activeKey={sortKey}
                              sortDir={sortDir}
                              onSort={toggle}
                              className={TH}
                            />
                            <th className={`${TH} text-center`}>Action</th>
                          </tr>
                        </thead>

                        <tbody>
                          {group.students.map((student) => (
                            <tr
                              key={student.student_id}
                              className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                            >
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

                              <td className={`${TD} font-mono text-ink-mute`}>
                                {String(student.student_id).padStart(3, "0")}
                              </td>

                              <td className="px-5 py-3 text-center">
                                {isAdmin && (
                                  <RowActions
                                    onEdit={() => openEditModal(student)}
                                    onDelete={() => setDeletingId(student.student_id)}
                                  />
                                )}
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
          saved={saved}
          modalError={modalError}
          saveHint="NAME + EMAIL + PHONE + DEPARTMENT required"
          wide
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Full Name" error={errors.student_name}>
              <input
                type="text"
                name="student_name"
                placeholder="e.g. Masum Akondha"
                value={formData.student_name}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Email" error={errors.student_email}>
              <input
                type="email"
                name="student_email"
                placeholder="student@easternuni.edu.bd"
                value={formData.student_email}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Phone" error={errors.student_phone}>
              <input
                type="text"
                name="student_phone"
                placeholder="01XXXXXXXXX"
                value={formData.student_phone}
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

export default Students;