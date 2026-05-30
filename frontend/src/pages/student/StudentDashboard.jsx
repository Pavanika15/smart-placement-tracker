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

  const activeCompanies = companies.filter((company) => {
    const deadlinePassed = company.deadline
      ? new Date(company.deadline) < new Date()
      : false;
    return !deadlinePassed;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <StudentNav />

      <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Student Dashboard</p>
            <h1 className="mt-4 text-4xl font-semibold">
              Welcome back, {student?.user?.name || "Student"}
            </h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Track active placement drives, manage your profile, and stay on top of every application milestone.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Active Drives</p>
              <p className="mt-3 text-3xl font-semibold">{activeCompanies.length}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Eligible</p>
              <p className="mt-3 text-3xl font-semibold">{eligibleDrives.length}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Applied</p>
              <p className="mt-3 text-3xl font-semibold">{applications.length}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Rejected</p>
              <p className="mt-3 text-3xl font-semibold">{rejectedCount}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/student/drives"
            className="inline-flex items-center justify-center rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/25"
          >
            Browse Drives
          </Link>
          <Link
            to="/student/applications"
            className="inline-flex items-center justify-center rounded-full bg-slate-800/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            My Applications
          </Link>
          <Link
            to="/student/profile"
            className="inline-flex items-center justify-center rounded-full bg-slate-800/80 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600">
          Loading student overview...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-[1.5rem] bg-white p-6 shadow-lg">
              <p className="text-sm text-slate-500">Available Drives</p>
              <p className="text-4xl font-bold text-emerald-600 mt-3">{activeCompanies.length}</p>
              <p className="mt-2 text-sm text-slate-500">Current active opportunities</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-lg">
              <p className="text-sm text-slate-500">Eligible Drives</p>
              <p className="text-4xl font-bold text-indigo-600 mt-3">{eligibleDrives.length}</p>
              <p className="mt-2 text-sm text-slate-500">You can apply for these</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-lg">
              <p className="text-sm text-slate-500">Applications</p>
              <p className="text-4xl font-bold text-sky-600 mt-3">{applications.length}</p>
              <p className="mt-2 text-sm text-slate-500">Applications submitted</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-lg">
              <p className="text-sm text-slate-500">Selected</p>
              <p className="text-4xl font-bold text-fuchsia-600 mt-3">{selectedCount}</p>
              <p className="mt-2 text-sm text-slate-500">Offers received</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="rounded-[1.5rem] bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Profile</h2>
                <Link to="/student/profile" className="text-sm text-indigo-600 hover:text-indigo-800">
                  Edit
                </Link>
              </div>
              <p className="text-slate-700">Name: {student?.user?.name || "N/A"}</p>
              <p className="text-slate-700">Email: {student?.user?.email || "N/A"}</p>
              <p className="text-slate-700">Branch: {student?.branch || "N/A"}</p>
              <p className="text-slate-700">CGPA: {student?.cgpa ?? "N/A"}</p>
              <p className="text-slate-700">Backlogs: {student?.backlogs ?? "N/A"}</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-6 shadow-lg lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
              <p className="text-slate-700 leading-7">
                Apply only to active drives that match your eligibility. Keep your profile updated and monitor application status from this dashboard.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Profile</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">Complete</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Drives</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">Active only</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Applications</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">Real-time status</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-6 shadow-lg">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold">Application Status</h2>
                <p className="text-sm text-slate-500">Live view of your current application progress.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                {activeCompanies.length} active drives
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-left text-slate-600">
                    <th className="p-3">Company</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Applied On</th>
                    <th className="p-3">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-500">
                        You have not applied to any companies yet.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app._id} className="border-t last:border-b hover:bg-slate-50">
                        <td className="p-3 text-slate-700">{app.company.companyName}</td>
                        <td className="p-3 text-slate-700">{app.company.jobRole}</td>
                        <td className="p-3">
                          <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700">{app.createdAt ? app.createdAt.slice(0,10) : '-'}</td>
                        <td className="p-3 text-slate-700">{app.company?.deadline ? app.company.deadline.slice(0,10) : '-'}</td>
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
