import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    departmentId: {
      type: String,
      required: [true, 'Department ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true,
    },
    headOfDepartment: {
      type: String,
      required: [true, 'Head of Department is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model('Department', departmentSchema);
export default Department;
