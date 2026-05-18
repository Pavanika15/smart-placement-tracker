import Application from '../models/Application.js';
import Student from '../models/Student.js';

export const applyToCompany = async (req, res) => {
  try {
    const { companyId } = req.body;

    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        message: 'Student profile not found',
      });
    }

    const application = await Application.create({
      student: student._id,
      company: companyId,
    });

    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          'You have already applied to this company',
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

export const getApplicationsByStudent = async (
  req,
  res
) => {
  try {
    const applications = await Application.find({
      student: req.params.id,
    })
      .populate('company')
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email',
        },
      });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateApplicationStatus = async (
  req,
  res
) => {
  try {
    const application =
      await Application.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
      });
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};