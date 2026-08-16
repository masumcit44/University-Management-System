import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { toDateInput } from "../services/date";
import { Wallet, Search } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import SortableTh from "../components/SortableTh";
import Field, { CONTROL_CLASS } from "../components/Field";
import Pager from "../components/Pager";
import { useSort } from "../services/useSort";
import { usePagination } from "../services/usePagination";

// Colour square per status - rendered inside the status badge
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
const TH = "text-left px-5 py-3 label-mono whitespace-nowrap align-middle";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

function Payments() {
  // Students see only their own payment history - read-only (backend enforces too)
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isStudent = currentUser?.role === "student";
  const canManage = !isStudent;

  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [modalError, setModalError] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetchPayments();
    if (!isStudent) fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      setError("");
      const res = isStudent
        ? await api.get(`/payments/student/${currentUser.student_id}`)
        : await api.get("/payments");
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
      setError(
        isStudent ? "Failed to load your payments" : "Failed to load payments"
      );
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
    setErrors({});
    setModalError("");
    setSaved(false);
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
    setErrors({});
    setModalError("");
    setSaved(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = "Select a student";
    if (!formData.amount) newErrors.amount = "Amount is required";
    else if (Number(formData.amount) <= 0)
      newErrors.amount = "Amount must be greater than zero";

    setErrors(newErrors);
    setModalError("");
    if (Object.keys(newErrors).length) return;

    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, formData);
      } else {
        await api.post("/payments", formData);
      }

      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setSaved(false);
        fetchPayments();
      }, 600);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.message || "Failed to save payment");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/payments/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      fetchPayments();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete payment");
    }
  };

  const statusBadge = (status) => (
    <span
      className={`badge ${
        status === "Paid"
          ? "badge-ok"
          : status === "Pending"
          ? "badge-warn"
          : status === "Failed"
          ? "badge-danger"
          : "badge-neutral"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 shrink-0 ${STATUS_DOTS[status] || "bg-ink-mute"}`}
      />
      {status}
    </span>
  );

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      String(p.student_name ?? "").toLowerCase().includes(term) ||
      p.status.toLowerCase().includes(term)
    );
  });

  const { sorted: sortedPayments, sortKey, sortDir, toggle } = useSort(filteredPayments, {
    accessors: {
      id: (p) => Number(p.payment_id) || 0,
      student: (p) => String(p.student_name ?? ""),
      amount: (p) => Number(p.amount) || 0,
      status: (p) => String(p.status ?? ""),
      method: (p) => String(p.method ?? ""),
      date: (p) => String(p.payment_date ?? ""),
    },
  });

  const { pageItems: pagePayments, page, setPage, pageCount, startIndex, endIndex } =
    usePagination(sortedPayments);

  return (
    <MainLayout>
      <PageHeader
        title={isStudent ? "My Payments" : "Payments"}
        subtitle={
          isStudent
            ? "Your fee payments, dues and settlement history."
            : "Student fee payments, dues and settlement history."
        }
        actionLabel={canManage ? "Add Payment" : undefined}
        onAction={canManage ? openCreateModal : undefined}
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
            <span className="font-mono text-ink">{filteredPayments.length}</span>
            <span className="text-ink-mute"> of {payments.length} records</span>
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
          <div className="table-scroll">
            <table className="data-table w-full">
              <thead>
                <tr className="bg-paper border-b border-line">
                  <SortableTh
                    label="Student"
                    sortKey="student"
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggle}
                    className={TH}
                  />
                  <SortableTh
                    label="Amount"
                    sortKey="amount"
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggle}
                    className={TH}
                  />
                  <SortableTh
                    label="Status"
                    sortKey="status"
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggle}
                    className={TH}
                  />
                  <SortableTh
                    label="Method"
                    sortKey="method"
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggle}
                    className={TH}
                  />
                  <SortableTh
                    label="Date"
                    sortKey="date"
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggle}
                    className={TH}
                  />
                  <SortableTh
                    label="ID"
                    sortKey="id"
                    activeKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggle}
                    className={TH}
                  />
                  {canManage && <th className={`${TH} text-center`}>Action</th>}
                </tr>
              </thead>

              <tbody>
                {pagePayments.map((payment) => (
                  <tr
                    key={payment.payment_id}
                    className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[0.8125rem] font-semibold text-ink">
                      {payment.student_name || `Student #${payment.student_id}`}
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
                        ? toDateInput(payment.payment_date)
                        : "—"}
                    </td>

                    <td className={`${TD} font-mono text-ink-mute`}>
                      {String(payment.payment_id).padStart(3, "0")}
                    </td>

                    {canManage && (
                      <td className="px-5 py-3.5">
                        <RowActions
                          onEdit={() => openEditModal(payment)}
                          onDelete={() => setDeletingId(payment.payment_id)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager
          startIndex={startIndex}
          endIndex={endIndex}
          total={filteredPayments.length}
          page={page}
          pageCount={pageCount}
          onPage={setPage}
        />
      </div>

      {canManage && showModal && (
        <Modal
          title={editingId ? "Edit Payment" : "Add Payment"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
          saved={saved}
          modalError={modalError}
          saveHint="STUDENT + AMOUNT required"
        >
          <Field label="Student" error={errors.student_id}>
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

          <Field label="Amount (৳)" error={errors.amount}>
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

      {canManage && deletingId && (
        <ConfirmDialog
          title="Delete Payment"
          message="Are you sure you want to delete this payment record? This cannot be undone."
          error={deleteError}
          onCancel={() => {
            setDeletingId(null);
            setDeleteError("");
          }}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Payments;