import { useEffect, useState } from "react";
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
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [companiesRes, studentsRes, applicationsRes] = await Promise.all([
          api.get("/companies"),
          api.get("/students"),
          api.get("/applications/all"),
        ]);

        const selectedCount = applicationsRes.data.filter(
          (app) => app.status === "Selected"
        ).length;
        const pendingCount = applicationsRes.data.filter(
          (app) => app.status === "Applied"
        ).length;
        const upcomingCount = applicationsRes.data.filter((app) =>
          ["Round 1 Cleared", "Round 2 Cleared", "HR Round Cleared"].includes(app.status)
        ).length;
        const activeDriveCount = companiesRes.data.filter(
          (company) => !company.deadline || new Date(company.deadline) >= new Date()
        ).length;

        setStats({
          totalCompanies: companiesRes.data.length,
          totalStudents: studentsRes.data.length,
          activeDrives: activeDriveCount,
          selectedStudents: selectedCount,
          pendingApplications: pendingCount,
          upcomingInterviews: upcomingCount,
        });
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Total Companies", value: stats.totalCompanies },
    { title: "Total Students", value: stats.totalStudents },
    { title: "Active Drives", value: stats.activeDrives },
    { title: "Selected Students", value: stats.selectedStudents },
    { title: "Pending Applications", value: stats.pendingApplications },
    { title: "Interviews Scheduled", value: stats.upcomingInterviews },
  ];

  const downloadCSV = (filename, rows) => {
    const header = Object.keys(rows[0] || {}).join(",");
    const csv = [header]
      .concat(rows.map((row) => Object.values(row).map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = async (type) => {
    try {
      if (type === "students") {
        const res = await api.get("/students");
        const rows = res.data.map((student) => ({
          name: student.user?.name || "",
          email: student.user?.email || "",
          rollNumber: student.rollNumber,
          branch: student.branch,
          cgpa: student.cgpa,
          backlogs: student.backlogs,
        }));
        downloadCSV("students-report.csv", rows);
      }

      if (type === "companies") {
        const res = await api.get("/companies");
        const rows = res.data.map((company) => ({
          companyName: company.companyName,
          jobRole: company.jobRole,
          ctc: company.ctc,
          minCGPA: company.minCGPA,
          deadline: company.deadline?.slice(0, 10) || "",
          eligibleBranches: (company.eligibleBranches || []).join(";") || "All",
        }));
        downloadCSV("companies-report.csv", rows);
      }

      if (type === "applications") {
        const res = await api.get("/applications/all");
        const rows = res.data.map((app) => ({
          student: app.student?.user?.name || "",
          email: app.student?.user?.email || "",
          company: app.company?.companyName || "",
          role: app.company?.jobRole || "",
          status: app.status,
          appliedAt: app.createdAt?.slice(0, 10) || "",
        }));
        downloadCSV("applications-report.csv", rows);
      }
    } catch (error) {
      console.error("Failed to export report:", error);
      alert("Unable to generate report. Try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <AdminNav />
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((item) => (
          <div key={item.title} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-gray-500 text-sm font-medium">{item.title}</h2>
            <p className="text-3xl font-bold mt-2 text-blue-600">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2">Welcome to Smart Placement Tracker</h2>
        <p className="text-gray-600">
          Manage companies, students, recruitment drives, and interview progress from one centralized dashboard.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => exportReport("students")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Download Students Report
          </button>
          <button
            onClick={() => exportReport("companies")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download Companies Report
          </button>
          <button
            onClick={() => exportReport("applications")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Download Applications Report
          </button>
        </div>
      </div>
    </div>
  );
}
