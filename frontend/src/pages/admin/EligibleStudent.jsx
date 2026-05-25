import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminNav from "../../components/AdminNav";

export default function EligibleStudents() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (!selectedCompanyId) {
      setStudents([]);
      return;
    }

    fetchEligibleStudents();
  }, [selectedCompanyId]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEligibleStudents = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/students/eligible/${selectedCompanyId}`);
      setStudents(res.data);
    } catch (error) {
      console.error(error);
      setError("Unable to fetch eligible students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AdminNav />

      <h1 className="text-3xl font-bold mb-6">Eligible Students</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Choose Company</label>
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="mt-2 block w-full rounded-md border-gray-300 bg-white p-2"
            >
              <option value="">Select a company</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.companyName} - {company.jobRole}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-gray-600">
              Choose a company to view students who meet the CGPA, branch, and backlogs requirements.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Branch</th>
              <th className="p-4 text-left">CGPA</th>
              <th className="p-4 text-left">Backlogs</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan="5">
                  Loading eligible students...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td className="p-4 text-red-600" colSpan="5">
                  {error}
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td className="p-4 text-gray-500" colSpan="5">
                  {selectedCompanyId
                    ? "No eligible students found for this company."
                    : "Select a company to view eligible students."}
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="border-t">
                  <td className="p-4">{student.user?.name || "-"}</td>
                  <td className="p-4">{student.user?.email || "-"}</td>
                  <td className="p-4">{student.branch || "-"}</td>
                  <td className="p-4">{student.cgpa ?? "-"}</td>
                  <td className="p-4">{student.backlogs ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
