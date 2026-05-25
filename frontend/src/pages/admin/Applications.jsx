import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminNav from "../../components/AdminNav";

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [statusSelections, setStatusSelections] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setError("");
    try {
      const res = await api.get("/applications/all");
      setApplications(res.data);
      setStatusSelections(
        Object.fromEntries(res.data.map((app) => [app._id, app.status]))
      );
    } catch (error) {
      console.error(error);
      setError("Failed to load applications.");
    }
  };

  const updateStatus = async (id) => {
    const status = statusSelections[id];
    if (!status) return;

    try {
      await api.put(`/applications/${id}/status`, { status });
      fetchApplications();
    } catch (error) {
      console.error(error);
      setError("Unable to update application status.");
    }
  };

  const handleStatusChange = (id, value) => {
    setStatusSelections((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AdminNav />

      <h1 className="text-3xl font-bold mb-6">Applications Tracking</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <p className="text-gray-600">Review all student applications and update statuses for each drive.</p>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Student</th>
              <th className="p-4">Company</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update</th>
            </tr>
          </thead>

          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="4">
                  No applications found.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id} className="border-t">
                  <td className="p-4">{app.student?.user?.name || "Unknown"}</td>
                  <td className="p-4">{app.company?.companyName || "Unknown"}</td>
                  <td className="p-4">{app.status}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <select
                        value={statusSelections[app._id] || app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="border p-2 rounded"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Round 1 Cleared">Round 1 Cleared</option>
                        <option value="Round 2 Cleared">Round 2 Cleared</option>
                        <option value="HR Round Cleared">HR Round Cleared</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => updateStatus(app._id)}
                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
}
