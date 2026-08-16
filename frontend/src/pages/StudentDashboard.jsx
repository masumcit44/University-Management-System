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
  AlertTriangle,
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
          {/* Academic highlights - Classes Today leads: it answers "what happens now" */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-line mb-14">
            <Link
              to="/timetable"
              className="group stat-tile stat-tile-hover"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="kpi-caption">Classes Today</p>
                  <span className="badge badge-neutral px-1.5 py-0.5 mt-1.5">
                    01
                  </span>
                </div>
                <span className="w-8 h-8 shrink-0 flex items-center justify-center border border-line text-ink-mute group-hover:border-accent group-hover:text-accent transition-colors">
                  <CalendarClock size={15} strokeWidth={1.8} />
                </span>
              </div>

              <p className="kpi-value mt-6">
                {String(todaysClasses.length).padStart(2, "0")}
              </p>

              <span className="flex items-center gap-2 label-mono mt-5 text-ink-mute group-hover:text-accent transition-colors">
                <span className="w-1.5 h-1.5 bg-ok inline-block" />
                View schedule
                <ArrowUpRight size={12} strokeWidth={2} />
              </span>
            </Link>

            <Link
              to="/cgpa"
              className="group stat-tile stat-tile-hover"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="kpi-caption">CGPA</p>
                  <span className="badge badge-neutral px-1.5 py-0.5 mt-1.5">
                    02
                  </span>
                </div>
                <span className="w-8 h-8 shrink-0 flex items-center justify-center border border-line text-ink-mute group-hover:border-accent group-hover:text-accent transition-colors">
                  <Award size={15} strokeWidth={1.8} />
                </span>
              </div>

              <p className="kpi-value mt-6">
                {cgpaData?.cgpa ?? "—"}
              </p>

              <span className="flex items-center gap-2 label-mono mt-5 text-ink-mute group-hover:text-accent transition-colors">
                <span className="w-1.5 h-1.5 bg-ok inline-block" />
                View breakdown
                <ArrowUpRight size={12} strokeWidth={2} />
              </span>
            </Link>

            <div className="stat-tile">
              <div className="flex items-start justify-between">
                <div>
                  <p className="kpi-caption">Courses Completed</p>
                  <span className="badge badge-neutral px-1.5 py-0.5 mt-1.5">
                    03
                  </span>
                </div>
                <span className="w-8 h-8 shrink-0 flex items-center justify-center border border-line text-ink-mute">
                  <BookOpen size={15} strokeWidth={1.8} />
                </span>
              </div>

              <p className="kpi-value mt-6">
                {cgpaData?.total_courses ?? "—"}
              </p>
            </div>

            <div className="stat-tile">
              <div className="flex items-start justify-between">
                <div>
                  <p className="kpi-caption">Total Credits</p>
                  <span className="badge badge-neutral px-1.5 py-0.5 mt-1.5">
                    04
                  </span>
                </div>
                <span className="w-8 h-8 shrink-0 flex items-center justify-center border border-line text-ink-mute">
                  <NotebookPen size={15} strokeWidth={1.8} />
                </span>
              </div>

              <p className="kpi-value mt-6">
                {cgpaData?.total_credits ?? "—"}
              </p>
            </div>
          </div>

          {/* Today's classes */}
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="font-display font-bold text-lg text-ink tracking-tight">
                Today &middot; {today}
              </h2>
              <span className="h-px flex-1 bg-line" />
              {!failed && todaysClasses.length > 0 && (
                <span className="badge badge-neutral px-1.5 py-0.5">
                  {String(todaysClasses.length).padStart(2, "0")}
                </span>
              )}
            </div>

            {failed ? (
              <div
                role="alert"
                className="flex items-start gap-2.5 border border-danger border-l-4 bg-danger-soft pl-3 pr-3.5 py-3"
              >
                <AlertTriangle
                  size={15}
                  strokeWidth={2}
                  className="text-danger shrink-0 mt-px"
                />
                <p className="text-[0.8125rem] text-danger leading-relaxed">
                  Could not reach the server. Check that the backend is running on port 5000.
                </p>
              </div>
            ) : todaysClasses.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No classes scheduled today"
                hint="Your timetable is clear for the day."
              />
            ) : (
              <div className="border border-line divide-y divide-line">
                {todaysClasses.map((entry) => {
                  const [startTime, startMeridiem] = formatTime(entry.start_time).split(" ");
                  return (
                    <div
                      key={entry.timetable_id}
                      className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-paper"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="hidden sm:flex flex-col items-center justify-center w-14 shrink-0 border border-line bg-paper py-1.5">
                          <span className="font-mono text-[0.9375rem] font-medium text-ink leading-none">
                            {startTime}
                          </span>
                          <span className="label-mono text-ink-mute mt-1">
                            {startMeridiem}
                          </span>
                        </span>

                        <div className="min-w-0">
                          <p className="font-display font-bold text-[0.9375rem] text-ink tracking-tight flex items-center gap-2 flex-wrap">
                            {entry.course_name}
                            <span className="badge badge-neutral px-1.5 py-0.5">
                              {entry.course_code}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5 text-[0.8125rem] text-ink-soft mt-1.5">
                            <MapPin size={13} strokeWidth={1.8} />
                            Room {entry.room_no} &middot; {entry.teacher_name}
                          </p>
                        </div>
                      </div>

                      <span className="label-mono text-ink-mute shrink-0 hidden md:flex items-center gap-1.5">
                        <Clock size={13} strokeWidth={1.8} />
                        {formatTime(entry.start_time)} &ndash; {formatTime(entry.end_time)}
                      </span>
                    </div>
                  );
                })}
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
              <span className="badge badge-neutral px-1.5 py-0.5">
                {String(shortcuts.length).padStart(2, "0")}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-line border border-line">
              {shortcuts.map(({ to, label, icon: Icon, hint }) => (
                <Link
                  key={to}
                  to={to}
                  className="group bg-panel px-6 py-5 flex items-start gap-4 transition-all duration-150 hover:bg-paper hover:shadow-[3px_3px_0_0_rgba(11,11,11,0.06)]"
                >
                  <span className="w-9 h-9 shrink-0 flex items-center justify-center border border-line text-ink-mute transition-colors group-hover:bg-ink group-hover:border-ink group-hover:text-paper">
                    <Icon size={16} strokeWidth={1.8} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-[0.9375rem] text-ink tracking-tight">
                      {label}
                    </span>
                    <span className="block text-[0.8125rem] text-ink-soft mt-1 leading-relaxed">
                      {hint}
                    </span>
                  </span>

                  <ArrowUpRight
                    size={15}
                    strokeWidth={2}
                    className="self-center text-ink-mute opacity-0 -translate-x-1 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0"
                  />
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