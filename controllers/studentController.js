import Student from '../models/Student.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import { logActivity } from '../utils/activityLogger.js';

// @desc    Get all students with search, filters, sorting & pagination
// @route   GET /api/students
// @access  Private
export const getStudents = async (req, res, next) => {
  try {
    const {
      search,
      department,
      course,
      status,
      semester,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    // Search query
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { studentId: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
      ];
    }

    // Filter by Department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by Course
    if (course && course !== 'All') {
      query.course = course;
    }

    // Filter by Status
    if (status && status !== 'All') {
      query.studentStatus = status;
    }

    // Filter by Semester
    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const limitNumber = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const totalStudents = await Student.countDocuments(query);

    const students = await Student.find(query)
      .populate('department', 'departmentId name')
      .populate('course', 'courseCode courseName')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    res.json({
      success: true,
      count: students.length,
      total: totalStudents,
      page: pageNumber,
      pages: Math.ceil(totalStudents / limitNumber) || 1,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Private
export const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('department', 'departmentId name headOfDepartment email phone')
      .populate('course', 'courseCode courseName duration totalSemesters');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
export const createStudent = async (req, res, next) => {
  try {
    const {
      studentId,
      fullName,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      address,
      department,
      course,
      admissionDate,
      academicYear,
      semester,
      studentStatus,
      parentDetails,
      bloodGroup,
    } = req.body;

    // Basic required field validations
    if (!studentId || !fullName || !email || !phoneNumber || !gender || !dateOfBirth || !department || !course || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields (Student ID, Name, Email, Phone, Gender, DOB, Department, Course, Academic Year)',
      });
    }

    // Check unique Student ID
    const studentIdExists = await Student.findOne({ studentId: studentId.toUpperCase().trim() });
    if (studentIdExists) {
      return res.status(400).json({
        success: false,
        message: `A student with Enrollment / Student ID "${studentId}" already exists.`,
      });
    }

    // Check unique Email
    const emailExists = await Student.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: `A student with email "${email}" is already registered.`,
      });
    }

    // Verify department and course exist
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected department does not exist',
      });
    }

    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Selected course does not exist',
      });
    }

    const student = await Student.create({
      studentId: studentId.toUpperCase().trim(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phoneNumber: phoneNumber.trim(),
      gender,
      dateOfBirth,
      address: address || { street: '', city: 'Default City', state: 'Default State', pincode: '', country: 'India' },
      department,
      course,
      admissionDate: admissionDate || Date.now(),
      academicYear: academicYear.trim(),
      semester: semester ? Number(semester) : 1,
      studentStatus: studentStatus || 'Active',
      parentDetails: parentDetails || {},
      bloodGroup: bloodGroup || 'O+',
    });

    const populatedStudent = await Student.findById(student._id)
      .populate('department', 'departmentId name')
      .populate('course', 'courseCode courseName');

    await logActivity({
      action: 'CREATE',
      entity: 'STUDENT',
      description: `Enrolled student: ${student.fullName} (${student.studentId}) in ${deptExists.name}`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.status(201).json({
      success: true,
      data: populatedStudent,
      message: 'Student registered successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private
export const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    const {
      studentId,
      fullName,
      email,
      phoneNumber,
      gender,
      dateOfBirth,
      address,
      department,
      course,
      admissionDate,
      academicYear,
      semester,
      studentStatus,
      parentDetails,
      bloodGroup,
    } = req.body;

    // Check unique Student ID if modified
    if (studentId && studentId.toUpperCase().trim() !== student.studentId) {
      const idExists = await Student.findOne({ studentId: studentId.toUpperCase().trim() });
      if (idExists) {
        return res.status(400).json({
          success: false,
          message: `Another student already uses Student ID "${studentId}".`,
        });
      }
      student.studentId = studentId.toUpperCase().trim();
    }

    // Check unique Email if modified
    if (email && email.toLowerCase().trim() !== student.email) {
      const emailExists = await Student.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: `Another student already uses email "${email}".`,
        });
      }
      student.email = email.toLowerCase().trim();
    }

    if (fullName) student.fullName = fullName.trim();
    if (phoneNumber) student.phoneNumber = phoneNumber.trim();
    if (gender) student.gender = gender;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (address) student.address = { ...student.address, ...address };
    if (department) student.department = department;
    if (course) student.course = course;
    if (admissionDate) student.admissionDate = admissionDate;
    if (academicYear) student.academicYear = academicYear.trim();
    if (semester !== undefined) student.semester = Number(semester);
    if (studentStatus) student.studentStatus = studentStatus;
    if (parentDetails) student.parentDetails = { ...student.parentDetails, ...parentDetails };
    if (bloodGroup) student.bloodGroup = bloodGroup;

    const updatedStudent = await student.save();
    const populated = await Student.findById(updatedStudent._id)
      .populate('department', 'departmentId name')
      .populate('course', 'courseCode courseName');

    await logActivity({
      action: 'UPDATE',
      entity: 'STUDENT',
      description: `Updated profile for student: ${populated.fullName} (${populated.studentId})`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.json({
      success: true,
      data: populated,
      message: 'Student record updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private
export const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
      });
    }

    await Student.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'DELETE',
      entity: 'STUDENT',
      description: `Removed student record: ${student.fullName} (${student.studentId})`,
      user: req.user._id,
      userName: req.user.name,
    });

    res.json({
      success: true,
      message: 'Student record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students formatted for CSV Export
// @route   GET /api/students/export/csv
// @access  Private
export const exportStudentsData = async (req, res, next) => {
  try {
    const students = await Student.find({})
      .populate('department', 'name departmentId')
      .populate('course', 'courseCode courseName')
      .sort({ studentId: 1 });

    const exportRows = students.map((s) => ({
      'Student ID': s.studentId,
      'Full Name': s.fullName,
      'Email': s.email,
      'Phone': s.phoneNumber,
      'Gender': s.gender,
      'Date of Birth': s.dateOfBirth ? new Date(s.dateOfBirth).toISOString().split('T')[0] : '',
      'Department': s.department ? `${s.department.name} (${s.department.departmentId})` : 'N/A',
      'Course': s.course ? `${s.course.courseName} (${s.course.courseCode})` : 'N/A',
      'Semester': s.semester,
      'Academic Year': s.academicYear,
      'Status': s.studentStatus,
      'Admission Date': s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '',
      'City': s.address?.city || '',
      'State': s.address?.state || '',
      'Father Name': s.parentDetails?.fatherName || '',
      'Mother Name': s.parentDetails?.motherName || '',
      'Guardian Contact': s.parentDetails?.guardianContact || '',
    }));

    res.json({
      success: true,
      data: exportRows,
    });
  } catch (error) {
    next(error);
  }
};
