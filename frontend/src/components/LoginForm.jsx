import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import api from "../services/api";

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Login Successful!");

      navigate("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message || "Login Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10"
    >
      <h2 className="text-3xl font-bold text-slate-800 text-center">
        Welcome Back 👋
      </h2>

      <p className="text-gray-500 text-center mt-2 mb-8">
        Sign in to your account
      </p>

      <div className="mb-5">
        <label className="text-gray-700 font-medium">
          Email
        </label>

        <div className="flex items-center border rounded-xl mt-2 px-3 py-3">
          <Mail className="text-gray-400 mr-2" size={20} />

          <input
            type="email"
            placeholder="Enter your email"
            className="w-full outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="text-gray-700 font-medium">
          Password
        </label>

        <div className="flex items-center border rounded-xl mt-2 px-3 py-3">
          <Lock className="text-gray-400 mr-2" size={20} />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="w-full outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
          >
            {showPassword ? (
              <EyeOff
                className="text-gray-400"
                size={20}
              />
            ) : (
              <Eye
                className="text-gray-400"
                size={20}
              />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold disabled:bg-blue-400"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}

export default LoginForm;