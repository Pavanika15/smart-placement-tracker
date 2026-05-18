const drives = [
  {
    _id: '1',
    companyName: 'TCS',
    jobRole: 'Software Engineer',
    ctc: '3.6 LPA',
  },
  {
    _id: '2',
    companyName: 'Infosys',
    jobRole: 'System Engineer',
    ctc: '4.2 LPA',
  },
];

export default function AvailableDrives() {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Available Drives</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {drives.map((drive) => (
          <div
            key={drive._id}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-xl font-semibold mb-2">
              {drive.companyName}
            </h2>
            <p className="text-gray-600">{drive.jobRole}</p>
            <p className="font-medium mt-2">{drive.ctc}</p>

            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
              Apply
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}