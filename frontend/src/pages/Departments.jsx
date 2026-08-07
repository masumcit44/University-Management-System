import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Building2, Search, Pencil, Trash2 } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Field, { CONTROL_CLASS } from "../components/Field";

const EMPTY_FORM = {
  department_name: "",
  department_code: "",
  department_head: "",
};

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      setError("");

      const res = await api.get("/departments");
      setDepartments(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load departments");
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
        subtitle="Academic departments that own every course, teacher and student record."
        actionLabel="Add Department"
        onAction={openCreateModal}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
          />

          <input
            type="text"
            placeholder="Search department or code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="control !pl-9"
          />
        </div>

        <p className="label-mono">
          {filteredDepartments.length} of {departments.length} records
        </p>
      </div>

      {loading ? (
        <div className="surface">
          <Loader text="Loading departments" />
        </div>
      ) : error ? (
        <div className="surface">
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="surface p-5">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((department, index) => (
            <div
              key={department.department_id}
              className="surface p-5 flex flex-col relative group hover:border-ink transition-colors"
            >
              {/* Index number + code chip */}
              <div className="flex items-start justify-between mb-4">
                <span className="font-mono text-[1.75rem] leading-none text-line-strong/15 font-medium">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="inline-block border border-line px-2 py-1 label-mono text-ink-soft">
                  {department.department_code}
                </span>
              </div>

              {/* Name */}
              <h3 className="font-display font-bold text-lg text-ink tracking-tight leading-snug">
                {department.department_name}
              </h3>

              {/* Head */}
              <p className="text-[0.8125rem] text-ink-soft mt-2">
                {department.department_head ? (
                  <>
                    <span className="label-mono">Head </span>
                    {department.department_head}
                  </>
                ) : (
                  <span className="label-mono">No head assigned</span>
                )}
              </p>

              {/* Actions - revealed on hover, top-right */}
              <div className="flex gap-1.5 mt-5 pt-4 border-t border-line">
                <button
                  onClick={() => openEditModal(department)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-line text-ink-mute hover:border-accent hover:text-accent hover:bg-accent-soft transition-colors label-mono"
                >
                  <Pencil size={13} strokeWidth={1.9} />
                  Edit
                </button>

                <button
                  onClick={() => setDeletingId(department.department_id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 border border-line text-ink-mute hover:border-danger hover:text-danger hover:bg-danger-soft transition-colors label-mono"
                >
                  <Trash2 size={13} strokeWidth={1.9} />
                  Delete
                </button>
              </div>

              {/* Faint ID footer */}
              <p className="label-mono absolute bottom-2 right-3 !text-ink-mute/40">
                #{String(department.department_id).padStart(3, "0")}
              </p>
            </div>
          ))}
        </div>
      )}

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