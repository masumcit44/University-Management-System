import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { CalendarCheck, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const STATUS_STYLES = {
  Present: "bg-green-100 text-green-700",
  Absent: "bg-red-100 text-red-700",
  Late: "bg-amber-100 text-amber-700",
};

const EMPTY_FORM = {
  enrollment_id: "",
  attendance_date: "",
  status: "",
};

// MySQL DATE columns arrive as ISO strings; <input type="date"> needs YYYY-MM-DD.
const toDateInput = (value) => (value ? String(value).split("T")[0] : "");

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchAttendance();
    fetchEnrollments();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance");
      setAttendance(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const res = await api.get("/enrollments");
      setEnrollments(res.data.data);
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

  const openEditModal = (record) => {
    setFormData({
      enrollment_id: record.enrollment_id,
      attendance_date: toDateInput(record.attendance_date),
      status: record.status,
    });
    setEditingId(record.attendance_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.enrollment_id ||
      !formData.attendance_date ||
      !formData.status
    ) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/attendance/${editingId}`, formData);
      } else {
        await api.post("/attendance", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save attendance");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/attendance/${deletingId}`);
      setDeletingId(null);
      fetchAttendance();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete attendance");
    }
  };

  const statusBadge = (status) => (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
        STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );

  const filteredAttendance = attendance.filter((record) => {
    const term = searchTerm.toLowerCase();

    return (
      record.student_name.toLowerCase().includes(term) ||
      record.course_name.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Attendance"
        subtitle="Daily attendance records"
        actionLabel="Add Attendance"
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
          <Loader text="Loading attendance..." />
        ) : filteredAttendance.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title={
              attendance.length === 0
                ? "No attendance records found"
                : "No records match your search"
            }
            hint={
              attendance.length === 0
                ? "Add the first attendance record to get started"
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
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Status</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredAttendance.map((record) => (
                <tr
                  key={record.attendance_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{record.attendance_id}</td>
                  <td className="p-4 font-medium text-slate-800">{record.student_name}</td>
                  <td className="p-4 text-slate-600">{record.course_name}</td>
                  <td className="p-4 text-slate-600">
                    {toDateInput(record.attendance_date)}
                  </td>
                  <td className="p-4">{statusBadge(record.status)}</td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(record)}
                      onDelete={() => setDeletingId(record.attendance_id)}
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
          title={editingId ? "Edit Attendance" : "Add Attendance"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Enrollment">
            <select
              name="enrollment_id"
              value={formData.enrollment_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Enrollment</option>
              {enrollments.map((e) => (
                <option key={e.enrollment_id} value={e.enrollment_id}>
                  {e.student_name} — {e.course_name} ({e.course_code})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Date">
            <input
              type="date"
              name="attendance_date"
              value={formData.attendance_date}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Status">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </Field>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Attendance"
          message="Are you sure you want to delete this attendance record?"
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Attendance;
