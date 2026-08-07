import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Search, Award } from "lucide-react";

function Cgpa() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [cgpaData, setCgpaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckCgpa = async () => {
    if (!selectedStudentId) {
      alert("Please select a student");
      return;
    }

    setLoading(true);
    setCgpaData(null);
    setNotFound(false);

    try {
      const res = await api.get(`/cgpa/${selectedStudentId}`);
      setCgpaData(res.data.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        alert(err.response?.data?.message || "Failed to fetch CGPA");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">CGPA</h1>
        <p className="text-slate-500 mt-1">Check a student's cumulative GPA</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-xl">
        <label className="text-sm font-medium text-slate-600">Student</label>
        <div className="flex gap-3 mt-1">
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="border w-full rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s.student_id} value={s.student_id}>
                {s.student_name}
              </option>
            ))}
          </select>

          <button
            onClick={handleCheckCgpa}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            <Search size={18} />
            Check
          </button>
        </div>

        {loading && <p className="text-blue-600 mt-6">Calculating CGPA...</p>}

        {notFound && (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 mt-4">
            <Award size={40} className="mb-3" />
            <p className="font-medium">No results found for this student</p>
            <p className="text-sm">CGPA needs at least one result record</p>
          </div>
        )}

        {cgpaData && (
          <div className="mt-6 bg-slate-50 rounded-xl border border-slate-100 p-6 text-center">
            <p className="text-slate-500 text-sm mb-1">{cgpaData.student_name}</p>
            <p className="text-5xl font-bold text-blue-600">
              {Number(cgpaData.cgpa).toFixed(2)}
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Based on {cgpaData.total_courses} course
              {cgpaData.total_courses > 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Cgpa;