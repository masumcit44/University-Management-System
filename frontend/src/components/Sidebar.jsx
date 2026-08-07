import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileText,
  Award,
  NotebookPen,
  FileBarChart2,
  ShieldCheck,
  Wallet,
  CalendarClock,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/students", label: "Students", icon: Users },
    { to: "/teachers", label: "Teachers", icon: GraduationCap },
    { to: "/departments", label: "Departments", icon: Building2 },
    { to: "/courses", label: "Courses", icon: BookOpen },
    { to: "/enrollment", label: "Enrollment", icon: ClipboardList },
    { to: "/attendance", label: "Attendance", icon: CalendarCheck },
    { to: "/results", label: "Results", icon: FileText },
    { to: "/cgpa", label: "CGPA", icon: Award },
    { to: "/exams", label: "Exams", icon: NotebookPen },
    { to: "/reports", label: "Reports", icon: FileBarChart2 },
    { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
    { to: "/payments", label: "Payments", icon: Wallet },
    { to: "/timetable", label: "Timetable", icon: CalendarClock },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col">
      <div className="text-center text-2xl font-bold py-6 border-b border-slate-700 tracking-wide">
        UMS
      </div>

      <nav className="flex flex-col p-4 gap-1 overflow-y-auto">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;

          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default Sidebar;