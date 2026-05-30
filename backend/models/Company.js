import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    jobRole: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    ctc: {
      type: String,
      required: true,
      trim: true,
    },

    minCGPA: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    eligibleBranches: [
      {
        type: String,
        enum: ["CSE", "CSE-AI","AIML","CSE-DS", "IT", "ECE", "EEE", "MECH", "CIVIL"],
      },
    ],

    deadline: {
      type: Date,
      required: true,
    },

    rounds: [
      {
        type: String,
      },
    ],

    interviewDates: [
      {
        type: Date,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Company = mongoose.model('Company', companySchema);

export default Company;