import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { FileText, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  enrollment_id: "",
  exam_id: "",
  marks_obtained: "",
};

// Colour the grade so a failing result is obvious at a glance.
const gradeStyle = (grade) => {
  if (grade === "F") return "text-red-600";
  if (grade === "D" || grade === "C") return "text-amber-600";
  return "text-slate-800";
};

function Results() {
  const [results, setResults] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchResults();
    fetchEnrollments();
    fetchExams();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get("/results");
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load results");
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

  const fetchExams = async () => {
    try {
      const res = await api.get("/exams");
      setExams(res.data.data);
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

  const openEditModal = (result) => {
    setFormData({
      enrollment_id: result.enrollment_id,
      exam_id: result.exam_id,
      marks_obtained: result.marks_obtained,
    });
    setEditingId(result.result_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.enrollment_id ||
      !formData.exam_id ||
      formData.marks_obtained === ""
    ) {
      alert("All fields are required");
      return;
    }

    if (Number(formData.marks_obtained) < 0) {
      alert("Marks obtained cannot be negative");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/results/${editingId}`, formData);
      } else {
        await api.post("/results", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchResults();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to save result. A result for this enrollment and exam may already exist."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/results/${deletingId}`);
      setDeletingId(null);
      fetchResults();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete result");
    }
  };

  const filteredResults = results.filter((result) => {
    const term = searchTerm.toLowerCase();

    return (
      result.student_name.toLowerCase().includes(term) ||
      result.course_name.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Results"
        subtitle="Exam results and grades"
        actionLabel="Add Result"
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
          <Loader text="Loading results..." />
        ) : filteredResults.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              results.length === 0
                ? "No results found"
                : "No results match your search"
            }
            hint={
              results.length === 0
                ? "Add the first result to get started"
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
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Exam</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Marks</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Grade</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">GPA</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredResults.map((result) => (
                <tr
                  key={result.result_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{result.result_id}</td>
                  <td className="p-4 font-medium text-slate-800">{result.student_name}</td>
                  <td className="p-4 text-slate-600">{result.course_name}</td>
                  <td className="p-4 text-slate-600">{result.exam_type}</td>
                  <td className="p-4 text-slate-600">
                    {result.marks_obtained} / {result.total_marks}
                  </td>
                  <td className={`p-4 font-semibold ${gradeStyle(result.grade_letter)}`}>
                    {result.grade_letter}
                  </td>
                  <td className="p-4 text-slate-600">{result.grade_point}</td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(result)}
                      onDelete={() => setDeletingId(result.result_id)}
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
          title={editingId ? "Edit Result" : "Add Result"}
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

          <Field label="Exam">
            <select
              name="exam_id"
              value={formData.exam_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Exam</option>
              {exams.map((ex) => (
                <option key={ex.exam_id} value={ex.exam_id}>
                  {ex.course_name} — {ex.exam_type} (Total: {ex.total_marks})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Marks Obtained">
            <input
              type="number"
              step="0.01"
              min="0"
              name="marks_obtained"
              placeholder="e.g. 78"
              value={formData.marks_obtained}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <p className="text-xs text-slate-400 -mt-2">
            The grade letter and grade point are calculated automatically from
            the exam's total marks.
          </p>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Result"
          message="Are you sure you want to delete this result? It will affect the student's CGPA."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Results;
