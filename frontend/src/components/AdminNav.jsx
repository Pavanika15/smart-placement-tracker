import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin/AdminDashboard", label: "Dashboard" },
  { to: "/admin/companies", label: "Companies" },
  { to: "/admin/students", label: "Students" },
  { to: "/admin/eligible-students", label: "Eligible Students" },
  { to: "/admin/applications", label: "Applications" },
];

export default function AdminNav() {
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
