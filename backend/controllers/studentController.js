import Student from '../models/Student.js';
import Company from '../models/Company.js';

export const createStudent = async (req, res) => {
  try {
    const existing = await Student.findOne({ user: req.body.user });
if (existing) {
  return res.status(400).json({
    message: "Student profile already exists",
  });
}
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.find().populate(
      'user',
      'name email'
    );

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEligibleStudents = async (
  req,
  res
) => {
  try {
    const company = await Company.findById(
      req.params.companyId
    );

    if (!company) {
      return res
        .status(404)
        .json({ message: 'Company not found' });
    }
    

    const students = await Student.find({
      cgpa: { $gte: company.minCGPA },
      branch: {
        $in: company.eligibleBranches,
      },
      backlogs: 0,
    }).populate('user', 'name email');

    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};