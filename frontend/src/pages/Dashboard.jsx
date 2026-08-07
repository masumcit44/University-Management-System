import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Building2,
  BookOpen,
  ArrowUpRight,
  ClipboardList,
  CalendarCheck,
  FileText,
  TrendingUp,
  Wallet,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import api from "../services/api";

const tiles = [
  { key: "total_students", label: "Students", icon: Users, to: "/students" },
  { key: "total_teachers", label: "Teachers", icon: GraduationCap, to: "/teachers" },
  { key: "total_departments", label: "Departments", icon: Building2, to: "/departments" },
  { key: "total_courses", label: "Courses", icon: BookOpen, to: "/courses" },
];

const shortcuts = [
  { to: "/enrollment", label: "Enrollment", icon: ClipboardList, hint: "Register students into courses" },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, hint: "Record daily class attendance" },
  { to: "/results", label: "Results", icon: FileText, hint: "Enter marks and publish grades" },
  { to: "/prediction", label: "Prediction", icon: TrendingUp, hint: "Flag students at academic risk" },
  { to: "/payments", label: "Payments", icon: Wallet, hint: "Track tuition and semester fees" },
];

function Dashboard() {

  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_departments: 0,
    total_courses: 0,
  });

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data.data);
      setFailed(false);
    } catch (error) {
      console.error("Dashboard Error:", error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <MainLayout>

      <PageHeader
        title="Dashboard"
        subtitle="Spring 2025 session at a glance. Every figure below is read live from the university database."
      />

      {loading ? (
        <Loader text="Loading summary" />
      ) : (
        <>
          {/* Stat ledger - shared hairlines, no gaps */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-line">
            {tiles.map(({ key, label, icon: Icon, to }) => (
              <Link
                key={key}
                to={to}
                className="group relative bg-panel border-r border-b border-line px-6 py-7 transition-colors hover:bg-accent-soft"
              >
                <div className="flex items-start justify-between">
                  <p className="label-mono">{label}</p>
                  <Icon
                    size={16}
                    strokeWidth={1.7}
                    className="text-ink-mute group-hover:text-accent transition-colors"
                  />
                </div>

                <p className="font-mono text-[2.75rem] leading-none tracking-tight text-ink mt-6">
                  {failed ? "--" : String(stats[key] ?? 0).padStart(2, "0")}
                </p>

                <span className="flex items-center gap-1 label-mono mt-5 text-ink-mute group-hover:text-accent transition-colors">
                  View
                  <ArrowUpRight size={12} strokeWidth={2} />
                </span>
              </Link>
            ))}
          </div>

          {failed && (
            <p className="text-[0.8125rem] text-danger mt-4">
              Could not reach the server. Figures shown as <span className="font-mono">--</span>.
              Check that the backend is running on port 5000.
            </p>
          )}

          {/* Shortcuts */}
          <section className="mt-14">
            <div className="flex items-center gap-4 mb-5">
              <h2 className="font-display font-bold text-lg text-ink tracking-tight">
                Daily operations
              </h2>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-line border border-line">
              {shortcuts.map(({ to, label, icon: Icon, hint }) => (
                <Link
                  key={to}
                  to={to}
                  className="group bg-panel px-6 py-5 flex items-start gap-4 transition-colors hover:bg-paper"
                >
                  <span className="w-9 h-9 shrink-0 flex items-center justify-center border border-line text-ink-mute group-hover:border-ink group-hover:text-ink transition-colors">
                    <Icon size={16} strokeWidth={1.8} />
                  </span>

                  <span className="min-w-0">
                    <span className="block font-display font-bold text-[0.9375rem] text-ink tracking-tight">
                      {label}
                    </span>
                    <span className="block text-[0.8125rem] text-ink-soft mt-1 leading-relaxed">
                      {hint}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

    </MainLayout>
  );
}

export default Dashboard;