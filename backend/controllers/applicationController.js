import fs from 'fs/promises';
import path from 'path';
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

    let resumeUrl = req.body.resumeUrl || null;
    let resumeName = req.body.resumeName || null;

    if (req.body.resumeBase64 && req.body.resumeName) {
      try {
        const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
        await fs.mkdir(uploadDir, { recursive: true });

        const extension = path.extname(req.body.resumeName) || '.pdf';
        const fileName = `${Date.now()}-${student._id}${extension}`;
        const filePath = path.join(uploadDir, fileName);
        const base64Data = req.body.resumeBase64.replace(/^data:[^;]+;base64,/, '');
        await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));

        resumeUrl = `/uploads/resumes/${fileName}`;
        resumeName = req.body.resumeName;
      } catch (fileError) {
        console.error('Failed to save resume upload:', fileError);
      }
    }

    const application = await Application.create({
      student: student._id,
      company: companyId,
      preferredLocation: req.body.preferredLocation || null,
      resumeUrl,
      resumeName,
      statement: req.body.statement || null,
    });

    if (student.user?.email) {
      try {
        const applyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/student/applications`;
        const confirmationText = `Hello ${student.user.name || 'Student'},\n\nThank you for applying to ${company.companyName} (${company.jobRole}). Your submission has been received and is now under review.\n\nApplication details:\n- Company: ${company.companyName}\n- Role: ${company.jobRole}\n- Preferred location: ${application.preferredLocation || 'Not specified'}\n\nYou can track your application status here: ${applyUrl}\n\nBest regards,\nPlacement Team`;

        await sendEmail(
          student.user.email,
          `Application Received: ${company.companyName}`,
          confirmationText
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
      const role = application.company?.jobRole || 'the role';
      const status = application.status;
      let subject = `Placement Update: ${companyName}`;
      let text = `Hello ${studentName},\n\nWe wanted to update you on your application for ${companyName} (${role}). The current status is: ${status}.\n\n`;

      if (status === 'Selected') {
        text += 'Congratulations! You have been selected. The next steps and offer details will be shared with you shortly.';
      } else if (status === 'Rejected') {
        text += 'We regret to inform you that your application was not successful. Please continue applying to other suitable drives and keep your profile updated.';
      } else if (status.includes('Round 1 Cleared')) {
        text += `You have successfully cleared Round 1. Please await further communication for the next stage.`;
      } else if (status.includes('Round 2 Cleared')) {
        text += `You have successfully cleared Round 2. Please await the next update regarding the HR or final round.`;
      } else if (status.includes('HR Round Cleared')) {
        text += `You have successfully cleared the HR round. The final decision will be sent to you soon.`;
      } else {
        text += 'Please check your student dashboard for more details and next steps.';
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

      text += '\n\nBest regards,\nPlacement Team';

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

