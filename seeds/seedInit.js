import Admin from '../models/Admin.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import ActivityLog from '../models/ActivityLog.js';

export const autoSeedIfEmpty = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return; // Database already initialized
    }

    console.log('[AutoSeed] Empty database detected. Populating with initial demonstration records...');

    const admin = await Admin.create({
      name: 'Dr. Alok Verma',
      email: 'admin@studenthub.edu',
      password: 'AdminPassword123',
      role: 'superadmin',
    });

    const departments = await Department.create([
      {
        departmentId: 'DEP-BCA',
        name: 'Department of Computer Applications',
        headOfDepartment: 'Dr. Ramesh Sundaram',
        email: 'bca.dept@studenthub.edu',
        phone: '+91 98765 43210',
        description: 'Undergraduate and postgraduate computing, software development and applied computer science.',
        status: 'Active',
      },
      {
        departmentId: 'DEP-CSE',
        name: 'Department of Computer Science & Engineering',
        headOfDepartment: 'Dr. Priya Narang',
        email: 'cse.dept@studenthub.edu',
        phone: '+91 98765 43211',
        description: 'Core computing theories, system programming, algorithms, networks and AI systems.',
        status: 'Active',
      },
      {
        departmentId: 'DEP-IT',
        name: 'Department of Information Technology',
        headOfDepartment: 'Prof. Manish Gupta',
        email: 'it.dept@studenthub.edu',
        phone: '+91 98765 43212',
        description: 'Information security, enterprise infrastructure, cloud computing and database systems.',
        status: 'Active',
      },
      {
        departmentId: 'DEP-MGMT',
        name: 'Department of Management Studies',
        headOfDepartment: 'Dr. Sunita Kulkarni',
        email: 'mgmt.dept@studenthub.edu',
        phone: '+91 98765 43213',
        description: 'Business administration, financial analytics, human resources and business entrepreneurship.',
        status: 'Active',
      },
    ]);

    const bcaDept = departments[0];
    const cseDept = departments[1];
    const itDept = departments[2];
    const mgmtDept = departments[3];

    const courses = await Course.create([
      {
        courseCode: 'BCA-301',
        courseName: 'Bachelor of Computer Applications',
        department: bcaDept._id,
        duration: '3 Years / 6 Semesters',
        totalSemesters: 6,
        courseDescription: 'Comprehensive program covering programming languages, web development, databases, and software engineering.',
        courseStatus: 'Active',
      },
      {
        courseCode: 'MCA-501',
        courseName: 'Master of Computer Applications',
        department: bcaDept._id,
        duration: '2 Years / 4 Semesters',
        totalSemesters: 4,
        courseDescription: 'Advanced degree in computing architecture, cloud platforms, full-stack design, and machine intelligence.',
        courseStatus: 'Active',
      },
      {
        courseCode: 'BTECH-CS',
        courseName: 'B.Tech in Computer Science & Engineering',
        department: cseDept._id,
        duration: '4 Years / 8 Semesters',
        totalSemesters: 8,
        courseDescription: 'Rigorous engineering curriculum spanning algorithms, operating systems, compilers, and distributed systems.',
        courseStatus: 'Active',
      },
      {
        courseCode: 'BSC-IT',
        courseName: 'B.Sc in Information Technology',
        department: itDept._id,
        duration: '3 Years / 6 Semesters',
        totalSemesters: 6,
        courseDescription: 'Hands-on IT systems administration, cyber security fundamentals, network design and modern DevOps.',
        courseStatus: 'Active',
      },
      {
        courseCode: 'BBA-201',
        courseName: 'Bachelor of Business Administration',
        department: mgmtDept._id,
        duration: '3 Years / 6 Semesters',
        totalSemesters: 6,
        courseDescription: 'Undergraduate leadership program in organizational management, marketing principles, and corporate finance.',
        courseStatus: 'Active',
      },
    ]);

    const bcaCourse = courses[0];
    const mcaCourse = courses[1];
    const btechCourse = courses[2];
    const bscitCourse = courses[3];
    const bbaCourse = courses[4];

    await Student.create([
      {
        studentId: 'STU2024001',
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@studenthub.edu',
        phoneNumber: '+91 98112 34567',
        gender: 'Male',
        dateOfBirth: new Date('2003-05-14'),
        address: {
          street: '42 Sector 15',
          city: 'Noida',
          state: 'Uttar Pradesh',
          pincode: '201301',
          country: 'India',
        },
        department: bcaDept._id,
        course: bcaCourse._id,
        admissionDate: new Date('2024-07-15'),
        academicYear: '2024-2027',
        semester: 2,
        studentStatus: 'Active',
        parentDetails: {
          fatherName: 'Virender Sharma',
          motherName: 'Rekha Sharma',
          guardianContact: '+91 98112 99991',
          guardianEmail: 'virender.sharma@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'B+',
      },
      {
        studentId: 'STU2024002',
        fullName: 'Ananya Iyer',
        email: 'ananya.iyer@studenthub.edu',
        phoneNumber: '+91 98223 45678',
        gender: 'Female',
        dateOfBirth: new Date('2004-02-18'),
        address: {
          street: '12 Indiranagar 100ft Rd',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          country: 'India',
        },
        department: cseDept._id,
        course: btechCourse._id,
        admissionDate: new Date('2024-08-01'),
        academicYear: '2024-2028',
        semester: 2,
        studentStatus: 'Active',
        parentDetails: {
          fatherName: 'Suresh Iyer',
          motherName: 'Lakshmi Iyer',
          guardianContact: '+91 98223 99992',
          guardianEmail: 'suresh.iyer@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'O+',
      },
      {
        studentId: 'STU2023003',
        fullName: 'Rohan Mehra',
        email: 'rohan.mehra@studenthub.edu',
        phoneNumber: '+91 98334 56789',
        gender: 'Male',
        dateOfBirth: new Date('2002-11-09'),
        address: {
          street: '78 Model Town',
          city: 'Delhi',
          state: 'Delhi',
          pincode: '110009',
          country: 'India',
        },
        department: bcaDept._id,
        course: bcaCourse._id,
        admissionDate: new Date('2023-07-20'),
        academicYear: '2023-2026',
        semester: 4,
        studentStatus: 'Active',
        parentDetails: {
          fatherName: 'Rajeev Mehra',
          motherName: 'Anita Mehra',
          guardianContact: '+91 98334 99993',
          guardianEmail: 'rajeev.mehra@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'A+',
      },
      {
        studentId: 'STU2024004',
        fullName: 'Diya Patel',
        email: 'diya.patel@studenthub.edu',
        phoneNumber: '+91 98445 67890',
        gender: 'Female',
        dateOfBirth: new Date('2003-09-24'),
        address: {
          street: '23 CG Road, Navrangpura',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380009',
          country: 'India',
        },
        department: itDept._id,
        course: bscitCourse._id,
        admissionDate: new Date('2024-07-10'),
        academicYear: '2024-2027',
        semester: 2,
        studentStatus: 'Active',
        parentDetails: {
          fatherName: 'Bhavesh Patel',
          motherName: 'Nita Patel',
          guardianContact: '+91 98445 99994',
          guardianEmail: 'bhavesh.patel@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'AB+',
      },
      {
        studentId: 'STU2023005',
        fullName: 'Kabir Singhania',
        email: 'kabir.singhania@studenthub.edu',
        phoneNumber: '+91 98556 78901',
        gender: 'Male',
        dateOfBirth: new Date('2001-08-30'),
        address: {
          street: '88 Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400020',
          country: 'India',
        },
        department: bcaDept._id,
        course: mcaCourse._id,
        admissionDate: new Date('2023-08-15'),
        academicYear: '2023-2025',
        semester: 4,
        studentStatus: 'Active',
        parentDetails: {
          fatherName: 'Ashok Singhania',
          motherName: 'Geeta Singhania',
          guardianContact: '+91 98556 99995',
          guardianEmail: 'ashok.singhania@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'O-',
      },
      {
        studentId: 'STU2024006',
        fullName: 'Sneha Deshmukh',
        email: 'sneha.deshmukh@studenthub.edu',
        phoneNumber: '+91 98667 89012',
        gender: 'Female',
        dateOfBirth: new Date('2004-04-12'),
        address: {
          street: '15 FC Road',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411004',
          country: 'India',
        },
        department: mgmtDept._id,
        course: bbaCourse._id,
        admissionDate: new Date('2024-07-25'),
        academicYear: '2024-2027',
        semester: 2,
        studentStatus: 'Active',
        parentDetails: {
          fatherName: 'Vijay Deshmukh',
          motherName: 'Sunita Deshmukh',
          guardianContact: '+91 98667 99996',
          guardianEmail: 'vijay.deshmukh@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'B+',
      },
      {
        studentId: 'STU2022007',
        fullName: 'Vikram Joshi',
        email: 'vikram.joshi@studenthub.edu',
        phoneNumber: '+91 98778 90123',
        gender: 'Male',
        dateOfBirth: new Date('2001-01-19'),
        address: {
          street: '55 Civil Lines',
          city: 'Jaipur',
          state: 'Rajasthan',
          pincode: '302006',
          country: 'India',
        },
        department: cseDept._id,
        course: btechCourse._id,
        admissionDate: new Date('2022-08-01'),
        academicYear: '2022-2026',
        semester: 6,
        studentStatus: 'Inactive',
        parentDetails: {
          fatherName: 'Kailash Joshi',
          motherName: 'Sarita Joshi',
          guardianContact: '+91 98778 99997',
          guardianEmail: 'kailash.joshi@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'A-',
      },
      {
        studentId: 'STU2024008',
        fullName: 'Tanvi Nair',
        email: 'tanvi.nair@studenthub.edu',
        phoneNumber: '+91 98889 01234',
        gender: 'Female',
        dateOfBirth: new Date('2003-12-05'),
        address: {
          street: '9 Panampilly Nagar',
          city: 'Kochi',
          state: 'Kerala',
          pincode: '682036',
          country: 'India',
        },
        department: itDept._id,
        course: bscitCourse._id,
        admissionDate: new Date('2024-07-22'),
        academicYear: '2024-2027',
        semester: 2,
        studentStatus: 'Active',
        parentDetails: {
          fatherName: 'Muralidharan Nair',
          motherName: 'Devika Nair',
          guardianContact: '+91 98889 99998',
          guardianEmail: 'murali.nair@gmail.com',
          relationship: 'Father',
        },
        bloodGroup: 'O+',
      },
    ]);

    await ActivityLog.create([
      {
        action: 'SYSTEM',
        entity: 'SYSTEM',
        description: 'System initialization and schema synchronization completed.',
        user: admin._id,
        userName: admin.name,
      },
      {
        action: 'CREATE',
        entity: 'DEPARTMENT',
        description: 'Academic departments initialized (DEP-BCA, DEP-CSE, DEP-IT, DEP-MGMT).',
        user: admin._id,
        userName: admin.name,
      },
      {
        action: 'CREATE',
        entity: 'COURSE',
        description: 'Curriculum courses registered across academic departments.',
        user: admin._id,
        userName: admin.name,
      },
      {
        action: 'CREATE',
        entity: 'STUDENT',
        description: 'Enrolled initial batch of university students.',
        user: admin._id,
        userName: admin.name,
      },
    ]);

    console.log('[AutoSeed] Population complete! Demo administrator account ready.');
  } catch (error) {
    console.error('[AutoSeed] Error during auto-seeding:', error.message);
  }
};
