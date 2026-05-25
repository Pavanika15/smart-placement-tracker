import Student from '../models/Student.js';
import Company from '../models/Company.js';

export const createStudent = async (req, res) => {
  try {
    const existing = await Student.findOne({ user: req.user._id });

    if (existing) {
      return res.status(400).json({
        message: "Student profile already exists",
      });
    }

    const student = await Student.create({
      ...req.body,
      user: req.user._id,
    });

    const populatedStudent = await student.populate("user", "name email role");
    res.status(201).json(populatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate(
      "user",
      "name email role"
    );
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    student.rollNumber = req.body.rollNumber ?? student.rollNumber;
    student.branch = req.body.branch ?? student.branch;
    student.cgpa = req.body.cgpa ?? student.cgpa;
    student.backlogs = req.body.backlogs ?? student.backlogs;

    await student.save();
    const updatedStudent = await student.populate("user", "name email role");
    res.json(updatedStudent);
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

export const updateStudentByAdmin = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.rollNumber = req.body.rollNumber ?? student.rollNumber;
    student.branch = req.body.branch ?? student.branch;
    student.cgpa = req.body.cgpa ?? student.cgpa;
    student.backlogs = req.body.backlogs ?? student.backlogs;

    await student.save();
    const updatedStudent = await student.populate('user', 'name email');
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteStudentByAdmin = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
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