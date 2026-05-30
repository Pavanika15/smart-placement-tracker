import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminNav from "../../components/AdminNav";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [filterBranch, setFilterBranch] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, [filterBranch, filterCourse, filterSection]);

  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    rollNumber: "",
    branch: "",
    cgpa: "",
    backlogs: "",
    course: "",
    section: "",
  });

  const fetchStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (filterBranch) params.branch = filterBranch;
      if (filterCourse) params.course = filterCourse;
      if (filterSection) params.section = filterSection;

      const res = await api.get("/students", { params });
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      rollNumber: student.rollNumber || "",
      branch: student.branch || "",
      cgpa: student.cgpa?.toString() || "",
      backlogs: student.backlogs?.toString() || "0",
      course: student.course || "",
      section: student.section || "",
    });
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm("Delete this student profile?")) {
      return;
    }

    try {
      await api.delete(`/students/${studentId}`);
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError("Failed to delete student.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await api.put(`/students/${editingStudent._id}`, {
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        cgpa: Number(formData.cgpa),
        backlogs: Number(formData.backlogs),
        course: formData.course,
        section: formData.section,
      });
      setEditingStudent(null);
      setFormData({ rollNumber: "", branch: "", cgpa: "", backlogs: "0", course: "", section: "" });
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError("Failed to update student.");
    }
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setFormData({ rollNumber: "", branch: "", cgpa: "", backlogs: "0", course: "", section: "" });
    setError("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AdminNav />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-gray-600 mt-1">Manage student profiles and placement eligibility data.</p>
        </div>
        <div className="flex gap-2 items-center">
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)} className="border p-2 rounded">
            <option value="">All Branches</option>
            <option value="CSE">CSE</option>
            <option value="CSE-AI">CSE-AI</option>
            <option value="AIML">AIML</option>
            <option value="CSE-DS">CSE-DS</option>
            <option value="IT">IT</option>
            <option value="ECE">ECE</option>
            <option value="EEE">EEE</option>
            <option value="MECH">MECH</option>
            <option value="CIVIL">CIVIL</option>
          </select>
          <input placeholder="Course" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="border p-2 rounded" />
          <input placeholder="Section" value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="border p-2 rounded" />
          <button onClick={() => { setFilterBranch(''); setFilterCourse(''); setFilterSection(''); }} className="border px-3 py-2 rounded">Clear Filters</button>
        </div>
        {editingStudent && (
          <button
            onClick={cancelEdit}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {editingStudent && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <label className="block">
              <span className="text-sm text-gray-700">Roll Number</span>
              <input
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Branch</span>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="">Select branch</option>
                <option value="CSE">CSE</option>
                <option value="CSE-AI">CSE-AI</option>
                <option value="AIML">AIML</option>
                <option value="CSE-DS">CSE-DS</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">CGPA</span>
              <input
                name="cgpa"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Course</span>
              <input
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Section</span>
              <input
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-700">Backlogs</span>
              <select
                name="backlogs"
                value={formData.backlogs}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">More than 2</option>
              </select>
            </label>
            <div className="md:col-span-4 flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Save Changes
              </button>
              <button type="button" onClick={cancelEdit} className="border border-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Branch</th>
              <th className="p-4 text-left">Course</th>
              <th className="p-4 text-left">Section</th>
              <th className="p-4 text-left">CGPA</th>
              <th className="p-4 text-left">Backlogs</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan="6">
                  Loading students...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="p-4 text-red-600" colSpan="6">
                  {error}
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td className="p-4" colSpan="6">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{student.user?.name || "-"}</td>
                  <td className="p-4">{student.user?.email || "-"}</td>
                  <td className="p-4">{student.branch || "-"}</td>
                  <td className="p-4">{student.course || "-"}</td>
                  <td className="p-4">{student.section || "-"}</td>
                  <td className="p-4">{student.cgpa ?? "-"}</td>
                  <td className="p-4">{student.backlogs ?? "-"}</td>
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
