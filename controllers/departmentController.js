import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all departments with course & student counts
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { departmentId: { $regex: search, $options: 'i' } },
        { headOfDepartment: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const departments = await Department.find(query).sort({ name: 1 });

    // Aggregate counts for courses and students per department
    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const courseCount = await Course.countDocuments({ department: dept._id });
        const studentCount = await Student.countDocuments({ department: dept._id });
        return {
          ...dept.toObject(),
          courseCount,
          studentCount,
        };
      })
    );

    res.json({
      success: true,
      count: departmentsWithCounts.length,
      data: departmentsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const courses = await Course.find({ department: department._id });
    const studentCount = await Student.countDocuments({ department: department._id });

    res.json({
      success: true,
      data: {
        ...department.toObject(),
        courses,
        studentCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private
export const createDepartment = async (req, res, next) => {
  try {
    const { departmentId, name, headOfDepartment, email, phone, description, status } = req.body;

    if (!departmentId || !name || !headOfDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Department ID, Department Name, and Head of Department',
      });
    }

    const exists = await Department.findOne({
      $or: [
        { departmentId: departmentId.toUpperCase() },
        { name: name.trim() },
      ],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'A department with this ID or Name already exists',
      });
    }

    const department = await Department.create({
      departmentId: departmentId.toUpperCase().trim(),
      name: name.trim(),
      headOfDepartment: headOfDepartment.trim(),
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      description: description ? description.trim() : '',
      status: status || 'Active',
    });

    await logActivity({
      action: 'CREATE',
      entity: 'DEPARTMENT',
      description: `Created department: ${department.name} (${department.departmentId})`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.status(201).json({
      success: true,
      data: department,
      message: 'Department created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private
export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const { departmentId, name, headOfDepartment, email, phone, description, status } = req.body;

    if (departmentId && departmentId.toUpperCase() !== department.departmentId) {
      const idExists = await Department.findOne({ departmentId: departmentId.toUpperCase() });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: 'Another department already uses this Department ID',
        });
      }
      department.departmentId = departmentId.toUpperCase().trim();
    }

    if (name && name.trim() !== department.name) {
      const nameExists = await Department.findOne({ name: name.trim() });
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Another department already uses this Name',
        });
      }
      department.name = name.trim();
    }

    if (headOfDepartment) department.headOfDepartment = headOfDepartment.trim();
    if (email !== undefined) department.email = email.trim();
    if (phone !== undefined) department.phone = phone.trim();
    if (description !== undefined) department.description = description.trim();
    if (status) department.status = status;

    const updatedDepartment = await department.save();

    await logActivity({
      action: 'UPDATE',
      entity: 'DEPARTMENT',
      description: `Updated department: ${updatedDepartment.name}`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.json({
      success: true,
      data: updatedDepartment,
      message: 'Department updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private
export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Safety constraint: Prevent deletion if courses or students are tied to this department
    const courseCount = await Course.countDocuments({ department: department._id });
    if (courseCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${courseCount} course(s) are currently associated with it. Please reassign or delete the courses first.`,
      });
    }

    const studentCount = await Student.countDocuments({ department: department._id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: ${studentCount} student(s) are currently enrolled in it. Please reassign the students first.`,
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'DELETE',
      entity: 'DEPARTMENT',
      description: `Deleted department: ${department.name} (${department.departmentId})`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
