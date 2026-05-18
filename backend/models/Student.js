import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    branch: {
      type: String,
      required: true,
      enum: ['CSE', 'CSE-AI', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'],
    },

    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    backlogs: {
      type: Number,
      default: 0,
      min: 0,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;