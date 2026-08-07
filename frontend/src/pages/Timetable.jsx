import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { CalendarClock, Search, Clock, MapPin } from "lucide-react";

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

function Timetable() {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      start_time: entry.start_time,
      end_time: entry.end_time,
    });
    setEditingId(entry.timetable_id);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.course_id || !formData.teacher_id || !formData.room_no) {
      alert("Course, teacher and room are required");
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
      alert(err.response?.data?.message || "Failed to save timetable entry");
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

  const filteredEntries = entries.filter((entry) => {
    const term = searchTerm.toLowerCase();
    return (
      entry.course_name.toLowerCase().includes(term) ||
      entry.teacher_name.toLowerCase().includes(term) ||
      entry.day.toLowerCase().includes(term)
    );
  });

  return (
    <MainLayout>
      <PageHeader
        title="Timetable"
        subtitle="Weekly class schedule across courses, teachers and rooms."
        actionLabel="Add Class"
        onAction={openCreateModal}
      />

      <div className="surface">
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-line">
          <div className="relative w-full sm:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-mute pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search course, teacher or day"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="control !pl-9"
            />
          </div>

          <p className="label-mono">
            {filteredEntries.length} of {entries.length} records
          </p>
        </div>

        {loading ? (
          <Loader text="Loading timetable" />
        ) : error ? (
          <p className="text-[0.8125rem] text-danger px-5 py-6">{error}</p>
        ) : filteredEntries.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={CalendarClock}
              title={
                entries.length === 0
                  ? "No classes scheduled yet"
                  : "No classes match your search"
              }
              hint={
                entries.length === 0
                  ? "Add the first class to build the schedule"
                  : "Try a different course, teacher or day"
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-paper border-b border-line">
                  <th className={TH}>Day</th>
                  <th className={TH}>Course</th>
                  <th className={TH}>Teacher</th>
                  <th className={TH}>Room</th>
                  <th className={TH}>Time</th>
                  <th className={`${TH} text-center`}>Action</th>
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

                    <td className="px-5 py-3.5">
                      <p className="text-[0.8125rem] font-semibold text-ink">
                        {entry.course_name}
                      </p>
                      <p className="label-mono mt-0.5">{entry.course_code}</p>
                    </td>

                    <td className={TD}>{entry.teacher_name}</td>

                    <td className={TD}>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-ink-mute" />
                        {entry.room_no}
                      </span>
                    </td>

                    <td className={`${TD} font-mono`}>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={13} className="text-ink-mute" />
                        {entry.start_time} – {entry.end_time}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <RowActions
                        onEdit={() => openEditModal(entry)}
                        onDelete={() => setDeletingId(entry.timetable_id)}
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
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name} ({c.course_code})
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
              {teachers.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>
                  {t.teacher_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Room No">
            <input
              type="text"
              name="room_no"
              placeholder="e.g. 402"
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
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
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