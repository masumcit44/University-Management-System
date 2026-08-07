import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { BookOpen, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  course_name: "",
  course_code: "",
  credit: "",
  semester: "",
  department_id: "",
};

function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load courses");
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

  const openEditModal = (course) => {
    setFormData({
      course_name: course.course_name,
      course_code: course.course_code,
      credit: course.credit,
      semester: course.semester,
      department_id: course.department_id,
    });
    setEditingId(course.course_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.course_name ||
      !formData.course_code ||
      !formData.credit ||
      !formData.semester ||
      !formData.department_id
    ) {
      alert("All fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/courses/${editingId}`, formData);
      } else {
        await api.post("/courses", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save course");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/courses/${deletingId}`);
      setDeletingId(null);
      fetchCourses();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete course");
    }
  };

  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();

    return (
      course.course_name.toLowerCase().includes(term) ||
      course.course_code.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Courses"
        subtitle="Courses offered across departments"
        actionLabel="Add Course"
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
              placeholder="Search course or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading courses..." />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={
              courses.length === 0
                ? "No courses found"
                : "No courses match your search"
            }
            hint={
              courses.length === 0
                ? "Add the first course to get started"
                : "Try a different name or code"
            }
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Course</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Code</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Credit</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Semester</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Department</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCourses.map((course) => (
                <tr
                  key={course.course_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{course.course_id}</td>
                  <td className="p-4 font-medium text-slate-800">{course.course_name}</td>
                  <td className="p-4 text-slate-600">{course.course_code}</td>
                  <td className="p-4 text-slate-600">{course.credit}</td>
                  <td className="p-4 text-slate-600">{course.semester}</td>
                  <td className="p-4 text-slate-600">{course.department_name}</td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(course)}
                      onDelete={() => setDeletingId(course.course_id)}
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
          title={editingId ? "Edit Course" : "Add Course"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Course Name">
            <input
              type="text"
              name="course_name"
              placeholder="e.g. Database Management Lab"
              value={formData.course_name}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Course Code">
            <input
              type="text"
              name="course_code"
              placeholder="e.g. 06123228"
              value={formData.course_code}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <div className="grid grid-cols-2 gap-x-4">
            <Field label="Credit">
              <input
                type="number"
                step="0.25"
                name="credit"
                placeholder="3.00"
                value={formData.credit}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

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
          </div>

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
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Course"
          message="Are you sure you want to delete this course? Its enrollments, exams and timetable entries will be deleted too."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Courses;
