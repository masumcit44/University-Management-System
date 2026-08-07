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
  TrendingUp,
  ShieldCheck,
  Wallet,
  CalendarClock,
  Sparkles,
} from "lucide-react";

const groups = [
  {
    title: "Overview",
    links: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/reports", label: "Reports", icon: FileBarChart2 },
    ],
  },
  {
    title: "People",
    links: [
      { to: "/students", label: "Students", icon: Users },
      { to: "/teachers", label: "Teachers", icon: GraduationCap },
      { to: "/departments", label: "Departments", icon: Building2 },
    ],
  },
  {
    title: "Academic",
    links: [
      { to: "/courses", label: "Courses", icon: BookOpen },
      { to: "/enrollment", label: "Enrollment", icon: ClipboardList },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/exams", label: "Exams", icon: NotebookPen },
      { to: "/results", label: "Results", icon: FileText },
      { to: "/cgpa", label: "CGPA", icon: Award },
      { to: "/timetable", label: "Timetable", icon: CalendarClock },
    ],
  },
  {
    title: "Intelligence",
    links: [
      { to: "/prediction", label: "Prediction", icon: TrendingUp },
      { to: "/chat", label: "AI Chat Assistant", icon: Sparkles },
    ],
  },
  {
    title: "Administration",
    links: [
      { to: "/payments", label: "Payments", icon: Wallet },
      { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
    ],
  },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 bg-night text-night-text h-screen flex flex-col border-r border-line-strong">

      {/* Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 flex items-center justify-center bg-paper text-ink font-display font-extrabold text-sm">
            EU
          </span>
          <span className="leading-tight">
            <span className="block font-display font-bold text-[0.9375rem] text-white tracking-tight">
              Eastern University
            </span>
            <span className="block label-mono text-white/35 mt-1">
              Management System
            </span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5">
        {groups.map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <p className="label-mono text-white/30 px-5 mb-2">
              {group.title}
            </p>

            {group.links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;

              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 pl-5 pr-4 py-2.5 transition-colors ${
                    active
                      ? "bg-white/[0.07] text-white"
                      : "text-night-text hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <span
                    className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors ${
                      active ? "bg-paper" : "bg-transparent"
                    }`}
                  />
                  <Icon
                    size={17}
                    strokeWidth={active ? 2.2 : 1.7}
                    className="shrink-0"
                  />
                  <span className="text-[0.8125rem] font-medium tracking-tight">
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="label-mono text-white/25">
          Spring 2025 &middot; v0.3.0
        </p>
      </div>

    </aside>
  );
}

export default Sidebar;