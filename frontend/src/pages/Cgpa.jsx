import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Search, Award } from "lucide-react";

import PageHeader from "../components/PageHeader";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

const SCALE_MAX = 4;

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

  // Position of the CGPA on the 0.00 - 4.00 ruler, clamped to the track.
  const cgpaValue = cgpaData ? Number(cgpaData.cgpa) : 0;
  const markerLeft = Math.min(100, Math.max(0, (cgpaValue / SCALE_MAX) * 100));

  return (
    <MainLayout>
      <PageHeader
        title="CGPA"
        subtitle="Cumulative grade point average, computed from a student's final exam results."
      />

      <div className="grid lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] gap-8 items-start">
        {/* Query panel */}
        <div className="surface p-6">
          <label className="label-mono block" htmlFor="cgpa-student">
            Student
          </label>

          <select
            id="cgpa-student"
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="control mt-1.5"
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
            className="btn-solid w-full mt-4 justify-center inline-flex items-center gap-2"
          >
            <Search size={15} />
            Calculate
          </button>

          <p className="text-xs text-ink-mute mt-4 border-l-2 border-line pl-3">
            Only results linked to a <span className="text-ink">Final</span> exam
            contribute to the average.
          </p>
        </div>

        {/* Readout panel */}
        <div className="surface min-h-[16rem] flex flex-col justify-center">
          {loading ? (
            <Loader text="Calculating CGPA" />
          ) : notFound ? (
            <div className="p-5">
              <EmptyState
                icon={Award}
                title="No results found for this student"
                hint="CGPA needs at least one recorded result"
              />
            </div>
          ) : cgpaData ? (
            <div className="p-8">
              <p className="label-mono">Cumulative grade point average</p>

              <p className="text-2xl font-semibold text-ink mt-1">
                {cgpaData.student_name}
              </p>

              <div className="flex items-end gap-4 mt-8">
                <span className="font-display text-[5.5rem] leading-[0.85] tracking-tight text-ink tabular-nums">
                  {cgpaValue.toFixed(2)}
                </span>

                <span className="label-mono pb-3">out of 4.00</span>
              </div>

              {/* Ruler */}
              <div className="mt-8">
                <div className="relative h-8 border-t border-line">
                  <span
                    className="absolute top-0 h-8 w-[2px] bg-ink"
                    style={{ left: `${markerLeft}%` }}
                  />
                </div>

                <div className="flex justify-between label-mono">
                  <span>0.00</span>
                  <span>2.00</span>
                  <span>4.00</span>
                </div>
              </div>

              <p className="label-mono mt-8 pt-5 border-t border-line">
                Based on {cgpaData.total_courses} course
                {cgpaData.total_courses > 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <div className="p-8">
              <p className="label-mono">Awaiting selection</p>
              <p className="text-sm text-ink-soft mt-2 max-w-sm">
                Pick a student on the left and press Calculate to read their
                cumulative grade point average.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default Cgpa;