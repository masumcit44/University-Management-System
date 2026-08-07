import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { NotebookPen, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const TYPE_STYLES = {
  Quiz: "bg-sky-100 text-sky-700",
  Assignment: "bg-violet-100 text-violet-700",
  Mid: "bg-amber-100 text-amber-700",
  Final: "bg-emerald-100 text-emerald-700",
};

const EMPTY_FORM = {
  course_id: "",
  exam_type: "",
  exam_date: "",
  total_marks: "",
};

// MySQL DATE columns arrive as ISO strings; <input type="date"> needs YYYY-MM-DD.
const toDateInput = (value) => (value ? String(value).split("T")[0] : "");

function Exam() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get("/exams");
      setExams(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load exams");
    } finally {
      setLoading(false);
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

  const openEditModal = (exam) => {
    setFormData({
      course_id: exam.course_id,
      exam_type: exam.exam_type,
      exam_date: toDateInput(exam.exam_date),
      total_marks: exam.total_marks,
    });
    setEditingId(exam.exam_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.course_id ||
      !formData.exam_type ||
      !formData.exam_date ||
      !formData.total_marks
    ) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/exams/${editingId}`, formData);
      } else {
        await api.post("/exams", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchExams();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save exam");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/exams/${deletingId}`);
      setDeletingId(null);
      fetchExams();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete exam");
    }
  };

  const filteredExams = exams.filter((exam) => {
    const term = searchTerm.toLowerCase();

    return (
      exam.course_name.toLowerCase().includes(term) ||
      exam.course_code.toLowerCase().includes(term) ||
      exam.exam_type.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Exams"
        subtitle="Scheduled exams across courses"
        actionLabel="Add Exam"
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
              placeholder="Search course or exam type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading exams..." />
        ) : filteredExams.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title={
              exams.length === 0
                ? "No exams found"
                : "No exams match your search"
            }
            hint={
              exams.length === 0
                ? "Schedule the first exam to get started"
                : "Try a different course or exam type"
            }
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Course</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Code</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Type</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Date</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Total Marks</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredExams.map((exam) => (
                <tr
                  key={exam.exam_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{exam.exam_id}</td>
                  <td className="p-4 font-medium text-slate-800">{exam.course_name}</td>
                  <td className="p-4 text-slate-600">{exam.course_code}</td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        TYPE_STYLES[exam.exam_type] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {exam.exam_type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{toDateInput(exam.exam_date)}</td>
                  <td className="p-4 text-slate-600">{exam.total_marks}</td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(exam)}
                      onDelete={() => setDeletingId(exam.exam_id)}
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
          title={editingId ? "Edit Exam" : "Add Exam"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
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

          <Field label="Exam Type">
            <select
              name="exam_type"
              value={formData.exam_type}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Type</option>
              <option value="Quiz">Quiz</option>
              <option value="Assignment">Assignment</option>
              <option value="Mid">Mid</option>
              <option value="Final">Final</option>
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Date">
              <input
                type="date"
                name="exam_date"
                value={formData.exam_date}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="Total Marks">
              <input
                type="number"
                step="0.01"
                min="0"
                name="total_marks"
                placeholder="e.g. 100"
                value={formData.total_marks}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>
          </div>

          <p className="text-xs text-slate-400 -mt-2">
            Only <span className="font-medium">Final</span> exams count toward a
            student's CGPA.
          </p>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Exam"
          message="Are you sure you want to delete this exam? All results recorded against it will be deleted too."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Exam;
