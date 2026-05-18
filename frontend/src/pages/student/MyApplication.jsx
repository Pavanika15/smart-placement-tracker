const myApplications = [
  {
    _id: '1',
    company: 'TCS',
    role: 'Software Engineer',
    status: 'Applied',
  },
  {
    _id: '2',
    company: 'Wipro',
    role: 'Developer',
    status: 'Selected',
  },
];

export default function MyApplications() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">My Applications</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {myApplications.map((app) => (
              <tr key={app._id} className="border-t">
                <td className="p-4">{app.company}</td>
                <td className="p-4">{app.role}</td>
                <td className="p-4">{app.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}