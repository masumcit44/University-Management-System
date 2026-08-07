import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="h-16 bg-white shadow flex justify-between items-center px-6">

      <h2 className="text-2xl font-bold text-slate-800">
        University Management System
      </h2>

      <div className="flex items-center gap-4">
        {currentUser && (
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800">
              {currentUser.username}
            </p>
            <p className="text-xs text-slate-500 capitalize">
              {currentUser.role}
            </p>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>

    </div>
  );
}

export default Navbar;