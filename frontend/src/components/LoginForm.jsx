import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";
import api from "../services/api";

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Enter both your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      // Route each role to its own dashboard - reuses the same JWT/login
      // response, just reads the role that came back with it
      const roleHomeRoutes = {
        admin: "/dashboard",
        teacher: "/teacher-dashboard",
        student: "/student-dashboard",
      };

      navigate(roleHomeRoutes[response.data.user.role] || "/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Login failed. Check your credentials and make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="w-full max-w-sm">

      {/* Mobile brand - the left panel is hidden below lg */}
      <div className="flex items-center gap-3 mb-10 lg:hidden">
        <span className="w-9 h-9 flex items-center justify-center bg-ink text-paper font-display font-extrabold text-sm">
          EU
        </span>
        <span className="label-mono">Eastern University</span>
      </div>

      <p className="label-mono">Authentication</p>

      <h2 className="font-display font-extrabold text-[2.25rem] leading-none tracking-[-0.03em] text-ink mt-3">
        Sign in
      </h2>

      <p className="text-[0.875rem] text-ink-soft mt-3 leading-relaxed">
        Use the account issued to you by the university registrar.
      </p>

      <div className="flex mt-7 mb-8">
        <span className="h-[2px] w-16 bg-ink" />
        <span className="h-[2px] flex-1 bg-line" />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-danger border-l-4 bg-danger-soft pl-3 pr-3.5 py-3 mb-6"
        >
          <AlertTriangle
            size={15}
            strokeWidth={2}
            className="text-danger shrink-0 mt-px"
          />
          <p className="text-[0.8125rem] text-danger leading-relaxed">
            {error}
          </p>
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="email" className="label-mono block mb-2">
          Email
        </label>

        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@easternuni.edu.bd"
          className={`control ${error ? "!border-danger" : ""}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-8">
        <label htmlFor="password" className="label-mono block mb-2">
          Password
        </label>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className={`control !pr-11 ${error ? "!border-danger" : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-ink-mute hover:text-ink transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-solid btn-pushable w-full justify-center !py-3.5 disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:!bg-ink disabled:hover:!border-ink"
      >
        {loading ? "Signing in" : "Sign in"}
        {!loading && <ArrowRight size={15} strokeWidth={2.5} />}
      </button>

      <p className="label-mono mt-8 text-center">
        Eastern University &middot; DBMS Laboratory
      </p>

    </form>
  );
}

export default LoginForm;