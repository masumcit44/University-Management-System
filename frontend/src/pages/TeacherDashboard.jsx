import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  CalendarCheck,
  FileText,
  NotebookPen,
  CalendarClock,
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
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchSchedule();
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

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todaysClasses = schedule
    .filter((entry) => entry.day === today)
    .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)));

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
                        Room {entry.room_no}
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

export default TeacherDashboard;