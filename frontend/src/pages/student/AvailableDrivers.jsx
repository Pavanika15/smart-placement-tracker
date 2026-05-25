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
    <div className="p-6 bg-gray-100 min-h-screen">
      <StudentNav />

      <h1 className="text-3xl font-bold mb-6">Available Drives</h1>

      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-600">
          Loading available drives...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {drives.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-500">
              No drives available at the moment.
            </div>
          ) : (
            drives.map((drive) => {
              const alreadyApplied = appliedCompanyIds.includes(drive._id);
              const eligible = isEligible(drive);
              const deadlinePassed = hasDeadlinePassed(drive);
              return (
                <div
                  key={drive._id}
                  className="bg-white rounded-xl shadow-md p-6"
                >
                  <h2 className="text-xl font-semibold mb-2">
                    {drive.companyName}
                  </h2>

                  <p className="text-gray-600">{drive.jobRole}</p>
                  <p className="font-medium mt-2">{drive.ctc}</p>
                  <p className="mt-2">Min CGPA: {drive.minCGPA}</p>
                  <p className="mt-1">Deadline: {drive.deadline?.slice(0, 10) || "N/A"}</p>
                  <p className="mt-1">Branches: {drive.eligibleBranches?.join(", ") || "All"}</p>
                  {hasDeadlinePassed(drive) && (
                    <p className="mt-1 text-sm text-red-600">This drive is closed.</p>
                  )}

                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      disabled={!eligible || alreadyApplied || deadlinePassed}
                      onClick={() => applyToDrive(drive._id)}
                      className={`px-4 py-2 rounded text-white ${
                        alreadyApplied
                          ? "bg-gray-400 cursor-not-allowed"
                          : !eligible || deadlinePassed
                          ? "bg-red-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {alreadyApplied
                        ? "Already Applied"
                        : deadlinePassed
                        ? "Deadline Passed"
                        : eligible
                        ? "Apply"
                        : "Not Eligible"}
                    </button>
                    {!alreadyApplied && (deadlinePassed ? (
                      <p className="text-sm text-red-600">
                        The application window has closed for this drive.
                      </p>
                    ) : !eligible ? (
                      <p className="text-sm text-red-600">
                        You do not meet the eligibility criteria for this drive.
                      </p>
                    ) : null)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}