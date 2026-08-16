import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { ShieldCheck, Trash2 } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import SortableTh from "../components/SortableTh";
import { CONTROL_CLASS } from "../components/Field";
import { useSort } from "../services/useSort";

const TH = "text-left px-5 py-3 label-mono whitespace-nowrap align-middle";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap align-middle";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deleteError, setDeleteError] = useState("");
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
      setActionError("");
      await api.put(`/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
      setActionError(
        err.response?.data?.message || "Failed to update role"
      );
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/users/${deletingId}`);
      setDeletingId(null);
      setDeleteError("");
      fetchUsers();
    } catch (err) {
      console.error(err);
      setDeleteError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const { sorted: sortedUsers, sortKey, sortDir, toggle } = useSort(users, {
    accessors: {
      id: (u) => Number(u.user_id) || 0,
      username: (u) => String(u.username ?? ""),
      email: (u) => String(u.email ?? ""),
      role: (u) => String(u.role ?? ""),
    },
  });

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
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
              <p className="label-mono">
                <span className="font-mono text-ink">{users.length}</span>
                <span className="text-ink-mute"> users</span>
              </p>
            </div>

            {actionError && (
              <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-danger/30 bg-danger-soft">
                <p className="text-[0.8125rem] text-danger">{actionError}</p>
                <button
                  onClick={() => setActionError("")}
                  className="label-mono text-danger hover:text-ink transition-colors"
                >
                  DISMISS
                </button>
              </div>
            )}

            <div className="table-scroll">
              <table className="data-table w-full">
                <thead>
                  <tr className="bg-paper border-b border-line">
                    <SortableTh
                      label="ID"
                      sortKey="id"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggle}
                      className={TH}
                    />
                    <SortableTh
                      label="Username"
                      sortKey="username"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggle}
                      className={TH}
                    />
                    <SortableTh
                      label="Email"
                      sortKey="email"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggle}
                      className={TH}
                    />
                    <SortableTh
                      label="Role"
                      sortKey="role"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={toggle}
                      className={TH}
                    />
                    <th className={TH}>Change Role</th>
                    <th className={`${TH} text-center`}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedUsers.map((u) => (
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
                          disabled={
                            currentUser &&
                            String(currentUser.user_id) === String(u.user_id)
                          }
                          className={`${CONTROL_CLASS} !mt-0 !py-1.5 w-36 disabled:opacity-50 disabled:cursor-not-allowed`}
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
                            className="p-1.5 border border-line text-ink-mute hover:border-danger hover:text-danger hover:bg-danger-soft active:translate-y-px transition-colors"
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
          </>
        )}
      </div>

      {deletingId && (
        <ConfirmDialog
          title="Delete User"
          message="Are you sure you want to delete this user account? This cannot be undone."
          error={deleteError}
          onCancel={() => {
            setDeletingId(null);
            setDeleteError("");
          }}
          onConfirm={handleDeleteUser}
        />
      )}
    </MainLayout>
  );
}

export default AdminPanel;