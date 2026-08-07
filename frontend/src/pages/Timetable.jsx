import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Pencil, Trash2, CalendarClock, Clock, MapPin } from "lucide-react";

const DAY_STYLES = {
  Saturday: "bg-violet-100 text-violet-700",
  Sunday: "bg-sky-100 text-sky-700",
  Monday: "bg-emerald-100 text-emerald-700",
  Tuesday: "bg-amber-100 text-amber-700",
  Wednesday: "bg-rose-100 text-rose-700",
  Thursday: "bg-indigo-100 text-indigo-700",
  Friday: "bg-slate-200 text-slate-600",
};

const DAYS = Object.keys(DAY_STYLES);

function Timetable() {
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    course_id: "",
    teacher_id: "",
    room_no: "",
    day: "Saturday",
    start_time: "",
    end_time: "",
  });

  useEffect(() => {
    fetchTimetable();
    fetchCourses();
    fetchTeachers();
  }, []);

  const fetchTimetable = async () => {
    try {
      const res = await api.get("/timetable");
      setEntries(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load timetable");
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      course_id: "",
      teacher_id: "",
      room_no: "",
      day: "Saturday",
      start_time: "",
      end_time: "",
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
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
    try {
      if (editingId) {
        await api.put(`/timetable/${editingId}`, formData);
        alert("Timetable Entry Updated Successfully");
      } else {
        await api.post("/timetable", formData);
        alert("Timetable Entry Created Successfully");
      }

      setShowModal(false);
      resetForm();
      fetchTimetable();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to save timetable entry");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this timetable entry?")) return;

    try {
      await api.delete(`/timetable/${id}`);
      fetchTimetable();
    } catch (err) {
      console.error(err);
      alert("Failed to delete timetable entry");
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Timetable</h1>
          <p className="text-slate-500 mt-1">
            Weekly class schedule across courses and teachers
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Add Class
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="text-blue-600 p-6">Loading timetable...</p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <CalendarClock size={40} className="mb-3" />
            <p className="font-medium">No classes scheduled yet</p>
            <p className="text-sm">Add the first class to build the schedule</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Day</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Course</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Teacher</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Room</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-500">Time</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-500">Action</th>
              </tr>
            </thead>

            <tbody>
              {entries.map((entry) => (
                <tr
                  key={entry.timetable_id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        DAY_STYLES[entry.day] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {entry.day}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-slate-800">{entry.course_name}</p>
                    <p className="text-xs text-slate-400">{entry.course_code}</p>
                  </td>
                  <td className="p-4 text-slate-600">{entry.teacher_name}</td>
                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-400" />
                      {entry.room_no}
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      {entry.start_time} - {entry.end_time}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEditModal(entry)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.timetable_id)}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h2 className="text-2xl font-bold mb-5 text-slate-800">
              {editingId ? "Edit Class" : "Add Class"}
            </h2>

            <label className="text-sm font-medium text-slate-600">Course</label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_name} ({c.course_code})
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-slate-600">Teacher</label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>
                  {t.teacher_name}
                </option>
              ))}
            </select>

            <label className="text-sm font-medium text-slate-600">Room No</label>
            <input
              type="text"
              name="room_no"
              placeholder="e.g. 402"
              value={formData.room_no}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="text-sm font-medium text-slate-600">Day</label>
            <select
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="border w-full rounded-lg p-2.5 mt-1 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div className="flex gap-3 mb-5">
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-600">Start Time</label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="border w-full rounded-lg p-2.5 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-slate-600">End Time</label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="border w-full rounded-lg p-2.5 mt-1 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Timetable;