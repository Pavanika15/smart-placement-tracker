const eligibleCompanies = [
  { company: 'TCS', role: 'Software Engineer', status: 'Applied' },
  { company: 'Infosys', role: 'System Engineer', status: 'Eligible' },
  { company: 'Wipro', role: 'Developer', status: 'Selected' },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      {/* Eligible Companies Card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-2">Eligible Companies</h2>
        <p className="text-4xl font-bold text-green-600">
          {eligibleCompanies.length}
        </p>
      </div>

      {/* Application Status Table */}
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
              {eligibleCompanies.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.company}</td>
                  <td className="p-3">{item.role}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        item.status === 'Selected'
                          ? 'bg-green-100 text-green-700'
                          : item.status === 'Applied'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}