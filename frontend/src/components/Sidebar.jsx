import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen">

      <div className="text-center text-2xl font-bold py-6 border-b border-slate-700">
        UMS
      </div>

      <nav className="flex flex-col p-4 gap-4">

        <Link
          to="/dashboard"
          className="hover:bg-slate-700 p-2 rounded"
        >
          Dashboard
        </Link>

        <Link
          to="/students"
          className="hover:bg-slate-700 p-2 rounded"
        >
          Students
        </Link>

        <Link
          to="/teachers"
          className="hover:bg-slate-700 p-2 rounded"
        >
          Teachers
        </Link>

        <Link
          to="/departments"
          className="hover:bg-slate-700 p-2 rounded"
        >
          Departments
        </Link>

        <Link
          to="/courses"
          className="hover:bg-slate-700 p-2 rounded"
        >
          Courses
        </Link>

      </nav>

    </div>
  );
}

export default Sidebar;