import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Wallet, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

// Small colour square per status - no pills, keeps the ledger look
const STATUS_DOTS = {
  Paid: "bg-accent",
  Pending: "bg-warn",
  Failed: "bg-danger",
};

const EMPTY_FORM = {
  student_id: "",
  amount: "",
  status: "Pending",
  method: "Cash",
};

// Shared table cell styles - reused by every column
const TH = "text-left px-5 py-3 label-mono whitespace-nowrap";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      setError("");
      const res = await api.get("/payments");
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load payments");
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (payment) => {
    setFormData({
      student_id: payment.student_id,
      amount: payment.amount,
      status: payment.status,
      method: payment.method || "Cash",
    });
    setEditingId(payment.payment_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.student_id || !formData.amount) {
      alert("Student and amount are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, formData);
      } else {
        await api.post("/payments", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save payment");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/payments/${deletingId}`);
      setDeletingId(null);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete payment");
    }
  };

  const statusBadge = (status) => (
    <span className="inline-flex items-center gap-2">
      <span className={`w-2 h-2 shrink-0 ${STATUS_DOTS[status] || "bg-ink-mute"}`} />
      <span className="label-mono !text-ink">{status}</span>
    </span>
  );

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.student_name.toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Payments"
        subtitle="Student fee payments, dues and settlement history."
        actionLabel="Add Payment"
        onAction={openCreateModal}
      />

      <div className="surface">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search student or status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control !pl-9"
            />
          </div>

          <p className="label-mono">
            {filteredPayments.length} of {payments.length} records
          </p>
        </div>

        {loading ? (
          <Loader text="Loading payments" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        ) : filteredPayments.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Wallet}
              title={
                payments.length === 0
                  ? "No payment records yet"
                  : "No payments match your search"
              }
              hint={
                payments.length === 0
                  ? "Add the first payment to get started"
                  : "Try a different name or status"
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper border-b border-line">
                  <th className={TH}>ID</th>
                  <th className={TH}>Student</th>
                  <th className={TH}>Amount</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Method</th>
                  <th className={TH}>Date</th>
                  <th className={`${TH} text-center`}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                  >
                    <td className={`${TD} font-mono text-ink-mute`}>
                      {String(payment.payment_id).padStart(3, "0")}
                    </td>

                    <td className="px-5 py-3.5 text-[0.8125rem] font-semibold text-ink">
                      {payment.student_name}
                    </td>

                    <td className="px-5 py-3.5 text-[0.8125rem] font-mono font-semibold text-ink">
                      ৳{Number(payment.amount).toLocaleString()}
                    </td>

                    <td className="px-5 py-3.5">{statusBadge(payment.status)}</td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-block border border-line px-2 py-1 label-mono text-ink-soft">
                        {payment.method || "—"}
                      </span>
                    </td>

                    <td className={TD}>
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-3.5">
                      <RowActions
                        onEdit={() => openEditModal(payment)}
                        onDelete={() => setDeletingId(payment.payment_id)}
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
          title={editingId ? "Edit Payment" : "Add Payment"}
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
                  {s.student_name} (#{s.student_id})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Amount (৳)">
            <input
              type="number"
              name="amount"
              placeholder="e.g. 15000"
              value={formData.amount}
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
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>
          </Field>

          <Field label="Method">
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Banking">Mobile Banking</option>
            </select>
          </Field>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Payment"
          message="Are you sure you want to delete this payment record? This cannot be undone."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Payments;