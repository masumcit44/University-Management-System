import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarCheck,
  FileText,
  NotebookPen,
  CalendarClock,
  Wallet,
  Award,
  ArrowUpRight,
  Clock,
  MapPin,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

const shortcuts = [
  { to: "/courses", label: "My Courses", icon: BookOpen, hint: "Courses you're enrolled in" },
  { to: "/attendance", label: "My Attendance", icon: CalendarCheck, hint: "Check your attendance record" },
  { to: "/exams", label: "My Exams", icon: NotebookPen, hint: "See upcoming exam schedules" },
  { to: "/results", label: "My Results", icon: FileText, hint: "View marks and grades" },
  { to: "/timetable", label: "My Timetable", icon: CalendarClock, hint: "Your full weekly class schedule" },
  { to: "/payments", label: "My Payments", icon: Wallet, hint: "Tuition and fee payment history" },
];

const formatTime = (time) => {
  if (!time) return "—";
  const [hours, minutes] = String(time).split(":");
  if (!hours || !minutes) return time;
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${minutes} ${suffix}`;
};

function StudentDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [schedule, setSchedule] = useState([]);
  const [cgpaData, setCgpaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // A student only ever pulls their own timetable and their own
      // CGPA - both endpoints are ownership-checked on the backend too.
      const [timetableRes, cgpaRes] = await Promise.allSettled([
        api.get(`/timetable/student/${currentUser?.student_id}`),
        api.get(`/cgpa/${currentUser?.student_id}`),
      ]);

      if (timetableRes.status === "fulfilled") {
        setSchedule(timetableRes.value.data.data || []);
      } else {
        setFailed(true);
      }

      if (cgpaRes.status === "fulfilled") {
        setCgpaData(cgpaRes.value.data.data);
      }
    } catch (err) {
      console.error("Student Dashboard Error:", err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses = schedule
    .filter((entry) => entry.day === today)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

  return (
    <MainLayout>
      <PageHeader
        title={`Welcome, ${currentUser?.username || "Student"}`}
        subtitle="Your academic overview - today's classes, CGPA and quick access to your modules."
      />

      {loading ? (
        <Loader text="Loading your dashboard" />
      ) : (
        <>
          {/* CGPA summary tile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-line mb-14">
            <Link
              to="/cgpa"
              className="group relative bg-panel border-r border-b border-line px-6 py-7 transition-colors hover:bg-accent-soft"
            >
              <div className="flex items-start justify-between">
                <p className="label-mono">CGPA</p>
                <Award
                  size={16}
                  strokeWidth={1.7}
                  className="text-ink-mute group-hover:text-accent transition-colors"
                />
              </div>

              <p className="font-mono text-[2.75rem] leading-none tracking-tight text-ink mt-6">
                {cgpaData?.cgpa ?? "—"}
              </p>

              <span className="flex items-center gap-1 label-mono mt-5 text-ink-mute group-hover:text-accent transition-colors">
                View breakdown
                <ArrowUpRight size={12} strokeWidth={2} />
              </span>
            </Link>

            <div className="relative bg-panel border-r border-b border-line px-6 py-7">
              <p className="label-mono">Courses Completed</p>
              <p className="font-mono text-[2.75rem] leading-none tracking-tight text-ink mt-6">
                {cgpaData?.total_courses ?? "—"}
              </p>
            </div>

            <div className="relative bg-panel border-r border-b border-line px-6 py-7">
              <p className="label-mono">Total Credits</p>
              <p className="font-mono text-[2.75rem] leading-none tracking-tight text-ink mt-6">
                {cgpaData?.total_credits ?? "—"}
              </p>
            </div>

            <Link
              to="/timetable"
              className="group relative bg-panel border-r border-b border-line px-6 py-7 transition-colors hover:bg-accent-soft"
            >
              <div className="flex items-start justify-between">
                <p className="label-mono">Classes Today</p>
                <CalendarClock
                  size={16}
                  strokeWidth={1.7}
                  className="text-ink-mute group-hover:text-accent transition-colors"
                />
              </div>

              <p className="font-mono text-[2.75rem] leading-none tracking-tight text-ink mt-6">
                {String(todaysClasses.length).padStart(2, "0")}
              </p>

              <span className="flex items-center gap-1 label-mono mt-5 text-ink-mute group-hover:text-accent transition-colors">
                View schedule
                <ArrowUpRight size={12} strokeWidth={2} />
              </span>
            </Link>
          </div>

          {/* Today's classes */}
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="font-display font-bold text-lg text-ink tracking-tight">
                Today &middot; {today}
              </h2>
              <span className="h-px flex-1 bg-line" />
            </div>

            {failed ? (
              <p className="text-[0.8125rem] text-danger">
                Could not reach the server. Check that the backend is running on port 5000.
              </p>
            ) : todaysClasses.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No classes scheduled today"
                hint="Your timetable is clear for the day."
              />
            ) : (
              <div className="border border-line divide-y divide-line">
                {todaysClasses.map((entry) => (
                  <div
                    key={entry.timetable_id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-display font-bold text-[0.9375rem] text-ink tracking-tight">
                        {entry.course_name} ({entry.course_code})
                      </p>
                      <p className="flex items-center gap-1.5 text-[0.8125rem] text-ink-soft mt-1">
                        <MapPin size={13} strokeWidth={1.8} />
                        Room {entry.room_no} &middot; {entry.teacher_name}
                      </p>
                    </div>

                    <span className="flex items-center gap-1.5 label-mono text-ink-mute shrink-0">
                      <Clock size={13} strokeWidth={1.8} />
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Shortcuts */}
          <section className="mt-14">
            <div className="flex items-center gap-4 mb-5">
              <h2 className="font-display font-bold text-lg text-ink tracking-tight">
                Quick access
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
                    <span className="flex items-center gap-1.5 font-display font-bold text-[0.9375rem] text-ink tracking-tight">
                      {label}
                      <ArrowUpRight
                        size={13}
                        strokeWidth={2}
                        className="text-ink-mute group-hover:text-accent transition-colors"
                      />
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

export default StudentDashboard;