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

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load teachers");
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

  const filteredTeachers = teachers.filter((teacher) => {
    const term = searchTerm.toLowerCase();

    return (
      teacher.teacher_name.toLowerCase().includes(term) ||
      teacher.teacher_email.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Teachers"
        subtitle="Faculty members across departments"
        actionLabel="Add Teacher"
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
              placeholder="Search teacher or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading teachers..." />
        ) : filteredTeachers.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title={
              teachers.length === 0
                ? "No teachers found"
                : "No teachers match your search"
            }
            hint={
              teachers.length === 0
                ? "Add the first faculty member to get started"
                : "Try a different name or email"
            }
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Name</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Designation</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Phone</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Department</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Joined</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.teacher_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{teacher.teacher_id}</td>
                  <td className="p-4 font-medium text-slate-800">{teacher.teacher_name}</td>
                  <td className="p-4 text-slate-600">{teacher.designation || "—"}</td>
                  <td className="p-4 text-slate-600">{teacher.teacher_email}</td>
                  <td className="p-4 text-slate-600">{teacher.teacher_phone}</td>
                  <td className="p-4 text-slate-600">{teacher.department_name}</td>
                  <td className="p-4 text-slate-600">
                    {toDateInput(teacher.joining_date) || "—"}
                  </td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(teacher)}
                      onDelete={() => setDeletingId(teacher.teacher_id)}
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
