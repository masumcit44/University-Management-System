import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { AlertTriangle, UserPlus } from "lucide-react";
import { CONTROL_CLASS } from "../components/Field";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      setSuccess("Account created. You can log in now.");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night flex items-center justify-center px-6">
      <div className="surface max-w-sm w-full p-8">
        <div className="w-11 h-11 border border-line flex items-center justify-center mb-5">
          <UserPlus size={20} strokeWidth={1.8} className="text-ink" />
        </div>

        <h1 className="font-display font-bold text-xl text-ink tracking-tight">
          Create Account
        </h1>
        <p className="text-[0.8125rem] text-ink-soft mt-1 mb-6">
          Students and teachers must use the official email already on file
          with the university.
        </p>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 border border-danger bg-danger-soft px-4 py-3.5 mb-4"
          >
            <AlertTriangle
              size={15}
              strokeWidth={2}
              className="text-danger shrink-0 mt-0.5"
            />
            <p className="text-[0.8125rem] text-danger leading-relaxed">{error}</p>
          </div>
        )}

        {success && (
          <div className="border border-accent bg-accent-soft px-4 py-3.5 mb-4">
            <p className="text-[0.8125rem] text-accent leading-relaxed">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-mono">Full Name</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={`${CONTROL_CLASS} !mt-1`}
            />
          </div>

          <div>
            <label className="label-mono">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your official university email"
              className={`${CONTROL_CLASS} !mt-1`}
            />
          </div>

          <div>
            <label className="label-mono">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className={`${CONTROL_CLASS} !mt-1`}
            />
          </div>

          <div>
            <label className="label-mono">I am a</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`${CONTROL_CLASS} !mt-1`}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-solid w-full justify-center">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="label-mono text-center mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-ink underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;