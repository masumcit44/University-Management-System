import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CalendarCheck,
  FileText,
  NotebookPen,
  CalendarClock,
  ClipboardList,
  ArrowUpRight,
  Clock,
  MapPin,
} from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

const DAY_ORDER = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const shortcuts = [
  { to: "/students", label: "Students", icon: Users, hint: "View student records" },
  { to: "/courses", label: "Courses", icon: BookOpen, hint: "Browse assigned courses" },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, hint: "Mark daily class attendance" },
  { to: "/exams", label: "Exams", icon: NotebookPen, hint: "Manage exam schedules" },
  { to: "/results", label: "Results", icon: FileText, hint: "Enter marks and publish grades" },
  { to: "/timetable", label: "My Timetable", icon: CalendarClock, hint: "See your full weekly schedule" },
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

function TeacherDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchSchedule();
    fetchStats();
  }, []);

  const fetchSchedule = async () => {
    try {
      // Teacher can only ever pull their own schedule - backend enforces
      // this too (roleMiddleware + ownership check in the controller).
      const res = await api.get(`/timetable/teacher/${currentUser?.teacher_id}`);
      setSchedule(res.data.data || []);
      setFailed(false);
    } catch (err) {
      console.error("Teacher Dashboard Error:", err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  // Scoped stats - backend only returns this teacher's assigned courses,
  // pending approvals and enrolled students
  const fetchStats = async () => {
    try {
      const [courseRes, enrollRes] = await Promise.all([
        api.get("/teacher-courses/my"),
        api.get("/enrollments"),
      ]);
      setCourses(courseRes.data.data || []);
      setEnrollments(enrollRes.data.data || []);
    } catch (err) {
      console.error("Teacher Dashboard Stats Error:", err);
    }
  };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses = schedule
    .filter((entry) => entry.day === today)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

  const pendingReviews = enrollments.filter((e) => e.status === "pending").length;
  const enrolledStudents = enrollments.filter((e) => e.status === "approved").length;

  const statTiles = [
    {
      key: "pending",
      label: "Pending Reviews",
      icon: ClipboardList,
      to: "/enrollment",
      value: pendingReviews,
      index: "01",
    },
    {
      key: "today",
      label: "Today's Classes",
      icon: CalendarClock,
      to: "/timetable",
      value: todaysClasses.length,
      index: "02",
    },
    {
      key: "courses",
      label: "Assigned Courses",
      icon: BookOpen,
      to: "/courses",
      value: courses.length,
      index: "03",
    },
    {
      key: "students",
      label: "Enrolled Students",
      icon: Users,
      to: "/enrollment",
      value: enrolledStudents,
      index: "04",
    },
  ];

  return (
    <MainLayout>
      <PageHeader
        title={`Welcome, ${currentUser?.username || "Teacher"}`}
        subtitle="Your teaching overview - today's classes and quick access to your modules."
      />

      {loading ? (
        <Loader text="Loading your schedule" />
      ) : (
        <>
          {/* Stat ledger - all figures scoped to this teacher's courses */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l border-line mb-10">
            {statTiles.map(({ key, label, icon: Icon, to, value, index }) => (
              <Link
                key={key}
                to={to}
                className={`group stat-tile ${
                  key === "pending" && value > 0
                    ? "bg-danger-soft stat-tile-hover"
                    : "stat-tile-hover"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="kpi-caption">{label}</p>
                    <p
                      className={`kpi-value mt-3.5 ${
                        key === "pending" && value > 0 ? "text-danger" : ""
                      }`}
                    >
                      {String(value).padStart(2, "0")}
                    </p>
                  </div>
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className={`${
                      key === "pending" && value > 0
                        ? "text-danger"
                        : "text-ink-mute group-hover:text-accent"
                    } transition-colors`}
                  />
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-line">
                  <span className="index-mark">{index}</span>
                  {key === "pending" && value > 0 ? (
                    <span className="badge badge-warn px-1.5 py-0.5">
                      Needs review
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 label-mono text-ink-mute transition-colors group-hover:text-accent">
                      Open
                      <ArrowUpRight size={12} strokeWidth={2.2} />
                    </span>
                  )}
                </div>
              </Link>
            ))}
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
                            Room {entry.room_no}
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

export default TeacherDashboard;