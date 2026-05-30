import { useEffect, useState } from "react";
import api from "../../services/api";
import StudentNav from "../../components/StudentNav";

export default function AvailableDrives() {
  const [drives, setDrives] = useState([]);
  const [student, setStudent] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, drivesRes, appsRes] = await Promise.all([
          api.get("/students/me"),
          api.get("/companies"),
          api.get("/applications/student"),
        ]);

        setStudent(studentRes.data);
        setDrives(drivesRes.data);
        setApplications(appsRes.data);
      } catch (error) {
        console.error("Failed to load available drives:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const appliedCompanyIds = applications.map((app) => app.company._id);

  const isEligible = (company) => {
    if (!student) return false;
    const studentCgpa = Number(student.cgpa) || 0;
    const minCGPA = Number(company.minCGPA) || 0;
    const meetsCGPA = studentCgpa >= minCGPA;
    const branchEligible =
      !company.eligibleBranches || company.eligibleBranches.length === 0
        ? true
        : company.eligibleBranches.includes(student.branch);
    const noBacklogs = Number(student.backlogs) === 0;
    return meetsCGPA && branchEligible && noBacklogs;
  };

  const hasDeadlinePassed = (company) => {
    return company.deadline ? new Date(company.deadline) < new Date() : false;
  };

  const activeDrives = drives.filter((drive) => !hasDeadlinePassed(drive));
  const expiredDrivesCount = drives.filter((drive) => hasDeadlinePassed(drive)).length;

  const applyToDrive = async (companyId) => {
    try {
      await api.post("/applications/apply", {
        companyId,
      });

      alert("Applied Successfully!");
      const res = await api.get("/applications/student");
      setApplications(res.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Application failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <StudentNav />

      <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-700 p-8 text-white shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Available Drives</p>
            <h1 className="mt-4 text-4xl font-semibold">Current opportunities</h1>
            <p className="mt-3 max-w-2xl text-slate-200">
              Browse active placement drives and apply to opportunities that match your profile.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Active Drives</p>
              <p className="mt-3 text-3xl font-semibold">{activeDrives.length}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Expired Removed</p>
              <p className="mt-3 text-3xl font-semibold">{expiredDrivesCount}</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Applications</p>
              <p className="mt-3 text-3xl font-semibold">{applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600">
          Loading available drives...
        </div>
      ) : (
        <>
          {expiredDrivesCount > 0 && (
            <div className="mb-4 rounded-xl bg-yellow-50 border-l-4 border-yellow-400 p-4 text-sm text-yellow-700">
              {expiredDrivesCount} closed drive{expiredDrivesCount === 1 ? "" : "s"} have been removed from your active list.
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {activeDrives.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
                No active drives available right now.
              </div>
            ) : (
              activeDrives.map((drive) => {
                const alreadyApplied = appliedCompanyIds.includes(drive._id);
                const eligible = isEligible(drive);
                return (
                  <div
                    key={drive._id}
                    className="rounded-[1.75rem] bg-white p-6 shadow-lg ring-1 ring-slate-200"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-slate-900">{drive.companyName}</h2>
                        <p className="text-slate-600 mt-1">{drive.jobRole}</p>
                      </div>
                      <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        alreadyApplied
                          ? "bg-slate-100 text-slate-700"
                          : eligible
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {alreadyApplied ? "Already Applied" : eligible ? "Eligible" : "Not Eligible"}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Package</p>
                        <p className="mt-2 font-semibold text-slate-900">{drive.ctc}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Location</p>
                        <p className="mt-2 font-semibold text-slate-900">{drive.location || "Remote"}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Min CGPA</p>
                        <p className="mt-2 font-semibold text-slate-900">{drive.minCGPA}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
                        <p className="mt-2 font-semibold text-slate-900">{drive.deadline?.slice(0, 10) || "N/A"}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3">
                      <button
                        disabled={!eligible || alreadyApplied}
                        onClick={() => applyToDrive(drive._id)}
                        className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                          alreadyApplied
                            ? "bg-slate-300 text-slate-600 cursor-not-allowed"
                            : !eligible
                            ? "bg-amber-500 text-white cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {alreadyApplied ? "Already Applied" : eligible ? "Apply Now" : "Not Eligible"}
                      </button>
                      {!alreadyApplied && !eligible && (
                        <p className="text-sm text-amber-700">
                          This drive is active, but you do not meet all eligibility criteria yet.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}