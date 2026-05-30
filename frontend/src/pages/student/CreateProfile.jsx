import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import StudentNav from "../../components/StudentNav";

export default function CreateProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    rollNumber: "",
    branch: "",
    cgpa: "",
    backlogs: 0,
    course: "",
    section: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/students/me");
        setFormData({
          rollNumber: res.data.rollNumber || "",
          branch: res.data.branch || "",
          cgpa: res.data.cgpa ?? "",
          backlogs: res.data.backlogs ?? 0,
          course: res.data.course || "",
          section: res.data.section || "",
        });
        setProfileExists(true);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || "Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const value = e.target.name === "backlogs" ? Number(e.target.value) : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (profileExists) {
        await api.put("/students/me", {
          ...formData,
          cgpa: Number(formData.cgpa),
          backlogs: Number(formData.backlogs),
        });
        alert("Profile updated successfully!");
      } else {
        await api.post("/students", {
          ...formData,
          cgpa: Number(formData.cgpa),
          backlogs: Number(formData.backlogs),
        });
        alert("Profile created successfully!");
        setProfileExists(true);
      }

      navigate("/student/StudentDashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to save profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md p-8 text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <StudentNav />

      <div className="flex justify-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg"
        >
          <h1 className="text-3xl font-bold mb-6 text-center">
            {profileExists ? "Edit Student Profile" : "Create Student Profile"}
          </h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
          )}

          <input
            type="text"
            name="rollNumber"
            placeholder="Roll Number"
            value={formData.rollNumber}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4"
            required
          />

          <select
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4"
            required
          >
            <option value="">Select Branch</option>
            <option value="CSE">CSE</option>
            <option value="CSE-AI">CSE-AI</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>

          <input
            type="number"
            step="0.1"
            name="cgpa"
            placeholder="CGPA"
            value={formData.cgpa}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4"
            required
          />

          <input
            type="text"
            name="course"
            placeholder="Course (e.g. B.Tech)"
            value={formData.course}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4"
          />

          <input
            type="text"
            name="section"
            placeholder="Section (e.g. A)"
            value={formData.section}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-4"
          />

          <select
            name="backlogs"
            value={formData.backlogs}
            onChange={handleChange}
            className="w-full border p-3 rounded mb-6"
            required
          >
            <option value="0">0 Backlogs</option>
            <option value="1">1 Backlog</option>
            <option value="2">2 Backlogs</option>
            <option value="3">More than 2</option>
          </select>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg">
            {profileExists ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
