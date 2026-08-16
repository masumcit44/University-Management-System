import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarDays, KeyRound, LogOut, Menu } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

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
  "/chat": "AI Assistant",
  "/payments": "Payments",
  "/admin-panel": "Admin Panel",
};

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [showPasswordModal, setShowPasswordModal] = useState(false);

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
    <header className="h-[4.5rem] shrink-0 bg-paper border-b border-line flex items-center justify-between gap-6 px-5 md:px-8">

      {/* Left - hamburger (mobile) + breadcrumb */}
      <div className="min-w-0 flex items-center gap-3 self-stretch">
        <button
          onClick={onMenuClick}
          className="btn-ghost btn-pushable h-10 !px-3 shrink-0 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={16} strokeWidth={2} />
        </button>

        <div className="min-w-0 flex flex-col justify-center self-stretch">
          <p className="label-mono hidden sm:flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 bg-accent shrink-0" aria-hidden="true" />
            Eastern University <span className="text-line">/</span>{" "}
            <span className="text-ink-soft truncate">{section}</span>
          </p>
          <h1 className="font-display font-bold text-[1.25rem] md:text-[1.375rem] text-ink mt-0 sm:mt-1.5 leading-none truncate max-w-[24rem]">
            {section}
          </h1>
        </div>
      </div>

      {/* Right - date, user, password, logout */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">

        <div className="hidden lg:flex items-center gap-2.5 h-10 pl-3 pr-4 border border-line bg-panel">
          <CalendarDays size={15} strokeWidth={2} className="text-ink-soft shrink-0" />
          <p className="label-mono whitespace-nowrap">
            {today}
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center gap-3 pl-4 md:pl-5 border-l border-line h-10">
            <span className="w-10 h-10 flex items-center justify-center bg-ink text-paper font-mono text-xs font-semibold shrink-0 border border-ink">
              {initials}
            </span>
            <span className="hidden sm:flex items-center gap-2.5">
              <span
                className="block text-[0.8125rem] font-semibold text-ink truncate max-w-[9rem]"
                title={currentUser.username}
              >
                {currentUser.username}
              </span>
              <span className="badge badge-accent px-1.5 py-0.5 capitalize shrink-0">
                {currentUser.role}
              </span>
            </span>
          </div>
        )}

        <button
          onClick={() => setShowPasswordModal(true)}
          className="btn-ghost btn-pushable h-10 !px-3"
          aria-label="Change password"
          title="Change password"
        >
          <KeyRound size={14} strokeWidth={2} />
          <span className="hidden sm:inline">Password</span>
        </button>

        <button
          onClick={handleLogout}
          className="btn-ghost btn-pushable h-10 !px-3 hover:!border-danger hover:!text-danger hover:!bg-danger-soft"
        >
          <LogOut size={14} strokeWidth={2} />
          <span className="hidden sm:inline">Logout</span>
        </button>

      </div>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

    </header>
  );
}

export default Navbar;
