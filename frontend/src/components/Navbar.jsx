import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <div className="h-16 bg-white shadow flex justify-between items-center px-6">

      <h2 className="text-2xl font-bold">
        University Management System
      </h2>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded"
      >
        Logout
      </button>

    </div>
  );
}

export default Navbar;