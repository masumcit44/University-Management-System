import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {

  const [stats, setStats] = useState({
    total_students: 0,
    total_teachers: 0,
    total_departments: 0,
    total_courses: 0,
  });

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data.data);
    } catch (error) {
      console.error("Dashboard Error:", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <MainLayout>

      <h1 className="text-4xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-blue-500 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg">Students</h2>
          <p className="text-4xl font-bold mt-3">
            {stats.total_students}
          </p>
        </div>

        <div className="bg-green-500 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg">Teachers</h2>
          <p className="text-4xl font-bold mt-3">
            {stats.total_teachers}
          </p>
        </div>

        <div className="bg-yellow-500 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg">Departments</h2>
          <p className="text-4xl font-bold mt-3">
            {stats.total_departments}
          </p>
        </div>

        <div className="bg-red-500 text-white rounded-xl p-6 shadow-lg">
          <h2 className="text-lg">Courses</h2>
          <p className="text-4xl font-bold mt-3">
            {stats.total_courses}
          </p>
        </div>

      </div>

    </MainLayout>
  );
}

export default Dashboard;