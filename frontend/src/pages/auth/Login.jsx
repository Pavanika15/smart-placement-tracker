import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../services/authService";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(formData);
      login(res.data);

      if (res.data.user.role === "admin") {
        navigate("/admin/AdminDashboard");
      } else {
        try {
          await api.get("/students/me");
          navigate("/student/StudentDashboard");
        } catch (error) {
          if (error.response?.status === 404) {
            navigate("/student/profile");
          } else {
            setError(error.response?.data?.message || "Login failed");
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 max-w-sm w-full rounded-lg shadow-lg"
      >
        <p className="text-2xl font-semibold text-center text-black mb-4">
          Sign in to your account
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="relative mb-4">
          <input
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-4 pr-12 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            📧
          </span>
        </div>

        <div className="relative mb-4">
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-4 pr-12 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
            🔒
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg uppercase transition"
        >
          Sign In
        </button>

        <p className="text-gray-500 text-sm text-center mt-4">
          No account?{" "}
          <Link
            to="/register"
            className="underline text-indigo-600 font-medium"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;