// ==============================================================================
// GrantGlide – ScholarQuest: Smart Scholarship Discovery and Application Platform
// Built for Hackathon Demo & Production Prototype
// Zero-dependency Native Node.js Server with Full RESTful APIs and Static File Serving
// ==============================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for static files
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Helper: Read JSON from file
function readData(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return [];
  }
}

// Helper: Write JSON to file
function writeData(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
}

// Helper: Parse Request Body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Helper: Send JSON Response
function sendJSON(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(payload));
}

// Helper: Calculate days remaining
function calculateDaysLeft(deadlineStr) {
  const target = new Date(deadlineStr);
  const now = new Date();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Core Eligibility Engine (Module 4)
function evaluateEligibility(student, scholarship) {
  let score = 0;
  let totalCriteria = 5;
  const breakdown = [];

  // 1. Minimum Percentage / Academic Marks
  const studentMarks = parseFloat(student.percentage) || 0;
  const minRequired = scholarship.min_percentage || 50;
  if (studentMarks >= minRequired) {
    score += 1;
    breakdown.push({
      criterion: "Academic Performance",
      passed: true,
      student_value: `${studentMarks}%`,
      required_value: `Min ${minRequired}%`,
      explanation: `Your aggregate (${studentMarks}%) satisfies the qualifying threshold of ${minRequired}%.`
    });
  } else {
    breakdown.push({
      criterion: "Academic Performance",
      passed: false,
      student_value: `${studentMarks}%`,
      required_value: `Min ${minRequired}%`,
      explanation: `Requires a minimum of ${minRequired}%. Current aggregate is ${studentMarks}%.`
    });
  }

  // 2. Family Annual Income Limit
  const studentIncome = parseInt(student.family_income, 10) || 0;
  const maxIncome = scholarship.max_family_income || 9999999;
  if (studentIncome <= maxIncome) {
    score += 1;
    breakdown.push({
      criterion: "Annual Family Income",
      passed: true,
      student_value: `₹${studentIncome.toLocaleString('en-IN')}/yr`,
      required_value: maxIncome >= 9000000 ? "No Upper Limit" : `Max ₹${maxIncome.toLocaleString('en-IN')}/yr`,
      explanation: maxIncome >= 9000000 ? "Open to all income categories." : `Income falls comfortably below the ₹${maxIncome.toLocaleString('en-IN')} ceiling.`
    });
  } else {
    breakdown.push({
      criterion: "Annual Family Income",
      passed: false,
      student_value: `₹${studentIncome.toLocaleString('en-IN')}/yr`,
      required_value: `Max ₹${maxIncome.toLocaleString('en-IN')}/yr`,
      explanation: `Household income exceeds the ₹${maxIncome.toLocaleString('en-IN')} ceiling.`
    });
  }

  // 3. Social Category / Reservation
  const studentCat = student.category || 'General';
  const allowedCats = scholarship.categories || [];
  const catMatch = allowedCats.includes('All') || allowedCats.includes(studentCat);
  if (catMatch) {
    score += 1;
    breakdown.push({
      criterion: "Social Category",
      passed: true,
      student_value: studentCat,
      required_value: allowedCats.join(', '),
      explanation: `Category '${studentCat}' is designated as eligible for this scheme.`
    });
  } else {
    breakdown.push({
      criterion: "Social Category",
      passed: false,
      student_value: studentCat,
      required_value: allowedCats.join(', '),
      explanation: `Scholarship is reserved for [${allowedCats.join(', ')}].`
    });
  }

  // 4. Education Level
  const studentLevel = student.education_level || 'Undergraduate';
  const allowedLevels = scholarship.level || [];
  const levelMatch = allowedLevels.includes('All') || allowedLevels.includes(studentLevel);
  if (levelMatch) {
    score += 1;
    breakdown.push({
      criterion: "Education Level",
      passed: true,
      student_value: studentLevel,
      required_value: allowedLevels.join(', '),
      explanation: `Valid for students currently pursuing ${studentLevel}.`
    });
  } else {
    breakdown.push({
      criterion: "Education Level",
      passed: false,
      student_value: studentLevel,
      required_value: allowedLevels.join(', '),
      explanation: `Requires enrollment in [${allowedLevels.join(', ')}].`
    });
  }

  // 5. Gender
  const studentGender = student.gender || 'All';
  const reqGender = scholarship.gender || 'All';
  const genderMatch = (reqGender === 'All') || (reqGender.toLowerCase() === studentGender.toLowerCase());
  if (genderMatch) {
    score += 1;
    breakdown.push({
      criterion: "Gender Requirement",
      passed: true,
      student_value: studentGender,
      required_value: reqGender,
      explanation: reqGender === 'All' ? "Open to all genders." : `Applicant gender matches required: ${reqGender}.`
    });
  } else {
    breakdown.push({
      criterion: "Gender Requirement",
      passed: false,
      student_value: studentGender,
      required_value: reqGender,
      explanation: `Exclusive opportunity for ${reqGender} candidates.`
    });
  }

  // Calculate percentage
  const matchPercentage = Math.round((score / totalCriteria) * 100);
  let status = "Ineligible";
  if (matchPercentage === 100) {
    status = "100% Eligible";
  } else if (matchPercentage >= 60) {
    status = "Partially Eligible";
  }

  return {
    scholarship_id: scholarship.id,
    scholarship_name: scholarship.name,
    amount: scholarship.amount,
    provider: scholarship.provider,
    deadline: scholarship.deadline,
    score,
    totalCriteria,
    match_percentage: matchPercentage,
    status,
    breakdown,
    official_url: scholarship.official_url
  };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // GET /api/framework (Hackathon Framework Structure)
  if (pathname === '/api/framework' && method === 'GET') {
    return sendJson(res, 200, {
      success: true,
      project: {
        name: 'GrantGlide – ScholarQuest',
        type: 'Web-Based Scholarship Discovery and Management Platform',
        version: '1.0.0 Production Prototype'
      },
      technology_framework: {
        frontend: 'HTML',
        styling: 'CSS, Bootstrap 5.3',
        interactivity: 'JavaScript (ES6+)',
        backend: 'Python Flask & Node.js Native',
        database: 'MySQL (with JSON persistence engine fallback)',
        editor: 'VS Code'
      },
      system_architecture: {
        user_interface: 'HTML • CSS • Bootstrap • JavaScript',
        backend_server: 'Python • Flask RESTful API',
        business_logic: '5-Factor Eligibility Matching, Search, Application Tracking',
        authentication: 'Student Registration/Login and Admin Login',
        database_layer: 'MySQL (grantglide_db) – Student, Scholarship, Eligibility, and Application Records'
      },
      functional_framework: [
        { id: 1, name: 'User Authentication', description: 'Student registration and login.' },
        { id: 2, name: 'Student Profile', description: 'Academic, personal and eligibility details.' },
        { id: 3, name: 'Scholarship Management', description: 'Display and manage scholarship information.' },
        { id: 4, name: 'Eligibility Matching', description: 'Compare student details with scholarship requirements.' },
        { id: 5, name: 'Application Guidance', description: 'Provide application instructions and official links.' },
        { id: 6, name: 'Document Management', description: 'Display required document checklists.' },
        { id: 7, name: 'Notification System', description: 'Display upcoming deadlines and reminders.' },
        { id: 8, name: 'Admin Dashboard', description: 'Manage scholarship records and platform information.' }
      ],
      database_framework: [
        { table: 'students', columns: 'id, name, email, password_hash, phone, course, education_level, percentage, cgpa, family_income, category, gender, state, college, year_of_study, disability_status, single_girl_child, created_at' },
        { table: 'scholarships', columns: 'id, name, provider, type, subtype, amount, amount_val, deadline, status, description, official_url, portal_name, created_at' },
        { table: 'eligibility', columns: 'id, scholarship_id, income_limit, marks, category, course, gender, education_level' },
        { table: 'applications', columns: 'id, student_id, scholarship_id, status, application_no, submission_date, notes, created_at' },
        { table: 'documents', columns: 'id, document_name, requirement, upload_reference, category, issuing_authority, validity, how_to_obtain, common_rejection_reasons' },
        { table: 'notifications', columns: 'id, student_id, title, message, type, date, read_status' }
      ],
      working_framework: [
        '1. Student Registration',
        '2. Profile Information',
        '3. Scholarship Search',
        '4. Eligibility Verification',
        '5. Suitable Scholarships Displayed',
        '6. Application Guidance',
        '7. Application Status Tracking'
      ],
      development_phases: [
        { phase: 'Phase 1', work: 'Requirement analysis' },
        { phase: 'Phase 2', work: 'UI/UX design' },
        { phase: 'Phase 3', work: 'Frontend development' },
        { phase: 'Phase 4', work: 'Backend development' },
        { phase: 'Phase 5', work: 'Database integration' },
        { phase: 'Phase 6', work: 'Eligibility matching implementation' },
        { phase: 'Phase 7', work: 'Testing and debugging' },
        { phase: 'Phase 8', work: 'Final deployment and presentation' }
      ],
      expected_final_output: [
        'Student registration and login page',
        'Student dashboard',
        'Scholarship search page',
        'Eligibility checker',
        'Scholarship details page',
        'Application guidance page',
        'Deadline tracker',
        'Admin dashboard'
      ],
      future_scope: [
        'AI-based personalized scholarship recommendations',
        'Multilingual support',
        'Scholarship chatbot',
        'Mobile application',
        'Integration with verified government scholarship portals'
      ]
    });
  }

  // 1. GET /api/scholarships (with multi-filtering & search)
  if (pathname === '/api/scholarships' && method === 'GET') {
    let scholarships = readData('scholarships.json');
    const q = (parsedUrl.query.q || '').toLowerCase();
    const type = parsedUrl.query.type;
    const level = parsedUrl.query.level;
    const category = parsedUrl.query.category;
    const gender = parsedUrl.query.gender;
    const max_income = parsedUrl.query.max_income ? parseInt(parsedUrl.query.max_income, 10) : null;
    const min_percentage = parsedUrl.query.min_percentage ? parseFloat(parsedUrl.query.min_percentage) : null;

    // Recalculate days_left dynamically
    scholarships = scholarships.map(s => {
      const days = calculateDaysLeft(s.deadline);
      return {
        ...s,
        days_left: days,
        urgency: days <= 7 ? 'Urgent' : (days <= 20 ? 'Approaching' : 'Active')
      };
    });

    if (q) {
      scholarships = scholarships.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    if (type && type !== 'All') {
      scholarships = scholarships.filter(s => s.type.toLowerCase() === type.toLowerCase());
    }
    if (level && level !== 'All') {
      scholarships = scholarships.filter(s => s.level.includes('All') || s.level.includes(level));
    }
    if (category && category !== 'All') {
      scholarships = scholarships.filter(s => s.categories.includes('All') || s.categories.includes(category));
    }
    if (gender && gender !== 'All') {
      scholarships = scholarships.filter(s => s.gender === 'All' || s.gender.toLowerCase() === gender.toLowerCase());
    }
    if (max_income) {
      scholarships = scholarships.filter(s => s.max_family_income >= max_income);
    }
    if (min_percentage) {
      scholarships = scholarships.filter(s => s.min_percentage <= min_percentage);
    }

    sendJSON(res, 200, { success: true, count: scholarships.length, data: scholarships });
    return;
  }

  // 2. GET /api/scholarships/:id
  if (pathname.startsWith('/api/scholarships/') && method === 'GET') {
    const id = pathname.split('/')[3];
    const scholarships = readData('scholarships.json');
    const found = scholarships.find(s => s.id === id);
    if (!found) {
      sendJSON(res, 404, { success: false, message: 'Scholarship not found' });
      return;
    }
    found.days_left = calculateDaysLeft(found.deadline);
    sendJSON(res, 200, { success: true, data: found });
    return;
  }

  // 3. POST /api/scholarships (Admin create)
  if (pathname === '/api/scholarships' && method === 'POST') {
    const body = await parseBody(req);
    const scholarships = readData('scholarships.json');
    const newId = `sch-${Date.now().toString().slice(-4)}`;
    const newSch = {
      id: newId,
      name: body.name || "Untitled Scholarship",
      provider: body.provider || "Scholarship Body",
      type: body.type || "Government",
      subtype: body.subtype || "Central",
      level: Array.isArray(body.level) ? body.level : [body.level || "Undergraduate"],
      courses: Array.isArray(body.courses) ? body.courses : ["All"],
      min_percentage: parseFloat(body.min_percentage) || 50,
      max_family_income: parseInt(body.max_family_income, 10) || 500000,
      categories: Array.isArray(body.categories) ? body.categories : [body.category || "General"],
      gender: body.gender || "All",
      amount: body.amount || "₹25,000 / year",
      amount_val: parseInt(body.amount_val, 10) || 25000,
      deadline: body.deadline || "2026-12-31",
      days_left: calculateDaysLeft(body.deadline || "2026-12-31"),
      status: "Active",
      description: body.description || "",
      official_url: body.official_url || "https://scholarships.gov.in/",
      portal_name: body.portal_name || "Official Portal",
      documents_required: body.documents_required || ["Aadhaar Card", "Marksheet", "Income Certificate"],
      application_steps: body.application_steps || ["Submit online", "Verify documents"]
    };
    scholarships.unshift(newSch);
    writeData('scholarships.json', scholarships);
    sendJSON(res, 201, { success: true, message: 'Scholarship created successfully', data: newSch });
    return;
  }

  // 4. PUT /api/scholarships/:id (Admin edit)
  if (pathname.startsWith('/api/scholarships/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    const body = await parseBody(req);
    const scholarships = readData('scholarships.json');
    const index = scholarships.findIndex(s => s.id === id);
    if (index === -1) {
      sendJSON(res, 404, { success: false, message: 'Scholarship not found' });
      return;
    }
    scholarships[index] = { ...scholarships[index], ...body, id };
    writeData('scholarships.json', scholarships);
    sendJSON(res, 200, { success: true, message: 'Scholarship updated successfully', data: scholarships[index] });
    return;
  }

  // 5. DELETE /api/scholarships/:id (Admin delete)
  if (pathname.startsWith('/api/scholarships/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    let scholarships = readData('scholarships.json');
    const initialLen = scholarships.length;
    scholarships = scholarships.filter(s => s.id !== id);
    if (scholarships.length === initialLen) {
      sendJSON(res, 404, { success: false, message: 'Scholarship not found' });
      return;
    }
    writeData('scholarships.json', scholarships);
    sendJSON(res, 200, { success: true, message: 'Scholarship deleted successfully' });
    return;
  }

  // 6. POST /api/eligibility/check (Smart Eligibility Engine)
  if (pathname === '/api/eligibility/check' && method === 'POST') {
    const student = await parseBody(req);
    const scholarships = readData('scholarships.json');
    
    const results = scholarships.map(sch => evaluateEligibility(student, sch));
    // Sort by match percentage descending, then by amount
    results.sort((a, b) => b.match_percentage - a.match_percentage);

    const eligibleCount = results.filter(r => r.match_percentage === 100).length;
    const partialCount = results.filter(r => r.match_percentage >= 60 && r.match_percentage < 100).length;

    sendJSON(res, 200, {
      success: true,
      summary: {
        total_analyzed: results.length,
        fully_eligible: eligibleCount,
        partially_eligible: partialCount,
        ineligible: results.length - eligibleCount - partialCount
      },
      results
    });
    return;
  }

  // 7. POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    const body = await parseBody(req);
    const { email, password, role } = body;

    // Admin login shortcut
    if (role === 'admin' || email === 'admin@grantglide.edu') {
      if (password === 'admin123' || password === 'admin') {
        sendJSON(res, 200, {
          success: true,
          role: 'admin',
          user: {
            id: 'adm-001',
            name: 'Hackathon Admin Evaluator',
            email: 'admin@grantglide.edu',
            role: 'admin'
          }
        });
        return;
      }
    }

    const students = readData('students.json');
    const student = students.find(s => s.email.toLowerCase() === (email || '').toLowerCase());
    if (student && student.password === password) {
      const { password, ...safeUser } = student;
      sendJSON(res, 200, { success: true, role: 'student', user: safeUser });
      return;
    }

    // Default demo fallback if credentials don't match
    sendJSON(res, 401, { success: false, message: 'Invalid email or password. Use demo account or password123.' });
    return;
  }

  // 8. POST /api/auth/register
  if (pathname === '/api/auth/register' && method === 'POST') {
    const body = await parseBody(req);
    const students = readData('students.json');
    const existing = students.find(s => s.email.toLowerCase() === (body.email || '').toLowerCase());
    if (existing) {
      sendJSON(res, 400, { success: false, message: 'An account with this email already exists' });
      return;
    }

    const newStudent = {
      id: `std-${Date.now().toString().slice(-4)}`,
      name: body.name || "Student User",
      email: body.email,
      password: body.password || "password123",
      phone: body.phone || "+91 98000 00000",
      course: body.course || "Undergraduate Degree",
      education_level: body.education_level || "Undergraduate",
      percentage: parseFloat(body.percentage) || 75.0,
      cgpa: body.cgpa || "8.0",
      family_income: parseInt(body.family_income, 10) || 300000,
      category: body.category || "General",
      gender: body.gender || "All",
      state: body.state || "Delhi",
      college: body.college || "University College",
      year_of_study: body.year_of_study || "1st Year",
      disability_status: body.disability_status || "No",
      single_girl_child: body.single_girl_child || "No",
      created_at: new Date().toISOString().split('T')[0]
    };

    students.push(newStudent);
    writeData('students.json', students);
    const { password, ...safeStudent } = newStudent;
    sendJSON(res, 201, { success: true, message: 'Registration successful', user: safeStudent });
    return;
  }

  // 9. GET /api/auth/profile
  if (pathname === '/api/auth/profile' && method === 'GET') {
    const id = parsedUrl.query.id || 'std-101';
    const students = readData('students.json');
    const found = students.find(s => s.id === id);
    if (!found) {
      sendJSON(res, 404, { success: false, message: 'Profile not found' });
      return;
    }
    const { password, ...safeUser } = found;
    sendJSON(res, 200, { success: true, user: safeUser });
    return;
  }

  // 10. PUT /api/auth/profile
  if (pathname === '/api/auth/profile' && method === 'PUT') {
    const body = await parseBody(req);
    const id = body.id || 'std-101';
    const students = readData('students.json');
    const index = students.findIndex(s => s.id === id);
    if (index === -1) {
      sendJSON(res, 404, { success: false, message: 'Student not found' });
      return;
    }
    students[index] = { ...students[index], ...body };
    writeData('students.json', students);
    const { password, ...safeUser } = students[index];
    sendJSON(res, 200, { success: true, message: 'Profile updated successfully', user: safeUser });
    return;
  }

  // 11. GET /api/applications (Tracked applications)
  if (pathname === '/api/applications' && method === 'GET') {
    const studentId = parsedUrl.query.student_id || 'std-101';
    const applications = readData('applications.json');
    const scholarships = readData('scholarships.json');
    
    const userApps = applications
      .filter(a => a.student_id === studentId)
      .map(app => {
        const sch = scholarships.find(s => s.id === app.scholarship_id) || {};
        return {
          ...app,
          scholarship_name: sch.name || "Unknown Scholarship",
          provider: sch.provider || "Government / Trust",
          amount: sch.amount || "N/A",
          official_url: sch.official_url || "#",
          days_left: sch.deadline ? calculateDaysLeft(sch.deadline) : 0
        };
      });

    sendJSON(res, 200, { success: true, count: userApps.length, data: userApps });
    return;
  }

  // 12. POST /api/applications (Add to tracker)
  if (pathname === '/api/applications' && method === 'POST') {
    const body = await parseBody(req);
    const applications = readData('applications.json');
    
    // Check if already tracking
    const exists = applications.find(a => a.student_id === (body.student_id || 'std-101') && a.scholarship_id === body.scholarship_id);
    if (exists) {
      sendJSON(res, 400, { success: false, message: 'This scholarship is already in your application tracker' });
      return;
    }

    const newApp = {
      id: `app-${Date.now().toString().slice(-4)}`,
      student_id: body.student_id || 'std-101',
      scholarship_id: body.scholarship_id,
      status: body.status || 'Saved',
      application_no: body.application_no || '',
      submission_date: body.submission_date || '',
      deadline: body.deadline || '',
      notes: body.notes || 'Added to tracker from discovery catalog.',
      documents_completed: body.documents_completed || [],
      created_at: new Date().toISOString().split('T')[0]
    };
    applications.push(newApp);
    writeData('applications.json', applications);
    sendJSON(res, 201, { success: true, message: 'Added to Application Tracker', data: newApp });
    return;
  }

  // 13. PUT /api/applications/:id (Update status/notes)
  if (pathname.startsWith('/api/applications/') && method === 'PUT') {
    const id = pathname.split('/')[3];
    const body = await parseBody(req);
    const applications = readData('applications.json');
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) {
      sendJSON(res, 404, { success: false, message: 'Application not found' });
      return;
    }
    applications[index] = { ...applications[index], ...body, id };
    writeData('applications.json', applications);
    sendJSON(res, 200, { success: true, message: 'Application updated', data: applications[index] });
    return;
  }

  // 14. DELETE /api/applications/:id
  if (pathname.startsWith('/api/applications/') && method === 'DELETE') {
    const id = pathname.split('/')[3];
    let applications = readData('applications.json');
    applications = applications.filter(a => a.id !== id);
    writeData('applications.json', applications);
    sendJSON(res, 200, { success: true, message: 'Removed from tracker' });
    return;
  }

  // 15. GET /api/documents (Master Document Repository)
  if (pathname === '/api/documents' && method === 'GET') {
    const documents = readData('documents.json');
    sendJSON(res, 200, { success: true, count: documents.length, data: documents });
    return;
  }

  // 16. GET /api/deadlines (Sorted upcoming deadlines with countdown)
  if (pathname === '/api/deadlines' && method === 'GET') {
    const scholarships = readData('scholarships.json');
    const deadlineList = scholarships.map(s => {
      const days = calculateDaysLeft(s.deadline);
      return {
        id: s.id,
        name: s.name,
        provider: s.provider,
        amount: s.amount,
        deadline: s.deadline,
        days_left: days,
        urgency: days <= 7 ? 'Urgent' : (days <= 20 ? 'Approaching' : 'Active'),
        official_url: s.official_url
      };
    }).sort((a, b) => a.days_left - b.days_left);

    sendJSON(res, 200, { success: true, data: deadlineList });
    return;
  }

  // 17. GET /api/notifications
  if (pathname === '/api/notifications' && method === 'GET') {
    const notifs = readData('notifications.json');
    sendJSON(res, 200, { success: true, data: notifs });
    return;
  }

  // 18. GET /api/stats (Platform Dashboard Metrics)
  if (pathname === '/api/stats' && method === 'GET') {
    const scholarships = readData('scholarships.json');
    const students = readData('students.json');
    const applications = readData('applications.json');

    const totalPotentialAmount = scholarships.reduce((acc, curr) => acc + (curr.amount_val || 0), 0);
    const activeDeadlines = scholarships.filter(s => calculateDaysLeft(s.deadline) > 0).length;

    sendJSON(res, 200, {
      success: true,
      stats: {
        total_scholarships: scholarships.length,
        active_deadlines: activeDeadlines,
        total_students: students.length,
        tracked_applications: applications.length,
        potential_funds: totalPotentialAmount,
        potential_funds_formatted: `₹${(totalPotentialAmount / 100000).toFixed(1)} Lakhs+`
      }
    });
    return;
  }

  // 19. GET /api/admin/overview
  if (pathname === '/api/admin/overview' && method === 'GET') {
    const scholarships = readData('scholarships.json');
    const students = readData('students.json');
    const applications = readData('applications.json');

    sendJSON(res, 200, {
      success: true,
      scholarships,
      students: students.map(s => {
        const { password, ...safe } = s;
        return safe;
      }),
      applications
    });
    return;
  }

  // ==========================================
  // STATIC FILE SERVING
  // ==========================================
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  // Security: prevent directory traversal
  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(PUBLIC_DIR, safePath);

  // If file doesn't exist, fallback to index.html for SPA routing
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 GrantGlide – ScholarQuest Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`💡 Zero external dependencies required!`);
  console.log(`=======================================================`);
});
