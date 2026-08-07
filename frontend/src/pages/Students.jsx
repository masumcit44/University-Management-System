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

function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchStudents();
    fetchDepartments();
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

  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();

    return (
      student.student_name.toLowerCase().includes(term) ||
      student.student_email.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Students"
        subtitle="Enrolled students across departments"
        actionLabel="Add Student"
        onAction={openCreateModal}
      />

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search student or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading students..." />
        ) : error ? (
          <p className="text-red-600 p-6">{error}</p>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              students.length === 0
                ? "No students found"
                : "No students match your search"
            }
            hint={
              students.length === 0
                ? "Add the first student to get started"
                : "Try a different name or email"
            }
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Name</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Phone</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Department</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Gender</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Admitted</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.student_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{student.student_id}</td>
                  <td className="p-4 font-medium text-slate-800">{student.student_name}</td>
                  <td className="p-4 text-slate-600">{student.student_email}</td>
                  <td className="p-4 text-slate-600">{student.student_phone}</td>
                  <td className="p-4 text-slate-600">{student.department_name}</td>
                  <td className="p-4 text-slate-600">{student.gender || "—"}</td>
                  <td className="p-4 text-slate-600">
                    {toDateInput(student.admission_date) || "—"}
                  </td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(student)}
                      onDelete={() => setDeletingId(student.student_id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
