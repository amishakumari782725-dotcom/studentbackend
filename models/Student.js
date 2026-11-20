import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID / Enrollment number is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['Male', 'Female', 'Other'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: [true, 'City is required'], trim: true },
      state: { type: String, required: [true, 'State is required'], trim: true },
      pincode: { type: String, default: '', trim: true },
      country: { type: String, default: 'India' },
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    admissionDate: {
      type: Date,
      required: [true, 'Admission date is required'],
      default: Date.now,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required (e.g. 2024-2027)'],
      trim: true,
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 12,
      default: 1,
    },
    studentStatus: {
      type: String,
      enum: ['Active', 'Inactive', 'Graduated', 'Suspended'],
      default: 'Active',
    },
    parentDetails: {
      fatherName: { type: String, default: '', trim: true },
      motherName: { type: String, default: '', trim: true },
      guardianContact: { type: String, default: '', trim: true },
      guardianEmail: { type: String, default: '', trim: true },
      relationship: { type: String, default: 'Father' },
    },
    bloodGroup: {
      type: String,
      default: 'O+',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high performance searches and sorting
studentSchema.index({ studentId: 1, fullName: 'text', email: 1 });
studentSchema.index({ department: 1, course: 1, studentStatus: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
