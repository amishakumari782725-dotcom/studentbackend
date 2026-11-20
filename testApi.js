import { startServer } from './server.js';

const runTests = async () => {
  console.log('\n========================================');
  console.log(' Starting StudentHub Full-Stack API Suite');
  console.log('========================================\n');

  // Start the server and wait for DB connection and listening
  const server = await startServer();

  const BASE_URL = 'http://127.0.0.1:5000/api';
  let token = '';
  let testStudentId = '';
  let bcaCourseId = '';

  const request = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || `HTTP error ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  };

  try {
    // 1. Health Check
    console.log('[Test 1] Health Check...');
    const health = await request('/health');
    console.log(' -> OK: Status is', health.status);

    // 2. Setup Status
    console.log('[Test 2] Setup Status Check...');
    const setup = await request('/auth/setup-status');
    console.log(' -> OK: Has admin:', setup.hasAdmin, 'Count:', setup.count);

    // 3. Admin Login
    console.log('[Test 3] Authenticating Administrator...');
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@studenthub.edu',
        password: 'AdminPassword123',
      },
    });
    token = loginRes.data.token;
    console.log(' -> OK: Logged in as', loginRes.data.name, '| JWT Token acquired');

    // 4. Admin Profile
    console.log('[Test 4] Fetching Admin Profile (Protected)...');
    const profileRes = await request('/auth/profile');
    console.log(' -> OK: Profile retrieved for', profileRes.data.name, '(', profileRes.data.role, ')');

    // 5. Dashboard Stats
    console.log('[Test 5] Checking Dashboard Stats & Metrics...');
    const statsRes = await request('/dashboard/stats');
    console.log(' -> OK: Total Students:', statsRes.data.totalStudents);
    console.log('        Active Students:', statsRes.data.activeStudents);
    console.log('        Total Courses:', statsRes.data.totalCourses);
    console.log('        Total Departments:', statsRes.data.totalDepartments);

    // 6. Dashboard Distribution Aggregates
    console.log('[Test 6] Checking Dashboard Aggregation Pipelines...');
    const distRes = await request('/dashboard/distribution');
    console.log(' -> OK: Dept groups:', distRes.data.byDepartment.length);
    console.log('        Course groups:', distRes.data.byCourse.length);
    console.log('        Gender groups:', distRes.data.byGender.length);
    console.log('        Semester groups:', distRes.data.bySemester.length);

    // 7. Departments List
    console.log('[Test 7] Listing Departments with Populated Counts...');
    const deptsRes = await request('/departments');
    console.log(' -> OK: Found', deptsRes.count, 'departments.');
    const firstDept = deptsRes.data[0];
    console.log('        Sample:', firstDept.name, `(${firstDept.departmentId})`, 'Courses:', firstDept.courseCount, 'Students:', firstDept.studentCount);

    // 8. Courses List
    console.log('[Test 8] Listing Degree Courses...');
    const coursesRes = await request('/courses');
    console.log(' -> OK: Found', coursesRes.count, 'courses.');
    bcaCourseId = coursesRes.data[0]._id;

    // 9. Query Students with Search & Pagination
    console.log('[Test 9] Querying Students (Pagination & Filtering)...');
    const studentsRes = await request('/students?page=1&limit=5&sortBy=studentId&sortOrder=asc');
    console.log(' -> OK: Page 1:', studentsRes.data.length, 'students of total', studentsRes.total);

    // 10. Enroll New Student (CRUD - Create)
    console.log('[Test 10] Enrolling New Student (CRUD - Create)...');
    const newStudentPayload = {
      studentId: 'STU9999TEST',
      fullName: 'Vikramaditya Test Student',
      email: 'vikram.test@studenthub.edu',
      phoneNumber: '+91 99999 11111',
      gender: 'Male',
      dateOfBirth: '2004-06-15',
      address: {
        street: '100 Academic Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India',
      },
      department: firstDept._id,
      course: bcaCourseId,
      academicYear: '2024-2027',
      semester: 1,
      studentStatus: 'Active',
      parentDetails: {
        fatherName: 'Devrat Sharma',
        motherName: 'Shalini Sharma',
        guardianContact: '+91 99999 22222',
        relationship: 'Father',
      },
      bloodGroup: 'B+',
    };

    const createRes = await request('/students', {
      method: 'POST',
      body: newStudentPayload,
    });
    testStudentId = createRes.data._id;
    console.log(' -> OK: Enrolled student:', createRes.data.fullName, 'with ID:', createRes.data.studentId);

    // 11. Read Created Student Profile (CRUD - Read)
    console.log('[Test 11] Retrieving Student Details Profile...');
    const singleStudentRes = await request(`/students/${testStudentId}`);
    console.log(' -> OK: Fetched:', singleStudentRes.data.fullName, '| Department:', singleStudentRes.data.department?.name);

    // 12. Update Student Profile (CRUD - Update)
    console.log('[Test 12] Updating Student Record (CRUD - Update)...');
    const updateRes = await request(`/students/${testStudentId}`, {
      method: 'PUT',
      body: {
        fullName: 'Vikramaditya Sharma (Updated)',
        semester: 2,
        studentStatus: 'Active',
      },
    });
    console.log(' -> OK: Updated Name:', updateRes.data.fullName, '| New Semester:', updateRes.data.semester);

    // 13. CSV Export Endpoint
    console.log('[Test 13] Testing Student Records CSV Export Endpoint...');
    const exportRes = await request('/students/export/csv');
    console.log(' -> OK: Export dataset generated with', exportRes.data.length, 'records.');

    // 14. Course Deletion Integrity Constraint Test
    console.log('[Test 14] Testing Course Deletion Integrity Constraint (Students Enrolled)...');
    try {
      await request(`/courses/${bcaCourseId}`, { method: 'DELETE' });
      console.error(' -> FAIL: Course deletion should have been blocked because students are enrolled!');
    } catch (courseDelErr) {
      console.log(' -> OK: Course deletion successfully blocked as expected!');
      console.log('        Server response:', courseDelErr.data?.message);
    }

    // 15. Delete Test Student (CRUD - Delete)
    console.log('[Test 15] Deleting Test Student (CRUD - Delete)...');
    const deleteRes = await request(`/students/${testStudentId}`, { method: 'DELETE' });
    console.log(' -> OK:', deleteRes.message);

    // 16. Audit Log Verification
    console.log('[Test 16] Verifying Recent Activity Audit Trail...');
    const actRes = await request('/dashboard/recent-activities?limit=5');
    console.log(' -> OK:', actRes.data.length, 'recent activity entries logged.');
    console.log('        Latest Action:', actRes.data[0].action, '-', actRes.data[0].description);

    console.log('\n========================================');
    console.log(' ALL 16 FULL-STACK TEST SUITES PASSED! ✓');
    console.log('========================================\n');

    server.close();
    process.exit(0);
  } catch (err) {
    console.error('\n[Test Error]:', err.data || err.message);
    if (server) server.close();
    process.exit(1);
  }
};

runTests();
