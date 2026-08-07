import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

const sectionNames = {
  "/dashboard": "Dashboard",
  "/reports": "Reports",
  "/students": "Students",
  "/teachers": "Teachers",
  "/departments": "Departments",
  "/courses": "Courses",
  "/enrollment": "Enrollment",
  "/attendance": "Attendance",
  "/exams": "Exams",
  "/results": "Results",
  "/cgpa": "CGPA",
  "/timetable": "Timetable",
  "/prediction": "Prediction",
  "/chat": "AI Chat Assistant",
  "/payments": "Payments",
  "/admin": "Admin Panel",
};

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const section = sectionNames[location.pathname] || "Overview";

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const initials = currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : "EU";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <header className="h-[4.5rem] shrink-0 bg-paper border-b border-line flex items-center justify-between px-8">

      {/* Left - breadcrumb */}
      <div>
        <p className="label-mono">
          Eastern University <span className="mx-1.5 text-line">/</span> {section}
        </p>
        <h1 className="font-display font-bold text-[1.375rem] text-ink mt-1.5 leading-none">
          {section}
        </h1>
      </div>

      {/* Right - date, user, logout */}
      <div className="flex items-center gap-6">

        <p className="hidden lg:block label-mono">
          {today}
        </p>

        {currentUser && (
          <div className="flex items-center gap-3 pl-6 border-l border-line">
            <span className="w-9 h-9 flex items-center justify-center bg-ink text-paper font-mono text-xs">
              {initials}
            </span>
            <span className="leading-tight">
              <span className="block text-[0.8125rem] font-semibold text-ink">
                {currentUser.username}
              </span>
              <span className="block label-mono mt-0.5">
                {currentUser.role}
              </span>
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="btn-ghost hover:!border-danger hover:!text-danger hover:!bg-danger-soft"
        >
          <LogOut size={14} strokeWidth={2} />
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;