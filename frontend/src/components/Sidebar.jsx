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

// allowedRoles omitted = visible to every logged-in role
const groups = [
  {
    title: "Overview",
    links: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ["admin"] },
      { to: "/teacher-dashboard", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ["teacher"] },
      { to: "/student-dashboard", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ["student"] },
      { to: "/reports", label: "Reports", icon: FileBarChart2, allowedRoles: ["admin"] },
    ],
  },
  {
    title: "People",
    links: [
      { to: "/students", label: "Students", icon: Users, allowedRoles: ["admin", "teacher"] },
      { to: "/teachers", label: "Teachers", icon: GraduationCap, allowedRoles: ["admin"] },
      { to: "/departments", label: "Departments", icon: Building2, allowedRoles: ["admin"] },
    ],
  },
  {
    title: "Academic",
    links: [
      { to: "/courses", label: "Courses", icon: BookOpen, allowedRoles: ["admin", "teacher"] },
      { to: "/courses", label: "My Courses", icon: BookOpen, allowedRoles: ["student"] },
      { to: "/enrollment", label: "Enrollment", icon: ClipboardList, allowedRoles: ["admin"] },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck, allowedRoles: ["admin", "teacher"] },
      { to: "/attendance", label: "My Attendance", icon: CalendarCheck, allowedRoles: ["student"] },
      { to: "/exams", label: "Exams", icon: NotebookPen, allowedRoles: ["admin", "teacher"] },
      { to: "/exams", label: "My Exams", icon: NotebookPen, allowedRoles: ["student"] },
      { to: "/results", label: "Results", icon: FileText, allowedRoles: ["admin", "teacher"] },
      { to: "/results", label: "My Results", icon: FileText, allowedRoles: ["student"] },
      { to: "/cgpa", label: "CGPA", icon: Award, allowedRoles: ["admin"] },
      { to: "/cgpa", label: "My CGPA", icon: Award, allowedRoles: ["student"] },
      { to: "/timetable", label: "Timetable", icon: CalendarClock, allowedRoles: ["admin", "teacher"] },
      { to: "/timetable", label: "My Timetable", icon: CalendarClock, allowedRoles: ["student"] },
    ],
  },
  {
    title: "Intelligence",
    links: [
      { to: "/prediction", label: "Prediction", icon: TrendingUp, allowedRoles: ["admin"] },
      { to: "/chat", label: "AI Chat Assistant", icon: Sparkles },
    ],
  },
  {
    title: "Administration",
    links: [
      { to: "/payments", label: "Payments", icon: Wallet, allowedRoles: ["admin"] },
      { to: "/payments", label: "My Payments", icon: Wallet, allowedRoles: ["student"] },
      { to: "/admin-panel", label: "Admin Panel", icon: ShieldCheck, allowedRoles: ["admin"] },
    ],
  },
];

function Sidebar() {
  const location = useLocation();

  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const role = currentUser?.role;

  // Filter each group's links by role, then drop any group left with none
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      links: group.links.filter(
        (link) => !link.allowedRoles || link.allowedRoles.includes(role)
      ),
    }))
    .filter((group) => group.links.length > 0);

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
        {visibleGroups.map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <p className="label-mono text-white/30 px-5 mb-2">
              {group.title}
            </p>

            {group.links.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;

              return (
                <Link
                  key={label}
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