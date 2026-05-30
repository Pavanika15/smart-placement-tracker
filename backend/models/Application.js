import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    status: {
      type: String,
      enum: [
        'Applied',
        'Round 1 Cleared',
        'Round 2 Cleared',
        'HR Round Cleared',
        'Selected',
        'Rejected',
      ],
      default: 'Applied',
    },

    round1: {
      type: Boolean,
      default: false,
    },

    round2: {
      type: Boolean,
      default: false,
    },

    hrRound: {
      type: Boolean,
      default: false,
    },
    preferredLocation: {
      type: String,
      default: null,
      trim: true,
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    resumeName: {
      type: String,
      default: null,
      trim: true,
    },
    statement: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same company
applicationSchema.index({ student: 1, company: 1 }, { unique: true });

const Application = mongoose.model(
  'Application',
  applicationSchema
);

export default Application;