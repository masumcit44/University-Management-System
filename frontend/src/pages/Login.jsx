import LoginForm from "../components/LoginForm";

const modules = [
  "Students",
  "Teachers",
  "Departments",
  "Courses",
  "Enrollment",
  "Attendance",
  "Examinations",
  "Results & CGPA",
  "Payments",
  "Timetable",
  "Risk Prediction",
  "AI Assistant",
];

function Login() {
  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-[1.1fr_1fr]">

      {/* Left - typographic masthead */}
      <div className="hidden lg:flex flex-col justify-between bg-night text-white px-12 py-14 xl:px-16 relative overflow-hidden">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 flex items-center justify-center bg-paper text-ink font-display font-extrabold text-sm">
            EU
          </span>
          <span className="label-mono text-white/40">
            Established 2002 &middot; Dhaka, Bangladesh
          </span>
        </div>

        {/* Statement */}
        <div className="max-w-xl">
          <p className="label-mono text-white/40 mb-6">
            Database Management System Laboratory
          </p>

          <h1 className="font-serif font-bold text-[3.5rem] xl:text-[4.25rem] leading-[1.02] tracking-[-0.01em] text-white">
            University
            <br />
            Management
            <br />
            <span className="text-white/40">System</span>
          </h1>

          <div className="flex mt-9">
            <span className="h-[2px] w-20 bg-white" />
            <span className="h-[2px] flex-1 bg-white/15" />
          </div>

          <p className="text-[0.9375rem] text-white/55 mt-8 leading-relaxed max-w-md">
            A single record of every student, course, examination and payment at
            Eastern University — built on MySQL, served over a REST API.
          </p>
        </div>

        {/* Module index */}
        <div className="border-t border-white/10 pt-7">
          <p className="label-mono text-white/30 mb-4">Modules</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 max-w-2xl">
            {modules.map((name, i) => (
              <span
                key={name}
                className="label-mono text-white/45 flex items-baseline gap-2"
              >
                <span className="text-white/20">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {name}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Right - sign in */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <LoginForm />
      </div>

    </div>
  );
}

export default Login;