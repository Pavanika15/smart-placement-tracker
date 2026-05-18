const applications = [
  {
    _id: '1',
    student: 'Pavanika',
    company: 'TCS',
    status: 'Round 1 Cleared',
  },
  {
    _id: '2',
    student: 'Rahul',
    company: 'Infosys',
    status: 'Selected',
  },
];

export default function Applications() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Applications Tracking</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-t">
                <td className="p-4">{app.student}</td>
                <td className="p-4">{app.company}</td>
                <td className="p-4">{app.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}