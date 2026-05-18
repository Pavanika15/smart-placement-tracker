const students = [
  {
    _id: '1',
    name: 'Pavanika',
    branch: 'CSE',
    cgpa: 8.9,
  },
  {
    _id: '2',
    name: 'Rahul',
    branch: 'ECE',
    cgpa: 7.8,
  },
];

export default function Students() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Students</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Branch</th>
              <th className="p-4 text-left">CGPA</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-t">
                <td className="p-4">{student.name}</td>
                <td className="p-4">{student.branch}</td>
                <td className="p-4">{student.cgpa}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}