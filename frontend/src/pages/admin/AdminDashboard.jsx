const stats = [
  { title: 'Total Companies', value: 12 },
  { title: 'Total Students', value: 450 },
  { title: 'Active Drives', value: 5 },
  { title: 'Selected Students', value: 78 },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-gray-500 text-sm font-medium">
              {item.title}
            </h2>
            <p className="text-3xl font-bold mt-2 text-blue-600">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Optional Welcome Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold mb-2">
          Welcome to Smart Placement Tracker
        </h2>
        <p className="text-gray-600">
          Manage companies, students, recruitment drives, and interview
          progress from one centralized dashboard.
        </p>
      </div>
    </div>
  );
}