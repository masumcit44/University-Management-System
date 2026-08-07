import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Building2, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  department_name: "",
  department_code: "",
  department_head: "",
};

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load departments");
    } finally {
      setLoading(false);
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

  const openEditModal = (department) => {
    setFormData({
      department_name: department.department_name,
      department_code: department.department_code,
      department_head: department.department_head || "",
    });
    setEditingId(department.department_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.department_name || !formData.department_code) {
      alert("Department name and code are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, formData);
      } else {
        await api.post("/departments", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save department");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/departments/${deletingId}`);
      setDeletingId(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to delete department. It may still have students, teachers or courses attached."
      );
    }
  };

  const filteredDepartments = departments.filter((department) => {
    const term = searchTerm.toLowerCase();

    return (
      department.department_name.toLowerCase().includes(term) ||
      department.department_code.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Departments"
        subtitle="Academic departments of the university"
        actionLabel="Add Department"
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
              placeholder="Search department or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-slate-200 rounded-lg pl-9 pr-4 py-2 w-full outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <Loader text="Loading departments..." />
        ) : filteredDepartments.length === 0 ? (
          <EmptyState
            icon={Building2}
            title={
              departments.length === 0
                ? "No departments found"
                : "No departments match your search"
            }
            hint={
              departments.length === 0
                ? "Add the first department to get started"
                : "Try a different name or code"
            }
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Department</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Code</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Head</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDepartments.map((department) => (
                <tr
                  key={department.department_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{department.department_id}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {department.department_name}
                  </td>
                  <td className="p-4 text-slate-600">{department.department_code}</td>
                  <td className="p-4 text-slate-600">
                    {department.department_head || "—"}
                  </td>
                  <td className="p-4">
                    <RowActions
                      onEdit={() => openEditModal(department)}
                      onDelete={() => setDeletingId(department.department_id)}
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
          title={editingId ? "Edit Department" : "Add Department"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Department Name">
            <input
              type="text"
              name="department_name"
              placeholder="e.g. Computer Science and Engineering"
              value={formData.department_name}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Department Code">
            <input
              type="text"
              name="department_code"
              placeholder="e.g. CSE"
              value={formData.department_code}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Department Head (optional)">
            <input
              type="text"
              name="department_head"
              placeholder="e.g. Dr. Rahim Uddin"
              value={formData.department_head}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Department"
          message="Are you sure you want to delete this department? Students, teachers and courses linked to it will block the deletion."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Departments;
