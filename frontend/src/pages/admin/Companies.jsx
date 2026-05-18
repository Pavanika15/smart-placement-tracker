import { useState } from 'react';

export default function Companies() {
  const [companies] = useState([
    {
      _id: '1',
      companyName: 'TCS',
      jobRole: 'Software Engineer',
      ctc: '3.6 LPA',
      minCGPA: 7.0,
    },
    {
      _id: '2',
      companyName: 'Infosys',
      jobRole: 'System Engineer',
      ctc: '4.2 LPA',
      minCGPA: 6.5,
    },
  ]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Companies</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Company
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">CTC</th>
              <th className="p-4 text-left">Min CGPA</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company._id} className="border-t">
                <td className="p-4">{company.companyName}</td>
                <td className="p-4">{company.jobRole}</td>
                <td className="p-4">{company.ctc}</td>
                <td className="p-4">{company.minCGPA}</td>
                <td className="p-4 space-x-2">
                  <button className="text-blue-600">Edit</button>
                  <button className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}