import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/student/StudentDashboard", label: "Dashboard" },
  { to: "/student/drives", label: "Available Drives" },
  { to: "/student/applications", label: "My Applications" },
  { to: "/student/profile", label: "My Profile" },
];

export default function StudentNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-2 items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}
