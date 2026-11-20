import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Associated department is required'],
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g. 3 Years)'],
      trim: true,
    },
    totalSemesters: {
      type: Number,
      required: [true, 'Total semesters count is required'],
      min: 1,
      max: 10,
      default: 6,
    },
    courseDescription: {
      type: String,
      trim: true,
    },
    courseStatus: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
