import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Student from '../models/Student.js';
import sendEmail from '../utils/sendEmail.js';

export const applyToCompany = async (req, res) => {
  try {
    const { companyId } = req.body;

    const student = await Student.findOne({
      user: req.user._id,
    }).populate('user', 'name email');

    if (!student) {
      return res.status(404).json({
        message: 'Student profile not found',
      });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: 'Company not found',
      });
    }

    if (company.deadline && company.deadline < new Date()) {
      return res.status(400).json({
        message: 'Application deadline has passed for this drive.',
      });
    }

    const studentCgpa = Number(student.cgpa ?? 0);
    if (studentCgpa < Number(company.minCGPA ?? 0)) {
      return res.status(400).json({
        message: 'You do not meet the minimum CGPA requirement for this drive.',
      });
    }

    const branchEligible =
      !company.eligibleBranches || company.eligibleBranches.length === 0
        ? true
        : company.eligibleBranches.includes(student.branch);

    if (!branchEligible) {
      return res.status(400).json({
        message: 'Your branch is not eligible for this drive.',
      });
    }

    const hasNoBacklogs = Number(student.backlogs ?? 0) === 0;
    if (!hasNoBacklogs) {
      return res.status(400).json({
        message: 'Students with backlogs are not eligible to apply for this drive.',
      });
    }

    const application = await Application.create({
      student: student._id,
      company: companyId,
    });

    if (student.user?.email) {
      try {
        await sendEmail(
          student.user.email,
          `Application Confirmed: ${company.companyName}`,
          `Hello ${student.user.name || 'Student'},\n\nYour application for ${company.companyName} (${company.jobRole}) has been received. You meet the eligibility criteria and your application is under review.\n\nBest of luck!\nPlacement Team`
        );
      } catch (emailError) {
        console.error('Failed to send eligibility confirmation email:', emailError);
      }
    }

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
    const student = await Student.findOne({
      user: req.user._id,
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found",
      });
    }

    const applications = await Application.find({
      student: student._id,
    })
      .populate("company")
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email",
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
      )
        .populate({
          path: 'student',
          populate: { path: 'user', select: 'name email' },
        })
        .populate('company');

    if (!application) {
      return res.status(404).json({
        message: 'Application not found',
      });
    }

    if (application.student?.user?.email) {
      const studentName = application.student.user.name || 'Student';
      const companyName = application.company?.companyName || 'the company';
      const status = application.status;
      let subject = `Application Update: ${companyName}`;
      let text = `Hello ${studentName},\n\nYour application status for ${companyName} has been updated to: ${status}.\n\n`;

      if (status === 'Selected') {
        text += 'Congratulations! You have been selected. The final offer details will be shared soon.';
      } else if (status === 'Rejected') {
        text += 'Unfortunately, you were not selected for this company. Keep applying to other drives.';
      } else if (status.includes('Round 1 Cleared')) {
        text += `You have cleared Round 1. ${companyName} may share interview schedule details shortly.`;
      } else if (status.includes('Round 2 Cleared')) {
        text += `You have cleared Round 2. ${companyName} may share the next interview schedule soon.`;
      } else if (status.includes('HR Round Cleared')) {
        text += `You have cleared the HR round. Final decision will follow soon.`;
      } else {
        text += 'Please check your dashboard for more details and next steps.';
      }

      if (application.company?.interviewDates?.length) {
        const roundIndex = status.includes('Round 1')
          ? 0
          : status.includes('Round 2')
          ? 1
          : status.includes('HR')
          ? 2
          : -1;

        if (roundIndex >= 0 && application.company.interviewDates[roundIndex]) {
          text += `\n\nScheduled interview date: ${application.company.interviewDates[roundIndex].toISOString().slice(0, 10)}`;
        }
      }

      try {
        await sendEmail(application.student.user.email, subject, text);
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllApplications = async (
  req,
  res
) => {
  try {
    const applications =
      await Application.find()
        .populate("company")
        .populate({
          path: "student",
          populate: {
            path: "user",
            select: "name email",
          },
        });

    res.json(applications);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

