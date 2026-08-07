import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";

const STATUS_STYLES = {
  Paid: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Failed: "bg-red-100 text-red-700",
};

function Payments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    status: "Pending",
    method: "Cash",
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/payments");
      setPayments(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load payments");
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      student_id: "",
      amount: "",
      status: "Pending",
      method: "Cash",
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
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
    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, formData);
        alert("Payment Updated Successfully");
      } else {
        await api.post("/payments", formData);
        alert("Payment Created Successfully");
      }

      setShowModal(false);
      resetForm();
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save payment");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment record?")) return;

    try {
      await api.delete(`/payments/${id}`);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Failed to delete payment");
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Payments</h1>
          <p className="text-slate-500 mt-1">
            Track student fee payments and dues
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Add Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="text-blue-600 p-6">Loading payments...</p>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Wallet size={40} className="mb-3" />
            <p className="font-medium">No payment records yet</p>
            <p className="text-sm">Add the first payment to get started</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Student</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Amount</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Method</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Date</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((payment) => (
                <tr
                  key={payment.payment_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{payment.payment_id}</td>
                  <td className="p-4 font-medium text-slate-800">{payment.student_name}</td>
                  <td className="p-4 font-semibold text-slate-800">
                    ৳{Number(payment.amount).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        STATUS_STYLES[payment.status] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{payment.method || "—"}</td>
                  <td className="p-4 text-slate-500">
                    {payment.payment_date
                      ? new Date(payment.payment_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(payment)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(payment.payment_id)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h2 className="text-2xl font-bold mb-5 text-slate-800">
              {editingId ? "Edit Payment" : "Add Payment"}
            </h2>

            <label className="text-sm font-medium text-slate-600">Student</label>
            <select
              name="student_id"
              value={formData.student_id}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.student_id} value={s.student_id}>
                  {s.student_name} (#{s.student_id})
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-slate-600">Amount (৳)</label>
            <input
              type="number"
              name="amount"
              placeholder="e.g. 15000"
              value={formData.amount}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="text-sm font-medium text-slate-600">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Failed">Failed</option>
            </select>

            <label className="text-sm font-medium text-slate-600">Method</label>
            <select
              name="method"
              value={formData.method}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Mobile Banking">Mobile Banking</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Payments;