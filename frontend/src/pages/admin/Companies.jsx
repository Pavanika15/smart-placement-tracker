import { useEffect, useState } from "react";
import api from "../../services/api";
import AdminNav from "../../components/AdminNav";

const branchOptions = ["CSE", "CSE-AI","AIML","CSE-DS", "IT", "ECE", "EEE", "MECH", "CIVIL"];

const initialFormState = {
  companyName: "",
  jobRole: "",
  ctc: "",
  location: "",
  minCGPA: "",
  eligibleBranches: [],
  deadline: "",
  rounds: [""],
  interviewDates: [""],
};

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("companySearchTerm") || "");
  const [filterBranch, setFilterBranch] = useState(() => localStorage.getItem("companyFilterBranch") || "");
  const [filterLocation, setFilterLocation] = useState(() => localStorage.getItem("companyFilterLocation") || "");
  const [formData, setFormData] = useState(() => {
    const savedForm = localStorage.getItem("companyFormState");
    return savedForm ? JSON.parse(savedForm) : initialFormState;
  });
  const [showForm, setShowForm] = useState(() => {
    const savedShowForm = localStorage.getItem("companyFormOpen");
    return savedShowForm ? JSON.parse(savedShowForm) : false;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    localStorage.setItem("companyFormState", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem("companyFormOpen", JSON.stringify(showForm));
  }, [showForm]);

  useEffect(() => {
    localStorage.setItem("companySearchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    localStorage.setItem("companyFilterBranch", filterBranch);
  }, [filterBranch]);

  useEffect(() => {
    localStorage.setItem("companyFilterLocation", filterLocation);
  }, [filterLocation]);

  async function fetchCompanies() {
    try {
      const res = await api.get("/companies");
      setCompanies(res.data);
    } catch (error) {
      console.log(error);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBranchChange = (branch) => {
    const current = formData.eligibleBranches;
    const next = current.includes(branch)
      ? current.filter((item) => item !== branch)
      : [...current, branch];
    setFormData({ ...formData, eligibleBranches: next });
  };

  const handleArrayChange = (name, index, value) => {
    const next = [...formData[name]];
    next[index] = value;
    setFormData({ ...formData, [name]: next });
  };

  const handleAddArrayItem = (name) => {
    setFormData({ ...formData, [name]: [...formData[name], ""] });
  };

  const handleRemoveArrayItem = (name, index) => {
    const next = [...formData[name]];
    if (next.length === 1) {
      next[0] = "";
    } else {
      next.splice(index, 1);
    }
    setFormData({ ...formData, [name]: next });
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setShowForm(false);
    setIsEditing(false);
    setSelectedCompanyId(null);
    setError("");
    localStorage.removeItem("companyFormState");
    localStorage.removeItem("companyFormOpen");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        minCGPA: Number(formData.minCGPA),
        location: formData.location,
        rounds: formData.rounds.filter(Boolean),
        interviewDates: formData.interviewDates.filter(Boolean).map((date) => date),
      };

      if (isEditing) {
        await api.put(`/companies/${selectedCompanyId}`, payload);
      } else {
        await api.post("/companies", payload);
      }

      resetForm();
      fetchCompanies();
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || "Unable to save company.");
    }
  };

  const handleEdit = (company) => {
    setFormData({
      companyName: company.companyName || "",
      jobRole: company.jobRole || "",
      ctc: company.ctc || "",
      location: company.location || "",
      minCGPA: company.minCGPA?.toString() || "",
      eligibleBranches: company.eligibleBranches || [],
      deadline: company.deadline ? company.deadline.slice(0, 10) : "",
      rounds: company.rounds?.length ? company.rounds : [""],
      interviewDates: company.interviewDates?.length
        ? company.interviewDates.map((date) => date?.slice(0, 10) || "")
        : [""],
    });
    setSelectedCompanyId(company._id);
    setIsEditing(true);
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) {
      return;
    }

    try {
      await api.delete(`/companies/${companyId}`);
      fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesName = company.companyName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch
      ? company.eligibleBranches?.includes(filterBranch)
      : true;
    const matchesLocation = filterLocation
      ? company.location?.toLowerCase().includes(filterLocation.toLowerCase())
      : true;
    return matchesName && matchesBranch && matchesLocation;
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <AdminNav />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-gray-600 mt-1">Add and manage company details, eligibility, deadlines, location, and interview dates.</p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Hide Form" : "Add Company"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Search by Company</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Filter by Branch</span>
              <select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">All branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Filter by Location</span>
              <input
                type="text"
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                placeholder="City or campus"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setFilterBranch("");
              setFilterLocation("");
            }}
            className="self-start rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Clear filters
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Showing {filteredCompanies.length} of {companies.length} company records.
        </p>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Company" : "Add New Company"}
          </h2>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Company Name</span>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Job Role</span>
                <input
                  name="jobRole"
                  value={formData.jobRole}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Location</span>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Package Offered (CTC)</span>
                <input
                  name="ctc"
                  value={formData.ctc}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Minimum CGPA</span>
                <input
                  name="minCGPA"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.minCGPA}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Registration Deadline</span>
                <input
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </label>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-700">Eligible Branches</span>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {branchOptions.map((branch) => (
                  <label key={branch} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.eligibleBranches.includes(branch)}
                      onChange={() => handleBranchChange(branch)}
                      className="h-4 w-4 text-blue-600"
                    />
                    {branch}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Interview Rounds</span>
                <button
                  type="button"
                  onClick={() => handleAddArrayItem("rounds")}
                  className="text-blue-600 text-sm"
                >
                  + Add round
                </button>
              </div>
              <div className="space-y-2">
                {formData.rounds.map((round, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      name="rounds"
                      value={round}
                      onChange={(e) => handleArrayChange("rounds", idx, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm"
                      placeholder={`Round ${idx + 1}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem("rounds", idx)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Interview Dates</span>
                <button
                  type="button"
                  onClick={() => handleAddArrayItem("interviewDates")}
                  className="text-blue-600 text-sm"
                >
                  + Add date
                </button>
              </div>
              <div className="space-y-2">
                {formData.interviewDates.map((date, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      name="interviewDates"
                      type="date"
                      value={date}
                      onChange={(e) => handleArrayChange("interviewDates", idx, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveArrayItem("interviewDates", idx)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                {isEditing ? "Update Company" : "Create Company"}
              </button>
              <button type="button" onClick={resetForm} className="border border-gray-300 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Role</th>
              <th className="p-4">Location</th>
              <th className="p-4">CTC</th>
              <th className="p-4">Min CGPA</th>
              <th className="p-4">Deadline</th>
              <th className="p-4">Branches</th>
              <th className="p-4">Interview Dates</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  No companies match your filters.
                </td>
              </tr>
            ) : (
              filteredCompanies.map((company) => (
                <tr key={company._id} className="border-t hover:bg-gray-50">
                  <td className="p-4">{company.companyName}</td>
                  <td className="p-4">{company.jobRole}</td>
                  <td className="p-4">{company.location || "-"}</td>
                  <td className="p-4">{company.ctc}</td>
                  <td className="p-4">{company.minCGPA}</td>
                  <td className="p-4">{company.deadline?.slice(0, 10)}</td>
                  <td className="p-4">{company.eligibleBranches?.join(", ")}</td>
                  <td className="p-4">{company.interviewDates?.map((date) => date?.slice(0, 10)).join(", ")}</td>
                  <td className="p-4 space-x-2">
                    <button
                      onClick={() => handleEdit(company)}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(company._id)}
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
