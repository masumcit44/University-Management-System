import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { ClipboardList, Search } from "lucide-react";

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

function Enrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchEnrollments();
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load enrollments");
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
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.student_id ||
      !formData.course_id ||
      !formData.semester ||
      !formData.session
    ) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/enrollments/${editingId}`, formData);
      } else {
        await api.post("/enrollments", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchEnrollments();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to save enrollment. This student may already be enrolled in that course for the same semester and session."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/enrollments/${deletingId}`);
      setDeletingId(null);
      fetchEnrollments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete enrollment");
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const term = searchTerm.toLowerCase();

    return (
      enrollment.student_name.toLowerCase().includes(term) ||
      enrollment.course_name.toLowerCase().includes(term) ||
      enrollment.course_code.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Enrollment"
        subtitle="Student course enrollments"
        actionLabel="Add Enrollment"
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
              placeholder="Search student or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading enrollments..." />
        ) : filteredEnrollments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={
              enrollments.length === 0
                ? "No enrollments found"
                : "No enrollments match your search"
            }
            hint={
              enrollments.length === 0
                ? "Enroll the first student to get started"
                : "Try a different student or course"
            }
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Student</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Course</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Code</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Semester</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Session</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredEnrollments.map((enrollment) => (
                <tr
                  key={enrollment.enrollment_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{enrollment.enrollment_id}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {enrollment.student_name}
                  </td>
                  <td className="p-4 text-slate-600">{enrollment.course_name}</td>
                  <td className="p-4 text-slate-600">{enrollment.course_code}</td>
                  <td className="p-4 text-slate-600">{enrollment.semester}</td>
                  <td className="p-4 text-slate-600">{enrollment.session}</td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(enrollment)}
                      onDelete={() => setDeletingId(enrollment.enrollment_id)}
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
          title={editingId ? "Edit Enrollment" : "Add Enrollment"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Student">
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

          <Field label="Course">
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

            <Field label="Session">
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
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Enrollment;
