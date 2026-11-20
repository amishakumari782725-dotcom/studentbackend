import Student from '../models/Student.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get dashboard summary counters and metrics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      graduatedStudents,
      totalCourses,
      totalDepartments,
      activeCourses,
      activeDepartments,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ studentStatus: 'Active' }),
      Student.countDocuments({ studentStatus: 'Inactive' }),
      Student.countDocuments({ studentStatus: 'Graduated' }),
      Course.countDocuments(),
      Department.countDocuments(),
      Course.countDocuments({ courseStatus: 'Active' }),
      Department.countDocuments({ status: 'Active' }),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents,
        inactiveStudents,
        graduatedStudents,
        totalCourses,
        totalDepartments,
        activeCourses,
        activeDepartments,
        activeRatio: totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get distributions for dashboard and reports charts
// @route   GET /api/dashboard/distribution
// @access  Private
export const getDashboardDistribution = async (req, res, next) => {
  try {
    // 1. Students grouped by Department
    const departmentDistributionRaw = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$studentStatus', 'Active'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      { $unwind: { path: '$department', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$department.name', 'Unassigned'] },
          code: { $ifNull: ['$department.departmentId', 'N/A'] },
          students: '$count',
          count: '$count',
          activeStudents: '$active',
        },
      },
      { $sort: { students: -1 } },
    ]);

    // 2. Students grouped by Course
    const courseDistributionRaw = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: { $ifNull: ['$course.courseName', 'Unassigned'] },
          code: { $ifNull: ['$course.courseCode', 'N/A'] },
          students: '$count',
          count: '$count',
        },
      },
      { $sort: { students: -1 } },
    ]);

    // 3. Gender Distribution
    const genderDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          value: '$count',
        },
      },
    ]);

    // 4. Status Distribution
    const statusDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$studentStatus',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          value: '$count',
        },
      },
    ]);

    // 5. Semester Distribution
    const semesterDistribution = await Student.aggregate([
      {
        $group: {
          _id: '$semester',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          semester: { $concat: ['Sem ', { $toString: '$_id' }] },
          students: '$count',
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        byDepartment: departmentDistributionRaw,
        byCourse: courseDistributionRaw,
        byGender: genderDistribution,
        byStatus: statusDistribution,
        bySemester: semesterDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recently enrolled students
// @route   GET /api/dashboard/recent-students
// @access  Private
export const getRecentStudents = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 6;
    const students = await Student.find()
      .populate('department', 'departmentId name')
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent system activity audit trail
// @route   GET /api/dashboard/recent-activities
// @access  Private
export const getRecentActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
