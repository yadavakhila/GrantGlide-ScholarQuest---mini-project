-- ==============================================================================
-- GrantGlide – ScholarQuest: Relational Database Schema & Seed Data
-- Database Framework: MySQL 5.7+ / 8.0+ / MariaDB
-- Structure:
--   1. students      : Student ID, name, email, course, academic & social profile
--   2. scholarships  : Scholarship ID, name, provider, amount, deadline, portal
--   3. eligibility   : Income limit, marks, category, course, gender criteria
--   4. applications  : Student ID, scholarship ID, status, tracking details
--   5. documents     : Document name, requirement, upload reference, authority
--   6. notifications : Notification ID, message, date, alert status
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS grantglide_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE grantglide_db;

-- ------------------------------------------------------------------------------
-- 1. Students Table (Module 1 & 2: User Authentication & Student Profile)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS eligibility;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS scholarships;
DROP TABLE IF EXISTS students;

CREATE TABLE students (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT '+91 98000 00000',
    course VARCHAR(150) NOT NULL,
    education_level VARCHAR(50) NOT NULL,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 60.00,
    cgpa VARCHAR(10) DEFAULT '8.0',
    family_income INT NOT NULL DEFAULT 300000,
    category VARCHAR(50) NOT NULL DEFAULT 'General',
    gender VARCHAR(20) NOT NULL DEFAULT 'All',
    state VARCHAR(100) DEFAULT 'Delhi',
    college VARCHAR(200) DEFAULT 'National Institute of Technology',
    year_of_study VARCHAR(30) DEFAULT '2nd Year',
    disability_status ENUM('Yes', 'No') DEFAULT 'No',
    single_girl_child ENUM('Yes', 'No') DEFAULT 'No',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. Scholarships Table (Module 3 & 8: Scholarship Management & Admin)
-- ------------------------------------------------------------------------------
CREATE TABLE scholarships (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(200) NOT NULL,
    type ENUM('Government', 'Private') NOT NULL,
    subtype VARCHAR(100) DEFAULT 'Central',
    amount VARCHAR(100) NOT NULL,
    amount_val INT NOT NULL,
    deadline DATE NOT NULL,
    status ENUM('Active', 'Urgent', 'Approaching', 'Expired') DEFAULT 'Active',
    description TEXT,
    official_url VARCHAR(255) DEFAULT 'https://scholarships.gov.in/',
    portal_name VARCHAR(150) DEFAULT 'National Scholarship Portal (NSP)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. Eligibility Table (Module 4: Eligibility Matching Engine)
--    Suggested Table: Income limit, marks, category, course
-- ------------------------------------------------------------------------------
CREATE TABLE eligibility (
    id VARCHAR(36) PRIMARY KEY,
    scholarship_id VARCHAR(36) NOT NULL,
    income_limit INT DEFAULT 9999999,
    marks DECIMAL(5,2) DEFAULT 50.00,
    category VARCHAR(255) DEFAULT 'All',
    course VARCHAR(255) DEFAULT 'All',
    gender ENUM('All', 'Female', 'Male') DEFAULT 'All',
    education_level VARCHAR(255) DEFAULT 'All',
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 4. Applications Table (Module 6: Application Guidance & Status Tracking)
--    Suggested Table: Student ID, scholarship ID, status
-- ------------------------------------------------------------------------------
CREATE TABLE applications (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    scholarship_id VARCHAR(36) NOT NULL,
    status ENUM('Saved', 'In Progress', 'Submitted', 'Under Review', 'Awarded') DEFAULT 'Saved',
    application_no VARCHAR(100) DEFAULT '',
    submission_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (scholarship_id) REFERENCES scholarships(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------------------------
-- 5. Documents Table (Module 6: Document Management & Anti-Rejection Checklist)
--    Suggested Table: Document name, requirement, upload reference
-- ------------------------------------------------------------------------------
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    document_name VARCHAR(150) NOT NULL,
    requirement VARCHAR(255) NOT NULL,
    upload_reference VARCHAR(255) DEFAULT 'DigiLocker / Scanned PDF (<=200KB)',
    category VARCHAR(50) NOT NULL,
    issuing_authority VARCHAR(255),
    validity VARCHAR(100),
    how_to_obtain TEXT,
    common_rejection_reasons TEXT
);

-- ------------------------------------------------------------------------------
-- 6. Notifications Table (Module 7: Notification System & Deadline Alerts)
--    Suggested Table: Notification ID, message, date
-- ------------------------------------------------------------------------------
CREATE TABLE notifications (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) DEFAULT 'All',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('Urgent', 'Warning', 'Success', 'Info') DEFAULT 'Info',
    date DATE NOT NULL,
    read_status BOOLEAN DEFAULT FALSE
);

-- ==============================================================================
-- SEED DATA: Pre-populating Demo Records for Instant Testing
-- ==============================================================================

-- 1. Seed Students
INSERT INTO students (id, name, email, password_hash, phone, course, education_level, percentage, cgpa, family_income, category, gender, state, college, year_of_study, disability_status, single_girl_child) VALUES
('std-101', 'Aarav Sharma', 'aarav.sharma@example.edu', 'password123', '+91 98765 43210', 'B.Tech Computer Science', 'Undergraduate', 84.50, '8.6', 320000, 'General', 'Male', 'Delhi', 'Delhi Technological University (DTU)', '2nd Year', 'No', 'No'),
('std-102', 'Priya Verma', 'priya.verma@example.edu', 'password123', '+91 98223 34455', 'B.Tech Information Technology', 'Undergraduate', 88.20, '9.1', 210000, 'OBC', 'Female', 'Maharashtra', 'COEP Technological University, Pune', '3rd Year', 'No', 'Yes'),
('std-103', 'Rahul Kumar', 'rahul.kumar@example.edu', 'password123', '+91 97112 23344', 'Diploma in Mechanical Engineering', 'Diploma', 76.00, '7.8', 180000, 'SC', 'Male', 'Uttar Pradesh', 'Government Polytechnic Lucknow', 'Final Year', 'No', 'No');

-- 2. Seed Scholarships
INSERT INTO scholarships (id, name, provider, type, subtype, amount, amount_val, deadline, status, description, official_url, portal_name) VALUES
('sch-001', 'Central Sector Scheme of Scholarships for College and University Students', 'Ministry of Education (Govt. of India)', 'Government', 'Central', '₹20,000 / year', 20000, '2026-12-15', 'Active', 'Financial assistance to meritorious students from low-income families to meet day-to-day expenses while pursuing higher studies in colleges and universities.', 'https://scholarships.gov.in/', 'National Scholarship Portal (NSP)'),
('sch-002', 'AICTE Pragati Scholarship Scheme for Girl Students', 'All India Council for Technical Education (AICTE)', 'Government', 'Central', '₹50,000 / year', 50000, '2026-11-30', 'Urgent', 'Empowers young women pursuing technical degrees (B.Tech / B.E. / Architecture / Pharmacy) in AICTE-approved institutions with tuition and contingency support.', 'https://www.aicte-india.org/', 'National Scholarship Portal (NSP)'),
('sch-003', 'Reliance Foundation Undergraduate Scholarship', 'Reliance Foundation (Corporate CSR)', 'Private', 'Corporate', '₹2,00,000 total (₹50k/yr)', 200000, '2026-11-25', 'Urgent', 'Merit-cum-means scholarship for first-year undergraduate students across any stream with leadership potential and community mindset.', 'https://www.reliancefoundation.org/', 'Reliance Foundation Portal'),
('sch-004', 'Post-Matric Scholarship for SC/ST Students', 'Ministry of Social Justice & Empowerment', 'Government', 'Central-State Shared', '100% Tuition + ₹1,200/mo', 75000, '2026-12-05', 'Active', 'Complete fee waiver, exam fee reimbursement, and monthly maintenance allowance for Scheduled Caste & Tribe candidates studying in recognized post-matric institutes.', 'https://scholarships.gov.in/', 'National Scholarship Portal (NSP)'),
('sch-005', 'HDFC Bank Parivartan ECSS Programme', 'HDFC Bank CSR Educational Crisis Support', 'Private', 'Corporate', 'Up to ₹75,000 / year', 75000, '2026-11-22', 'Urgent', 'Aimed at supporting meritorious and needy students facing sudden family or financial crisis to prevent education dropouts across school, diploma, and degree levels.', 'https://www.hdfcbank.com/', 'Buddy4Study Portal'),
('sch-006', 'INSPIRE Scholarship for Higher Education (SHE)', 'Department of Science and Technology (DST, India)', 'Government', 'Central', '₹80,000 / year', 80000, '2026-12-20', 'Active', 'Prestigious government fellowship for top 1% meritorious students pursuing Natural and Basic Sciences (B.Sc., B.S., Int. M.Sc.) at recognized universities.', 'https://online-inspire.gov.in/', 'DST INSPIRE Portal'),
('sch-007', 'Tata Trusts Medical and Healthcare Scholarship', 'Sir Ratan Tata Trust & Allied Trusts', 'Private', 'Foundation', '₹50,000 – ₹1,00,000 / year', 100000, '2026-12-05', 'Active', 'Financial grant for students pursuing undergraduate and postgraduate degrees in Medicine, Dentistry, Nursing, and allied healthcare sciences across India.', 'https://www.tatatrusts.org/', 'Tata Trusts Portal'),
('sch-008', 'Begum Hazrat Mahal National Scholarship for Minority Girls', 'Maulana Azad Education Foundation (MoMA)', 'Government', 'Central', '₹6,000 / year', 6000, '2026-11-28', 'Approaching', 'Financial assistance to girl students belonging to notified minority communities (Muslims, Christians, Sikhs, Buddhists, Jains, Parsis) studying in classes 9 to 12.', 'https://scholarships.gov.in/', 'National Scholarship Portal (NSP)'),
('sch-009', 'Adobe India Women-in-Technology Scholarship', 'Adobe India', 'Private', 'Corporate Tech', '₹1,00,000 + Tech Internship', 100000, '2026-12-10', 'Active', 'Aimed at identifying talented female college students in Computer Science, Artificial Intelligence, and Software Engineering with full internship opportunities.', 'https://www.adobe.com/', 'Adobe Careers Portal'),
('sch-010', 'State Pre-Matric & Post-Matric OBC Welfare Scholarship', 'State Backward Classes Welfare Department', 'Government', 'State', '₹15,000 / year', 15000, '2026-12-31', 'Active', 'State-sponsored welfare scholarship providing tuition fees reimbursement and textbook allowances for Other Backward Class students.', 'https://scholarships.gov.in/', 'State Welfare Portal'),
('sch-011', 'AICTE Saksham Scholarship for Differently-Abled Students', 'All India Council for Technical Education (AICTE)', 'Government', 'Central', '₹50,000 / year', 50000, '2026-11-30', 'Urgent', 'Specially designed to encourage and support differently-abled students with disability >= 40% pursuing technical degrees or diplomas in AICTE institutions.', 'https://www.aicte-india.org/', 'National Scholarship Portal (NSP)'),
('sch-012', 'Vidyasaarathi ACC Vidyasaarathi Scholarship', 'ACC Limited CSR Foundation', 'Private', 'Corporate', '₹30,000 / year', 30000, '2026-12-02', 'Approaching', 'Corporate social responsibility grant for students pursuing undergraduate engineering, ITI, or general degree courses from rural and semi-urban communities.', 'https://www.vidyasaarathi.co.in/', 'Vidyasaarathi Portal');

-- 3. Seed Eligibility Criteria (Module 4)
INSERT INTO eligibility (id, scholarship_id, income_limit, marks, category, course, gender, education_level) VALUES
('elg-001', 'sch-001', 450000, 80.00, 'General, OBC, SC, ST, EWS', 'Engineering, Medicine, Science, Commerce, Arts, All', 'All', 'Undergraduate, Postgraduate'),
('elg-002', 'sch-002', 800000, 60.00, 'General, OBC, SC, ST, EWS', 'Engineering, Technology, Architecture, Pharmacy', 'Female', 'Undergraduate, Diploma'),
('elg-003', 'sch-003', 1500000, 60.00, 'All', 'All', 'All', 'Undergraduate'),
('elg-004', 'sch-004', 250000, 50.00, 'SC, ST', 'All', 'All', 'Undergraduate, Postgraduate, Diploma, Intermediate'),
('elg-005', 'sch-005', 250000, 55.00, 'All', 'All', 'All', 'School (9-12), Intermediate, Undergraduate, Diploma'),
('elg-006', 'sch-006', 9999999, 85.00, 'All', 'Basic Sciences, Physics, Chemistry, Math, Biology', 'All', 'Undergraduate, Postgraduate'),
('elg-007', 'sch-007', 400000, 60.00, 'All', 'Medicine, MBBS, BDS, Nursing, Healthcare', 'All', 'Undergraduate, Postgraduate'),
('elg-008', 'sch-008', 200000, 50.00, 'Minority', 'All', 'Female', 'School (9-12), Intermediate'),
('elg-009', 'sch-009', 9999999, 75.00, 'All', 'Computer Science, Information Technology, AI', 'Female', 'Undergraduate, Postgraduate'),
('elg-010', 'sch-010', 150000, 50.00, 'OBC', 'All', 'All', 'School (9-12), Intermediate, Undergraduate'),
('elg-011', 'sch-011', 800000, 50.00, 'All', 'Engineering, Technology, Architecture, Pharmacy', 'All', 'Undergraduate, Diploma'),
('elg-012', 'sch-012', 500000, 50.00, 'All', 'Engineering, ITI, Polytechnic, General Degree', 'All', 'Undergraduate, Diploma');

-- 4. Seed Applications Tracker (Module 6)
INSERT INTO applications (id, student_id, scholarship_id, status, application_no, submission_date, notes) VALUES
('app-001', 'std-101', 'sch-001', 'Submitted', 'NSP2026-CS-89211', '2026-10-15', 'Applied on NSP portal. Hard copies and fee receipt submitted to College Nodal Officer on 18 Oct.'),
('app-002', 'std-101', 'sch-003', 'Under Review', 'RF-UG-2026-4401', '2026-10-22', 'Passed Phase 1 aptitude assessment. Awaiting telephonic interview invitation.'),
('app-003', 'std-101', 'sch-005', 'In Progress', '', NULL, 'Drafting personal statement explaining family medical emergency.'),
('app-004', 'std-102', 'sch-002', 'Under Review', 'AICTE-PRAG-2026-90', '2026-10-10', 'Single girl child declaration verified by gazetted executive magistrate.'),
('app-005', 'std-103', 'sch-004', 'Awarded', 'PMS-SC-UP-2026-10', '2026-09-28', 'Sanctioned! First DBT instalment of ₹37,500 credited to Aadhaar-seeded bank account.');

-- 5. Seed Documents Checklist (Module 6)
INSERT INTO documents (id, document_name, requirement, upload_reference, category, issuing_authority, validity, how_to_obtain, common_rejection_reasons) VALUES
('doc-001', 'Aadhaar Card', 'Mandatory for all DBT & Government Scholarships', 'DigiLocker / Aadhaar PDF', 'Identity Proof', 'UIDAI (Government of India)', 'Lifetime', 'Download instantly from DigiLocker or mAadhaar portal.', 'Name mismatch between Aadhaar and Board Marksheet; Unlinked mobile number.'),
('doc-002', 'Income Certificate', 'Mandatory for income-ceiling schemes (Max income ceiling)', 'Tehsildar Signed PDF (<=200KB)', 'Income Proof', 'Tehsildar / Sub-Divisional Magistrate (SDM) / Revenue Dept', 'Current Financial Year (1 Year)', 'Apply via State e-District portal or local Tehsil / CSC center.', 'Expired certificate from previous financial year; Certificate issued in parent name without student name.'),
('doc-003', 'Caste / Community Certificate', 'Mandatory for SC, ST, OBC, EWS schemes', 'State e-District Barcoded PDF', 'Category Proof', 'Revenue Officer / Tehsildar / Competent State Authority', 'Lifetime for SC/ST; 1 Year for OBC-NCL / EWS', 'Apply on State Revenue portal with lineage proof.', 'Submitting state format for central scheme requiring Central Government OBC-NCL format.'),
('doc-004', 'Class 10th & 12th Board Marksheets', 'Academic threshold verification', 'DigiLocker Verified Marksheet', 'Academic Record', 'CBSE / ICSE / State Secondary Board', 'Permanent', 'Pull verified digital marksheet directly from DigiLocker.', 'Uploading uncertified xerox copy without principal attestation.'),
('doc-005', 'Bonafide Student Certificate', 'Proof of current regular enrollment in college', 'College Principal Attested Letter', 'Institutional Proof', 'College Registrar / Principal / Dean of Student Welfare', 'Current Academic Year', 'Request from College Academic Section / ERP portal.', 'Missing institutional seal; Missing AISHE / Affiliation code.'),
('doc-006', 'Current Semester Fee Receipt', 'Proof of tuition fee paid for grant reimbursement', 'Official Accounts Receipt', 'Financial Record', 'College Accounts / Bursar Department', 'Current Academic Session', 'Download receipt from college fee payment gateway.', 'Submitting bank UPI payment screenshot instead of official stamped receipt.'),
('doc-007', 'Bank Account Passbook / Statement', 'Must be active, in student name, Aadhaar linked', 'Bank Passbook Photo / E-Statement', 'Banking Details', 'Scheduled Commercial Bank (SBI, PNB, BoB, HDFC, etc.)', 'Active Account', 'Obtain stamped passbook copy from home branch.', 'Minor / Joint account with parent; Account not seeded with NPCI / Aadhaar DBT mapper.'),
('doc-008', 'Domicile / Residence Certificate', 'Mandatory for State government scholarship schemes', 'State Revenue Portal Certificate', 'Residence Proof', 'Tehsildar / District Magistrate', 'Permanent / 3-5 Years', 'Apply through State citizen service center (CSC).', 'Submitting electricity bill or rent agreement instead of official domicile certificate.');

-- 6. Seed Notifications (Module 7)
INSERT INTO notifications (id, student_id, title, message, type, date, read_status) VALUES
('notif-001', 'All', 'AICTE Pragati Deadline Approaching', 'AICTE Pragati Scholarship for Girl Students closes on 30 Nov 2026. Submit documents to Nodal Officer today.', 'Urgent', '2026-11-17', FALSE),
('notif-002', 'All', 'DBT Aadhaar Seeding Reminder', 'Ensure your bank account is seeded on NPCI Aadhaar mapper to prevent DBT scholarship disbursement failures.', 'Warning', '2026-11-15', FALSE),
('notif-003', 'std-103', 'Scholarship Sanctioned & Credited', 'Congratulations Rahul! Your Post-Matric SC scholarship installment of ₹37,500 has been credited via DBT.', 'Success', '2026-11-12', TRUE),
('notif-004', 'All', 'NSP Central Sector Scheme Open', 'Registration for Central Sector Scheme (2026-27 session) is active on National Scholarship Portal.', 'Info', '2026-11-08', TRUE);
