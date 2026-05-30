import Company from '../models/Company.js';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import sendEmail from '../utils/sendEmail.js';

export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);

    // Notify only eligible students about the new company
    const filter = {
      cgpa: { $gte: company.minCGPA },
      backlogs: 0,
    };

    if (company.eligibleBranches && company.eligibleBranches.length > 0) {
      filter.branch = { $in: company.eligibleBranches };
    }

    const students = await Student.find(filter).populate('user', 'name email');
    const emails = students
      .map((s) => s.user?.email)
      .filter(Boolean);

    if (emails.length > 0) {
      const subject = `New Placement Drive Posted: ${company.companyName}`;
      const applyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/student/apply/${company._id}`;
      const body = `Hello,\n\nA new placement drive has been launched for ${company.companyName} - ${company.jobRole}.\n\nRole: ${company.jobRole}\nLocation: ${company.location || 'N/A'}\nMinimum CGPA: ${company.minCGPA}\nEligible branches: ${company.eligibleBranches?.join(', ') || 'All'}\nDeadline: ${company.deadline ? company.deadline.toISOString().slice(0, 10) : 'N/A'}\n\nIf you are eligible, please log in and apply using the link below:\n${applyUrl}\n\nBest regards,\nPlacement Team`;
      const htmlBody = `
        <div style="font-family:Arial,Helvetica,sans-serif;color:#1f2937;line-height:1.6;">
          <p>Hello,</p>
          <p>A new placement drive has been launched for <strong>${company.companyName}</strong> - <strong>${company.jobRole}</strong>.</p>
          <ul>
            <li><strong>Role:</strong> ${company.jobRole}</li>
            <li><strong>Location:</strong> ${company.location || 'N/A'}</li>
            <li><strong>Minimum CGPA:</strong> ${company.minCGPA}</li>
            <li><strong>Eligible branches:</strong> ${company.eligibleBranches?.join(', ') || 'All'}</li>
            <li><strong>Deadline:</strong> ${company.deadline ? company.deadline.toISOString().slice(0, 10) : 'N/A'}</li>
          </ul>
          <p>If you are eligible, please <a href="${applyUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;">click here to apply</a>.</p>
          <p>Best regards,<br />Placement Team</p>
        </div>
      `;

      await Promise.allSettled(
        emails.map((email) => sendEmail(email, subject, body, htmlBody))
      );
    }

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({
      createdAt: -1,
    });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(
      req.params.id
    );

    if (!company) {
      return res
        .status(404)
        .json({ message: 'Company not found' });
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const oldCompany = await Company.findById(req.params.id);

    if (!oldCompany) {
      return res
        .status(404)
        .json({ message: 'Company not found' });
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    const oldDates = oldCompany.interviewDates || [];
    const newDates = company.interviewDates || [];
    const interviewDatesChanged =
      newDates.length !== oldDates.length ||
      newDates.some(
        (date, index) =>
          !oldDates[index] ||
          date.getTime() !== oldDates[index].getTime()
      );

    // If eligible branches or minCGPA changed, notify newly eligible students
    const oldFilter = { cgpa: { $gte: oldCompany.minCGPA }, backlogs: 0 };
    if (oldCompany.eligibleBranches && oldCompany.eligibleBranches.length > 0) {
      oldFilter.branch = { $in: oldCompany.eligibleBranches };
    }

    const newFilter = { cgpa: { $gte: company.minCGPA }, backlogs: 0 };
    if (company.eligibleBranches && company.eligibleBranches.length > 0) {
      newFilter.branch = { $in: company.eligibleBranches };
    }

    try {
      const [oldEligible, newEligible] = await Promise.all([
        Student.find(oldFilter).select('_id').lean(),
        Student.find(newFilter).populate('user', 'name email'),
      ]);

      const oldIds = new Set(oldEligible.map((s) => String(s._id)));
      const newlyEligible = (newEligible || []).filter(
        (s) => s.user?.email && !oldIds.has(String(s._id))
      );

      if (newlyEligible.length > 0) {
        const subject = `You Are Now Eligible: ${company.companyName}`;
        const body = (studentName) =>
          `Hello ${studentName || 'Student'},\n\nYou are now eligible to apply for ${company.companyName} (${company.jobRole}).\nMinimum CGPA: ${company.minCGPA}\nDeadline: ${company.deadline ? company.deadline.toISOString().slice(0, 10) : 'N/A'}\n\nPlease log in to apply if you are interested.\n\nBest regards,\nPlacement Team`;

        await Promise.allSettled(
          newlyEligible.map((s) => sendEmail(s.user.email, subject, body(s.user.name)))
        );
      }
    } catch (err) {
      console.error('Failed to notify newly eligible students:', err);
    }

    if (
      interviewDatesChanged &&
      newDates.length > 0
    ) {
      const applications = await Application.find({
        company: company._id,
      }).populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name email',
        },
      });

      const emails = applications
        .map((application) => application.student?.user)
        .filter((user) => user?.email)
        .map((user) => user.email);

      if (emails.length > 0) {
        const scheduleLines = newDates.map(
          (date, index) =>
            `• ${company.rounds?.[index] || `Round ${index + 1}`}: ${date
              .toISOString()
              .slice(0, 10)}`
        );

        const emailText = `Hello,

Interview schedule details for ${company.companyName} (${company.jobRole}) are now available.

${scheduleLines.join('\n')}

Please check your application dashboard for any additional instructions and attend the interviews on the scheduled dates.

Best regards,
Placement Team`;

        await Promise.allSettled(
          emails.map((email) =>
            sendEmail(
              email,
              `Interview Schedule Released: ${company.companyName}`,
              emailText
            )
          )
        );
      }
    }

    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(
      req.params.id
    );

    if (!company) {
      return res
        .status(404)
        .json({ message: 'Company not found' });
    }

    res.json({
      message: 'Company deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};