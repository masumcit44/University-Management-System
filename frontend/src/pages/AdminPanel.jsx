import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { ShieldCheck, Trash2 } from "lucide-react";

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load users");
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

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      alert("User Deleted Successfully");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const roleBadge = (role) => {
    const styles = {
      admin: "bg-purple-100 text-purple-700",
      teacher: "bg-blue-100 text-blue-700",
      student: "bg-slate-100 text-slate-600",
    };

    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
          styles[role] || "bg-slate-100 text-slate-600"
        }`}
      >
        {role}
      </span>
    );
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">Admin Panel</h1>
        <p className="text-slate-500 mt-1">Manage system users and roles</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="text-blue-600 p-6">Loading users...</p>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <ShieldCheck size={40} className="mb-3" />
            <p className="font-medium">No users found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">ID</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Username</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Email</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Role</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Change Role</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr
                  key={u.user_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4 text-slate-500">#{u.user_id}</td>
                  <td className="p-4 font-medium text-slate-800">{u.username}</td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">{roleBadge(u.role)}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                      className="border rounded-lg p-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {currentUser && String(currentUser.user_id) === String(u.user_id) ? (
                      <span className="text-xs text-slate-400">You</span>
                    ) : (
                      <button
                        onClick={() => handleDeleteUser(u.user_id)}
                        className="flex items-center gap-1.5 text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </MainLayout>
  );
}

export default AdminPanel;