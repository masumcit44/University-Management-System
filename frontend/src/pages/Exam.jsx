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

// Final is the only exam type that counts toward CGPA, so it carries the
// filled chip. Everything else stays a hairline outline.
const TYPE_STYLES = {
  Final: "bg-ink text-paper border-ink",
  Mid: "border-ink-soft text-ink",
  Quiz: "border-line text-ink-soft",
  Assignment: "border-line text-ink-soft",
};

const EMPTY_FORM = {
  course_id: "",
  exam_type: "",
  exam_date: "",
  total_marks: "",
};

// MySQL DATE columns arrive as ISO strings; <input type="date"> needs YYYY-MM-DD.
const toDateInput = (value) => (value ? String(value).split("T")[0] : "");

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-3 label-mono whitespace-nowrap";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap";

function Exam() {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Course selected in the toolbar filter (not the modal form).
  const [selectedCourseId, setSelectedCourseId] = useState("");

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
      setError("");

      const res = await api.get("/exams");
      setExams(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load exams");
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
    setFormData({
      ...EMPTY_FORM,
      // Pre-fill with the course currently selected in the toolbar, if any.
      course_id: selectedCourseId || "",
    });
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

  // Course filter applies first, then the text search narrows within it.
  const courseExams = selectedCourseId
    ? exams.filter((exam) => String(exam.course_id) === String(selectedCourseId))
    : [];

  const filteredExams = courseExams.filter((exam) => {
    const term = searchTerm.toLowerCase();
    return exam.exam_type.toLowerCase().includes(term);
  });

  const selectedCourse = courses.find(
    (c) => String(c.course_id) === String(selectedCourseId)
  );

  return (
    <MainLayout>
      <PageHeader
        title="Exams"
        subtitle="Every assessment scheduled against a course, from quiz to final."
        actionLabel="Add Exam"
        onAction={openCreateModal}
      />

      <div className="surface">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="control w-full sm:w-64"
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name} ({c.course_code})
                </option>
              ))}
            </select>

            {selectedCourseId && (
              <div className="relative w-full sm:w-64">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
                />

                <input
                  type="text"
                  placeholder="Search exam type"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="control !pl-9"
                />
              </div>
            )}
          </div>

          {selectedCourseId && (
            <p className="label-mono">
              {filteredExams.length} of {courseExams.length} records
            </p>
          )}
        </div>

        {loading ? (
          <Loader text="Loading exams" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        ) : !selectedCourseId ? (
          <div className="p-5">
            <EmptyState
              icon={NotebookPen}
              title="Select a course"
              hint="Choose a course above to see its exams"
            />
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={NotebookPen}
              title={
                courseExams.length === 0
                  ? `No exams found for ${selectedCourse?.course_name || "this course"}`
                  : "No exams match your search"
              }
              hint={
                courseExams.length === 0
                  ? "Add the first exam for this course to get started"
                  : "Try a different exam type"
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper border-b border-line">
                  <th className={TH}>Type</th>
                  <th className={TH}>Date</th>
                  <th className={`${TH} text-right`}>Total Marks</th>
                  <th className={`${TH} text-center`}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredExams.map((exam) => (
                  <tr
                    key={exam.exam_id}
                    className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-block border px-2 py-1 label-mono ${
                          TYPE_STYLES[exam.exam_type] || "border-line text-ink-soft"
                        }`}
                      >
                        {exam.exam_type}
                      </span>
                    </td>

                    <td className={`${TD} font-mono`}>
                      {toDateInput(exam.exam_date)}
                    </td>

                    <td className={`${TD} font-mono text-right text-ink`}>
                      {Number(exam.total_marks).toFixed(0)}
                    </td>

                    <td className="px-5 py-3.5">
                      <RowActions
                        onEdit={() => openEditModal(exam)}
                        onDelete={() => setDeletingId(exam.exam_id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

          <p className="text-xs text-ink-mute -mt-1 border-l-2 border-line pl-3">
            Only <span className="font-semibold text-ink">Final</span> exams count
            toward a student's CGPA.
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