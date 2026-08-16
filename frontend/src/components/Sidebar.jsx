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
  Link2,
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
      { to: "/teacher-courses", label: "Teacher Assignments", icon: Link2, allowedRoles: ["admin"] },
      { to: "/enrollment", label: "Enrollment", icon: ClipboardList, allowedRoles: ["admin", "teacher"] },
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
      { to: "/prediction", label: "Prediction", icon: TrendingUp, allowedRoles: ["admin", "teacher"] },
      { to: "/chat", label: "AI Assistant", icon: Sparkles },
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

// Off-canvas on small screens, static rail from lg up.
function Sidebar({ open = false, onClose }) {
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

  const handleNav = () => {
    if (typeof onClose === "function") onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/45 lg:hidden"
          aria-hidden="true"
          onClick={handleNav}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-night text-night-text border-r border-line-strong flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10 bg-night-soft">
          <div className="flex items-center gap-3.5">
            <span className="relative w-10 h-10 flex items-center justify-center bg-paper text-ink font-display font-extrabold text-sm border border-white/15">
              EU
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
            </span>
            <span className="leading-tight min-w-0">
              <span className="block font-serif font-semibold text-[1.0625rem] text-white tracking-[-0.01em]">
                Eastern University
              </span>
              <span className="block label-mono text-white/35 mt-1.5">
                Management System
              </span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5">
          {visibleGroups.map((group, index) => (
            <div
              key={group.title}
              className={`mb-6 last:mb-0 ${
                index !== 0 ? "pt-5 border-t border-white/10" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 px-5 mb-2">
                <span
                  aria-hidden="true"
                  className="w-6 h-6 flex items-center justify-center border border-white/15 bg-white/[0.04] font-mono text-[0.625rem] leading-none text-white/35"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="label-mono text-white/45">{group.title}</p>
                <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
              </div>

              {group.links.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to;

                return (
                  <Link
                    key={label}
                    to={to}
                    onClick={handleNav}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-2.5 pl-4 pr-3 py-2 transition-colors duration-150 ${
                      active
                        ? "bg-accent/[0.16] text-white"
                        : "text-night-text hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`active-bar ${
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      }`}
                    />
                    <span className="w-4 h-4 flex items-center justify-center shrink-0">
                      <Icon
                        size={16}
                        strokeWidth={active ? 2.2 : 1.7}
                        className="shrink-0"
                      />
                    </span>
                    <span
                      className={`flex-1 min-w-0 truncate text-[0.8125rem] tracking-tight ${
                        active ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {label}
                    </span>
                    {active && (
                      <span
                        aria-hidden="true"
                        className="w-1.5 h-1.5 bg-accent shrink-0"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10">
          <span aria-hidden="true" className="block h-[3px] w-full bg-accent" />
          <div className="px-5 py-4 space-y-4">
            {currentUser && (
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 flex items-center justify-center bg-accent text-white font-mono text-xs font-semibold shrink-0 border border-accent">
                  {currentUser.username?.slice(0, 2).toUpperCase()}
                </span>
                <span className="leading-tight min-w-0 flex-1">
                  <span className="block text-[0.8125rem] font-semibold text-white truncate">
                    {currentUser.username}
                  </span>
                  <span className="block label-mono text-white/30 mt-1">
                    Signed in
                  </span>
                </span>
                <span className="badge badge-neutral px-1.5 py-0.5 capitalize shrink-0">
                  {currentUser.role}
                </span>
              </div>
            )}
            <div className="pt-3.5 border-t border-white/10 flex items-center justify-between">
              <p className="label-mono text-white/30">
                © {new Date().getFullYear()}
              </p>
              <p className="label-mono text-white/45">v0.3.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
