import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import StudentNav from "../../components/StudentNav";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, companiesRes, appsRes] = await Promise.all([
          api.get("/students/me"),
          api.get("/companies"),
          api.get("/applications/student"),
        ]);

        setStudent(studentRes.data);
        setCompanies(companiesRes.data);
        setApplications(appsRes.data);
      } catch (error) {
        console.error("Failed to load student dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCount = applications.filter(
    (app) => app.status === "Selected"
  ).length;
  const round1Count = applications.filter(
    (app) => app.status === "Round 1 Cleared"
  ).length;
  const round2Count = applications.filter(
    (app) => app.status === "Round 2 Cleared"
  ).length;
  const hrRoundCount = applications.filter(
    (app) => app.status === "HR Round Cleared"
  ).length;
  const rejectedCount = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  const eligibleDrives = student
    ? companies.filter((company) => {
        const studentCgpa = Number(student.cgpa) || 0;
        const minCGPA = Number(company.minCGPA) || 0;
        const meetsCGPA = studentCgpa >= minCGPA;
        const branchEligible =
          !company.eligibleBranches || company.eligibleBranches.length === 0
            ? true
            : company.eligibleBranches.includes(student.branch);
        const hasNoBacklogs = Number(student.backlogs) === 0;
        const deadlinePassed = company.deadline
          ? new Date(company.deadline) < new Date()
          : false;
        return meetsCGPA && branchEligible && hasNoBacklogs && !deadlinePassed;
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <StudentNav />

      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600">
          Loading student overview...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-sm text-gray-500">Available Drives</h2>
              <p className="text-4xl font-bold text-green-600 mt-3">{companies.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-sm text-gray-500">Eligible Drives</h2>
              <p className="text-4xl font-bold text-indigo-600 mt-3">{eligibleDrives.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-sm text-gray-500">Applied Companies</h2>
              <p className="text-4xl font-bold text-blue-600 mt-3">{applications.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-sm text-gray-500">Selected Companies</h2>
              <p className="text-4xl font-bold text-indigo-600 mt-3">{selectedCount}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold">Profile</h2>
                <Link
                  to="/student/profile"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit Profile
                </Link>
              </div>
              <p className="text-gray-700">Name: {student?.user?.name || "N/A"}</p>
              <p className="text-gray-700">Email: {student?.user?.email || "N/A"}</p>
              <p className="text-gray-700">Branch: {student?.branch || "N/A"}</p>
              <p className="text-gray-700">CGPA: {student?.cgpa ?? "N/A"}</p>
              <p className="text-gray-700">Backlogs: {student?.backlogs ?? "N/A"}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-3">Next Steps</h2>
              <p className="text-gray-700">
                View available drives, apply to eligible companies, and track your application progress.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-500">Round 1 Cleared</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-3">{round1Count}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-500">Round 2 Cleared</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-3">{round2Count}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-500">HR Round Cleared</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-3">{hrRoundCount}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-500">Rejected Applications</h3>
              <p className="text-3xl font-bold text-red-600 mt-3">{rejectedCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Application Status</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3">Company</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-500">
                        You have not applied to any companies yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app._id} className="border-t">
                        <td className="p-3">{app.company.companyName}</td>
                        <td className="p-3">{app.company.jobRole}</td>
                        <td className="p-3">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
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
        </>
      )}
    </div>
  );
}
