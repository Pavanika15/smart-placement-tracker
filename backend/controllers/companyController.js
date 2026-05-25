import Company from '../models/Company.js';
import Student from '../models/Student.js';
import Application from '../models/Application.js';
import sendEmail from '../utils/sendEmail.js';

export const createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);

    const students = await Student.find().populate('user', 'name email');
    const emails = students
      .filter((student) => student.user?.email)
      .map((student) => student.user.email);

    await Promise.allSettled(
      emails.map((email) =>
        sendEmail(
          email,
          `New Company Announcement: ${company.companyName}`,
          `Hello,

A new placement drive has been posted for ${company.companyName} - ${company.jobRole}.
Minimum CGPA: ${company.minCGPA}
Eligible branches: ${company.eligibleBranches?.join(', ') || 'All'}
Deadline: ${company.deadline ? company.deadline.toISOString().slice(0, 10) : 'N/A'}

Please log in to apply if you are eligible and the deadline has not passed.

Best regards,
Placement Team`
        )
      )
    );

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