import Course from '../models/Course.js';
import Department from '../models/Department.js';
import Student from '../models/Student.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all courses with department population & filters
// @route   GET /api/courses
// @access  Private
export const getCourses = async (req, res, next) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.courseStatus = status;
    }

    if (search) {
      query.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('department', 'departmentId name')
      .sort({ courseCode: 1 });

    // Attach current student enrollment count per course
    const coursesWithCount = await Promise.all(
      courses.map(async (course) => {
        const studentCount = await Student.countDocuments({ course: course._id });
        return {
          ...course.toObject(),
          studentCount,
        };
      })
    );

    res.json({
      success: true,
      count: coursesWithCount.length,
      data: coursesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
export const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      'department',
      'departmentId name headOfDepartment'
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const studentCount = await Student.countDocuments({ course: course._id });

    res.json({
      success: true,
      data: {
        ...course.toObject(),
        studentCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private
export const createCourse = async (req, res, next) => {
  try {
    const { courseCode, courseName, department, duration, totalSemesters, courseDescription, courseStatus } = req.body;

    if (!courseCode || !courseName || !department || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Please provide course code, course name, department, and duration',
      });
    }

    // Verify department exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected department does not exist',
      });
    }

    const codeExists = await Course.findOne({ courseCode: courseCode.toUpperCase().trim() });
    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: 'A course with this Course Code already exists',
      });
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase().trim(),
      courseName: courseName.trim(),
      department,
      duration: duration.trim(),
      totalSemesters: totalSemesters ? Number(totalSemesters) : 6,
      courseDescription: courseDescription ? courseDescription.trim() : '',
      courseStatus: courseStatus || 'Active',
    });

    const populatedCourse = await Course.findById(course._id).populate('department', 'departmentId name');

    await logActivity({
      action: 'CREATE',
      entity: 'COURSE',
      description: `Created course: ${course.courseName} (${course.courseCode})`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.status(201).json({
      success: true,
      data: populatedCourse,
      message: 'Course created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    const { courseCode, courseName, department, duration, totalSemesters, courseDescription, courseStatus } = req.body;

    if (courseCode && courseCode.toUpperCase() !== course.courseCode) {
      const codeExists = await Course.findOne({ courseCode: courseCode.toUpperCase().trim() });
      if (codeExists) {
        return res.status(400).json({
          success: false,
          message: 'Another course already uses this Course Code',
        });
      }
      course.courseCode = courseCode.toUpperCase().trim();
    }

    if (department && department !== course.department.toString()) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        return res.status(404).json({
          success: false,
          message: 'Selected department does not exist',
        });
      }
      course.department = department;
    }

    if (courseName) course.courseName = courseName.trim();
    if (duration) course.duration = duration.trim();
    if (totalSemesters !== undefined) course.totalSemesters = Number(totalSemesters);
    if (courseDescription !== undefined) course.courseDescription = courseDescription.trim();
    if (courseStatus) course.courseStatus = courseStatus;

    const updatedCourse = await course.save();
    const populated = await Course.findById(updatedCourse._id).populate('department', 'departmentId name');

    await logActivity({
      action: 'UPDATE',
      entity: 'COURSE',
      description: `Updated course: ${populated.courseName} (${populated.courseCode})`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.json({
      success: true,
      data: populated,
      message: 'Course updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Critical constraint requirement: Prevent deletion of a course if it is still assigned to students
    const studentCount = await Student.countDocuments({ course: course._id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Deletion prohibited: ${studentCount} student(s) are currently enrolled in ${course.courseName}. Please reassign or remove enrolled students before deleting this course.`,
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'DELETE',
      entity: 'COURSE',
      description: `Deleted course: ${course.courseName} (${course.courseCode})`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
