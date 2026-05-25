import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentNav from "../../components/StudentNav";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/student`);
      setApplications(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <StudentNav />
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">
                Company
              </th>

              <th className="p-4 text-left">
                Role
              </th>

              <th className="p-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="3">
                  Loading your applications...
                </td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td className="p-4 text-center text-gray-500" colSpan="3">
                  You have not applied to any companies yet.
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app._id} className="border-t">
                  <td className="p-4">{app.company.companyName}</td>
                  <td className="p-4">{app.company.jobRole}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {app.status}
                    </span>
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