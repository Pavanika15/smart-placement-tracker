import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import AdminNav from "../../components/AdminNav";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalStudents: 0,
    activeDrives: 0,
    selectedStudents: 0,
    pendingApplications: 0,
    upcomingInterviews: 0,
    nextDrive: "No active drives",
    lastUpdated: new Date().toLocaleString(),
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [companiesRes, studentsRes, applicationsRes] = await Promise.all([
          api.get("/companies"),
          api.get("/students"),
          api.get("/applications/all"),
        ]);

        const activeDriveList = companiesRes.data.filter(
          (company) => !company.deadline || new Date(company.deadline) >= new Date()
        );
        const selectedCount = applicationsRes.data.filter(
          (app) => app.status === "Selected"
        ).length;
        const pendingCount = applicationsRes.data.filter(
          (app) => app.status === "Applied"
        ).length;
        const upcomingCount = applicationsRes.data.filter((app) =>
          ["Round 1 Cleared", "Round 2 Cleared", "HR Round Cleared"].includes(app.status)
        ).length;

        const nextDrive = activeDriveList
          .filter((company) => company.deadline)
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))[0];

        setStats({
          totalCompanies: companiesRes.data.length,
          totalStudents: studentsRes.data.length,
          activeDrives: activeDriveList.length,
          selectedStudents: selectedCount,
          pendingApplications: pendingCount,
          upcomingInterviews: upcomingCount,
          nextDrive: nextDrive
            ? `${nextDrive.companyName} • ${nextDrive.jobRole}`
            : "No active drives available",
          lastUpdated: new Date().toLocaleString(),
        });
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Total Companies", value: stats.totalCompanies, accent: "from-blue-500 to-sky-500" },
    { title: "Total Students", value: stats.totalStudents, accent: "from-emerald-500 to-teal-500" },
    { title: "Active Drives", value: stats.activeDrives, accent: "from-indigo-500 to-violet-500" },
    { title: "Selected Students", value: stats.selectedStudents, accent: "from-slate-500 to-gray-700" },
    { title: "Pending Applications", value: stats.pendingApplications, accent: "from-orange-500 to-amber-500" },
    { title: "Interviews Scheduled", value: stats.upcomingInterviews, accent: "from-fuchsia-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <AdminNav />

      <div className="flex flex-col gap-6">
        <section className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-8 shadow-xl text-white">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Smart Placement Tracker</p>
              <h1 className="mt-4 text-4xl font-semibold">Admin Control Center</h1>
              <p className="mt-4 text-slate-300 leading-7">
                Monitor live placement activity, manage drives, and keep your team aligned with the latest student and company status.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/admin/companies"
                  className="inline-flex items-center justify-center rounded-full bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Manage Companies
                </Link>
                <Link
                  to="/admin/applications"
                  className="inline-flex items-center justify-center rounded-full bg-slate-200/10 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-200/20"
                >
                  View Applications
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:w-[360px]">
              <div className="rounded-3xl bg-slate-800/70 p-5 shadow-lg">
                <p className="text-sm uppercase text-slate-400">Next Drive</p>
                <p className="mt-3 text-lg font-semibold text-white">{stats.nextDrive}</p>
              </div>
              <div className="rounded-3xl bg-slate-800/70 p-5 shadow-lg">
                <p className="text-sm uppercase text-slate-400">Last refresh</p>
                <p className="mt-3 text-lg font-semibold text-white">{stats.lastUpdated}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((item) => (
            <div
              key={item.title}
              className={`rounded-[1.75rem] bg-white p-6 shadow-lg ring-1 ring-slate-200`}
            >
              <p className="text-sm font-semibold text-slate-500">{item.title}</p>
              <p className="mt-4 text-4xl font-semibold text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[1.75rem] bg-white p-6 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Live Placement Overview</h2>
            <p className="mt-4 text-slate-600 leading-7">
              The dashboard automatically hides expired drives and shows current active recruitment opportunities only. Use the Companies and Applications pages for filtering, exports, and candidate review.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Active Drives</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{stats.activeDrives}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Pending Applications</p>
                <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-white p-6 shadow-lg ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
            <div className="mt-5 grid gap-3">
              <Link
                to="/admin/companies"
                className="block rounded-2xl bg-slate-900 px-4 py-4 text-slate-100 transition hover:bg-slate-800"
              >
                Create or edit company drives
              </Link>
              <Link
                to="/admin/applications"
                className="block rounded-2xl bg-slate-100 px-4 py-4 text-slate-900 transition hover:bg-slate-200"
              >
                Review application progress
              </Link>
              <Link
                to="/admin/students"
                className="block rounded-2xl bg-slate-100 px-4 py-4 text-slate-900 transition hover:bg-slate-200"
              >
                Manage student profiles
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
