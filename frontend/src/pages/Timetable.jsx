import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import {
  BookOpen,
  CalendarClock,
  CalendarDays,
  Clock,
  MapPin,
  Search,
  UserRound,
} from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import RowActions from "../components/RowActions";
import Field, { CONTROL_CLASS } from "../components/Field";

const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const EMPTY_FORM = {
  course_id: "",
  teacher_id: "",
  room_no: "",
  day: "Saturday",
  start_time: "",
  end_time: "",
};

const TH = "text-left px-5 py-3 label-mono whitespace-nowrap";
const TD = "px-5 py-3.5 text-[0.8125rem] text-ink-soft whitespace-nowrap";

const formatTime = (time) => {
  if (!time) return "—";

  const [hours, minutes] = String(time).split(":");

  if (!hours || !minutes) {
    return time;
  }

  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${String(displayHour).padStart(2, "0")}:${minutes} ${suffix}`;
};

const getDuration = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return "Time not specified";
  }

  const toMinutes = (time) => {
    const [hours, minutes] = String(time)
      .split(":")
      .map(Number);

    return hours * 60 + minutes;
  };

  const duration = toMinutes(endTime) - toMinutes(startTime);

  if (!Number.isFinite(duration) || duration <= 0) {
    return "Scheduled class";
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  return `${hours ? `${hours} hr${hours > 1 ? "s" : ""}` : ""}${
    hours && minutes ? " " : ""
  }${minutes ? `${minutes} min` : ""}`;
};

const toTimeInputValue = (time) => {
  return time ? String(time).slice(0, 5) : "";
};

function Timetable() {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchTimetable();
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchTimetable = async () => {
    try {
      setError("");

      const res = await api.get("/timetable");
      setEntries(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses");
      setCourses(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const openCreateModal = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setFormData({
      course_id: entry.course_id,
      teacher_id: entry.teacher_id,
      room_no: entry.room_no,
      day: entry.day,
      start_time: toTimeInputValue(entry.start_time),
      end_time: toTimeInputValue(entry.end_time),
    });

    setEditingId(entry.timetable_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !formData.course_id ||
      !formData.teacher_id ||
      !formData.room_no ||
      !formData.day ||
      !formData.start_time ||
      !formData.end_time
    ) {
      alert("All timetable fields are required");
      return;
    }

    try {
      if (editingId) {
        await api.put(`/timetable/${editingId}`, formData);
      } else {
        await api.post("/timetable", formData);
      }

      setShowModal(false);
      setEditingId(null);
      setFormData(EMPTY_FORM);

      fetchTimetable();
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Failed to save timetable entry"
      );
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/timetable/${deletingId}`);

      setDeletingId(null);
      fetchTimetable();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete entry");
    }
  };

  const selectedCourse = courses.find(
    (course) =>
      String(course.course_id) === String(selectedCourseId)
  );

  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.trim().toLowerCase();

    const matchesCourse =
      !selectedCourseId ||
      String(entry.course_id) === String(selectedCourseId);

    return (
      matchesCourse &&
      (String(entry.course_name ?? "")
        .toLowerCase()
        .includes(term) ||
        String(entry.course_code ?? "")
          .toLowerCase()
          .includes(term) ||
        String(entry.teacher_name ?? "")
          .toLowerCase()
          .includes(term) ||
        String(entry.day ?? "")
          .toLowerCase()
          .includes(term) ||
        String(entry.room_no ?? "")
          .toLowerCase()
          .includes(term))
    );
  });

  const getEmptyStateTitle = () => {
    if (entries.length === 0) {
      return "No classes scheduled yet";
    }

    if (selectedCourse) {
      return "No classes scheduled for this course";
    }

    return "No classes match your search";
  };

  const getEmptyStateHint = () => {
    if (entries.length === 0) {
      return "Add the first class to build the schedule";
    }

    if (selectedCourse) {
      return "Add a class for this course to build its weekly schedule";
    }

    return "Try a different course, teacher or day";
  };

  return (
    <MainLayout>
      <PageHeader
        title="Timetable"
        subtitle="Weekly class schedule across courses, teachers and rooms."
        actionLabel="Add Class"
        onAction={openCreateModal}
      />

      <div className="surface p-5 mb-6">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
          <div>
            <p className="label-mono">Schedule finder</p>

            <h2 className="text-xl font-semibold text-ink mt-1">
              Find classes by course
            </h2>

            <p className="text-sm text-ink-soft mt-2 max-w-xl">
              Select a course to see every day it meets, along with the class
              time, teacher, room and duration.
            </p>
          </div>

          <div className="w-full xl:w-[25rem]">
            <label
              className="label-mono block"
              htmlFor="timetable-course"
            >
              Course
            </label>

            <select
              id="timetable-course"
              value={selectedCourseId}
              onChange={(event) => {
                setSelectedCourseId(event.target.value);
                setSearchTerm("");
              }}
              className="control mt-1.5"
            >
              <option value="">All courses</option>

              {courses.map((course) => (
                <option
                  key={course.course_id}
                  value={course.course_id}
                >
                  {course.course_name} ({course.course_code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedCourse ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-line">
            <div className="border border-line p-3">
              <p className="label-mono">Course</p>

              <p className="text-sm font-semibold text-ink mt-1">
                {selectedCourse.course_name}
              </p>
            </div>

            <div className="border border-line p-3">
              <p className="label-mono">Code</p>

              <p className="text-sm font-semibold text-ink mt-1">
                {selectedCourse.course_code || "—"}
              </p>
            </div>

            <div className="border border-line p-3">
              <p className="label-mono">Credit</p>

              <p className="text-sm font-semibold text-ink mt-1">
                {selectedCourse.credit ?? "—"}
              </p>
            </div>

            <div className="border border-line p-3">
              <p className="label-mono">Semester</p>

              <p className="text-sm font-semibold text-ink mt-1">
                {selectedCourse.semester ?? "—"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 mt-5 pt-5 border-t border-line text-sm text-ink-soft">
            <CalendarDays
              size={17}
              className="text-ink-mute mt-0.5 shrink-0"
            />

            <p>
              Showing all scheduled classes. Choose a course above to narrow
              this table to one weekly schedule.
            </p>
          </div>
        )}
      </div>

      <div className="surface">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
            />

            <input
              type="text"
              placeholder="Search this schedule"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="control !pl-9"
            />
          </div>

          <p className="label-mono">
            {filteredEntries.length}{" "}
            {selectedCourse
              ? "class times"
              : `of ${entries.length} records`}
          </p>
        </div>

        {loading ? (
          <Loader text="Loading timetable" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">
            {error}
          </p>
        ) : filteredEntries.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={CalendarClock}
              title={getEmptyStateTitle()}
              hint={getEmptyStateHint()}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper border-b border-line">
                  <th className={TH}>Day</th>

                  {!selectedCourse && (
                    <th className={TH}>Course</th>
                  )}

                  <th className={TH}>Time</th>
                  <th className={TH}>Teacher</th>
                  <th className={TH}>Room</th>
                  <th className={TH}>Class details</th>
                  <th className={`${TH} text-center`}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.timetable_id}
                    className="border-b border-line last:border-b-0 hover:bg-paper transition-colors"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span className="inline-block border border-line px-2 py-1 label-mono text-ink-soft">
                        {entry.day}
                      </span>
                    </td>

                    {!selectedCourse && (
                      <td className="px-5 py-3.5">
                        <div className="inline-flex items-start gap-2">
                          <BookOpen
                            size={14}
                            className="text-ink-mute mt-0.5 shrink-0"
                          />

                          <div>
                            <p className="text-[0.8125rem] font-semibold text-ink">
                              {entry.course_name}
                            </p>

                            <p className="label-mono mt-0.5">
                              {entry.course_code}
                            </p>
                          </div>
                        </div>
                      </td>
                    )}

                    <td className={`${TD} font-mono`}>
                      <span className="inline-flex items-center gap-1.5 text-ink">
                        <Clock
                          size={13}
                          className="text-ink-mute"
                        />

                        {formatTime(entry.start_time)} –{" "}
                        {formatTime(entry.end_time)}
                      </span>
                    </td>

                    <td className={TD}>
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound
                          size={13}
                          className="text-ink-mute"
                        />

                        {entry.teacher_name || "Not assigned"}
                      </span>
                    </td>

                    <td className={TD}>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin
                          size={13}
                          className="text-ink-mute"
                        />

                        {entry.room_no || "Not assigned"}
                      </span>
                    </td>

                    <td className={TD}>
                      <span className="text-ink">
                        {getDuration(
                          entry.start_time,
                          entry.end_time
                        )}
                      </span>

                      <span className="block label-mono mt-0.5">
                        Weekly class
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <RowActions
                        onEdit={() => openEditModal(entry)}
                        onDelete={() =>
                          setDeletingId(entry.timetable_id)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title={editingId ? "Edit Class" : "Add Class"}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saveLabel={editingId ? "Update" : "Save"}
        >
          <Field label="Course">
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Course</option>

              {courses.map((course) => (
                <option
                  key={course.course_id}
                  value={course.course_id}
                >
                  {course.course_name} ({course.course_code})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Teacher">
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              <option value="">Select Teacher</option>

              {teachers.map((teacher) => (
                <option
                  key={teacher.teacher_id}
                  value={teacher.teacher_id}
                >
                  {teacher.teacher_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Room No">
            <input
              type="text"
              name="room_no"
              placeholder="e.g. AB4-301"
              value={formData.room_no}
              onChange={handleChange}
              className={CONTROL_CLASS}
            />
          </Field>

          <Field label="Day">
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className={CONTROL_CLASS}
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time">
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>

            <Field label="End Time">
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={CONTROL_CLASS}
              />
            </Field>
          </div>
        </Modal>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Delete Class"
          message="Are you sure you want to remove this class from the schedule?"
          onCancel={() => setDeletingId(null)}
          onConfirm={handleDelete}
        />
      )}
    </MainLayout>
  );
}

export default Timetable;