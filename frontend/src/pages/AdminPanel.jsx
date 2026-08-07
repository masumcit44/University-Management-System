import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { ShieldCheck, Trash2 } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { CONTROL_CLASS } from "../components/Field";

const TH = "text-left px-5 py-3 label-mono whitespace-nowrap";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError("");
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${deletingId}`);
      setDeletingId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Admin Panel"
        subtitle="System-wide user accounts and role assignment."
      />

      <div className="surface">
        {loading ? (
          <Loader text="Loading users" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        ) : users.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={ShieldCheck} title="No users found" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper border-b border-line">
                  <th className={TH}>ID</th>
                  <th className={TH}>Username</th>
                  <th className={TH}>Email</th>
                  <th className={TH}>Role</th>
                  <th className={TH}>Change Role</th>
                  <th className={`${TH} text-center`}>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.user_id}
                    className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                  >
                    <td className={`${TD} font-mono text-ink-mute`}>
                      {String(u.user_id).padStart(3, "0")}
                    </td>

                    <td className="px-5 py-3.5 text-[0.8125rem] font-semibold text-ink">
                      {u.username}
                    </td>

                    <td className={TD}>{u.email}</td>

                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-block border border-line px-2 py-1 label-mono text-ink-soft capitalize">
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                        className={`${CONTROL_CLASS} !mt-0 !py-1.5 w-36`}
                      >
                        <option value="admin">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                      </select>
                    </td>

                    <td className="px-5 py-3.5 text-center">
                      {currentUser && String(currentUser.user_id) === String(u.user_id) ? (
                        <span className="label-mono">You</span>
                      ) : (
                        <button
                          onClick={() => setDeletingId(u.user_id)}
                          title="Delete"
                          aria-label="Delete"
                          className="p-1.5 border border-line text-ink-mute hover:border-danger hover:text-danger hover:bg-danger-soft transition-colors"
                        >
                          <Trash2 size={15} strokeWidth={1.9} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deletingId && (
        <ConfirmDialog
          title="Delete User"
          message="Are you sure you want to delete this user account? This cannot be undone."
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDeleteUser}
        />
      )}
    </MainLayout>
  );
}

export default AdminPanel;