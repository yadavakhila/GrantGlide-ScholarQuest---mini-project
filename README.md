# **GrantGlide – ScholarQuest**

## **Hackathon Project – Framework Structure & Technical Implementation**

**Project Type:** Web-Based Scholarship Discovery and Management Platform  
**Domain:** Education Technology (EdTech)  
**Version:** 1.0.0 Production Prototype  
**Framework** means the overall structure of the project, including frontend, backend, database, modules, and how they communicate with each other.

---

## **1. Technology Framework**

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | HTML5 | Webpage structure and semantic content layout |
| **Styling** | CSS3, Bootstrap 5.3 | Attractive, modern glassmorphism, responsive mobile-first design |
| **Interactivity** | JavaScript (ES6+) | Dynamic functionality, asynchronous REST API client, state management |
| **Backend** | Python Flask | Handles application logic, RESTful endpoints, and auth sessions |
| **Database** | MySQL (5.7+ / 8.0+) | Stores student profiles, scholarship records, applications, and documents |
| **Development Tool** | VS Code | Writing, debugging, and managing source code |

---

## **2. System Architecture**

```
┌────────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE (FRONTEND)                       │
│                   HTML5 • CSS3 • Bootstrap 5.3 • JavaScript            │
│  • Student Dashboard        • Faceted Search Catalog  • Eligibility Checker    │
│  • Application Kanban Board • Document Checklist     • Deadline Calendar      │
│  • Admin Control Panel      • 10-Slide Pitch Deck     • Framework Inspector    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST JSON Requests
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      APPLICATION BACKEND (FLASK)                       │
│                        Python • Flask RESTful API                      │
│                                                                        │
│   [Authentication]               [Business Logic]                      │
│   • Student Registration/Login   • 5-Factor Eligibility Match Engine   │
│   • Role-Based Access (Admin)    • Dynamic Deadline Countdown Clock    │
│   • Profile State Persistence    • Anti-Rejection Checklist Engine     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Queries (PyMySQL) / JSON Cache
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (grantglide_db)                    │
│                                MySQL                                   │
│   • students      (ID, name, email, course, marks %, income, category) │
│   • scholarships  (ID, name, provider, amount, deadline, official URL) │
│   • eligibility   (ID, scholarship_id, income_limit, marks, category)  │
│   • applications  (ID, student_id, scholarship_id, status, notes)      │
│   • documents     (ID, document_name, requirement, upload_reference)   │
│   • notifications (ID, student_id, title, message, type, date)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## **3. Functional Framework (Modules)**

The platform is structured into 8 interconnected core functional modules:

1. **User Authentication:** Student registration and login, password validation, role segregation (Student vs. Administrator), and session persistence.
2. **Student Profile:** Captures academic details (course, education level, marks %, CGPA), household income, category (General/OBC/SC/ST/EWS), gender, PwD status, and single-girl-child quota.
3. **Scholarship Management:** Search and faceted filtering by Government/Private, Education Level, Category, Gender, and Income Ceiling, with detailed scheme views and verified official portal links.
4. **Eligibility Matching:** Multi-factor rule evaluation engine that compares student credentials against scholarship requirements to calculate exact match score (100% Eligible vs. Partially Eligible) and provides transparent criteria diagnostic breakdown.
5. **Application Guidance:** Standardized 6-step roadmap (DigiLocker sync, OTR registration, document uploads, institute nodal officer verification, DBT bank seeding, and disbursement) with verified direct portal links (NSP, AICTE, Vidyasaarathi, DST INSPIRE).
6. **Document Management:** Comprehensive document checklist (Aadhaar, Income Certificate, Caste Certificate, Marksheet, Bonafide, Fee Receipt), issuing authorities (Tehsildar/SDM), common rejection traps, upload references, and readiness scores.
7. **Notification System:** Upcoming deadline tracker, urgency classification (Urgent < 7 days, Approaching < 20 days, Active), interactive month calendar with clickable deadline dates, and reminder alert toasts.
8. **Admin Dashboard:** Platform administration panel allowing scholarship CRUD operations (Add, Edit, Delete), student roster monitoring, application status auditing, and platform health telemetry.

---

## **4. Database Framework**

Relational database schema (`grantglide_db`) designed in `flask_backend/database.sql`:

| Table | Stored Information | Key Columns |
| --- | --- | --- |
| **Students** | Student ID, name, email, course, academic & social profile | `id` (PK), `name`, `email`, `password_hash`, `phone`, `course`, `education_level`, `percentage`, `cgpa`, `family_income`, `category`, `gender`, `college` |
| **Scholarships** | Scholarship ID, name, provider, amount, deadline, official URL | `id` (PK), `name`, `provider`, `type`, `subtype`, `amount`, `amount_val`, `deadline`, `status`, `official_url`, `portal_name` |
| **Eligibility** | Income limit, marks, category, course, gender | `id` (PK), `scholarship_id` (FK), `income_limit`, `marks`, `category`, `course`, `gender`, `education_level` |
| **Applications** | Student ID, scholarship ID, status, tracking details | `id` (PK), `student_id` (FK), `scholarship_id` (FK), `status`, `application_no`, `submission_date`, `notes` |
| **Documents** | Document name, requirement, upload reference, authority | `id` (PK), `document_name`, `requirement`, `upload_reference`, `category`, `issuing_authority`, `validity`, `how_to_obtain` |
| **Notifications** | Notification ID, message, date, alert status | `id` (PK), `student_id`, `title`, `message`, `type`, `date`, `read_status` |

---

## **5. Working Framework**

The end-to-end user workflow follows 7 streamlined steps:

```
[1. Student Registration]
           │
           ▼
[2. Profile Information] (Marks, Course, Family Income, Category)
           │
           ▼
[3. Scholarship Search] (Faceted Filters: Government/Private, Stream, Quota)
           │
           ▼
[4. Eligibility Verification] (5-Factor Diagnostic Rule Engine)
           │
           ▼
[5. Suitable Scholarships Displayed] (Ranked by % Match, Award Value, & Urgency)
           │
           ▼
[6. Application Guidance] (DigiLocker Checklist & Official Portal Launch)
           │
           ▼
[7. Application Status Tracking] (Saved → In Progress → Submitted → Under Review → Awarded)
```

---

## **6. Development Framework – Project Phases**

| Phase | Development Work | Status |
| --- | --- | --- |
| **Phase 1** | Requirement analysis & domain research | ✅ Completed |
| **Phase 2** | UI/UX design & responsive component layout | ✅ Completed |
| **Phase 3** | Frontend development (HTML, CSS, Bootstrap, JavaScript) | ✅ Completed |
| **Phase 4** | Backend development (Python Flask RESTful API & Node.js Native) | ✅ Completed |
| **Phase 5** | Database integration (MySQL schema, tables, seed data) | ✅ Completed |
| **Phase 6** | Eligibility matching engine implementation | ✅ Completed |
| **Phase 7** | Testing and debugging across personas & endpoints | ✅ Completed |
| **Phase 8** | Final deployment and presentation (Pitch deck & Framework modal) | ✅ Ready |

---

## **7. Expected Final Output**

All 8 requested final outputs are fully functional and verifiable in the prototype:

- [x] **Student registration and login page:** Full dedicated view (`view-auth`) and tabbed modal with validation.
- [x] **Student dashboard:** Comprehensive dashboard with 4 metric cards, personalized recommendations, quick documents, and tracker previews.
- [x] **Scholarship search page:** Multi-faceted catalog with keyword search, provider type, level, category, and sorting.
- [x] **Eligibility checker:** Interactive 5-factor diagnostic rule engine comparing student parameters with criteria.
- [x] **Scholarship details page:** Detailed view modal showing award breakdown, deadline urgency, eligibility criteria, and required documents.
- [x] **Application guidance page:** 6-step standardized roadmap with verified official portal directory.
- [x] **Deadline tracker:** Urgency countdown radar and interactive month calendar with clickable deadline dates.
- [x] **Admin dashboard:** Management portal for scholarship CRUD (Add, Edit, Delete), student roster view, and system metrics.

---

## **8. Future Scope**

- **AI-Based Personalized Recommendations:** Machine learning model to predict scholarship approval odds based on historical grant allocations.
- **Multilingual Support:** Regional Indian language translation (Hindi, Marathi, Tamil, Telugu, Bengali, Kannada) for accessible rural adoption.
- **Scholarship Chatbot:** AI assistant to answer queries on eligibility, required certificates, and deadline questions in natural language.
- **Mobile Application:** Cross-platform Flutter / React Native mobile app with offline notifications and camera-based document scanning.
- **Integration with Verified Government Scholarship Portals:** Direct API integration with National Scholarship Portal (NSP), DigiLocker, and state e-District systems for instant e-KYC and document retrieval.

---

## 🚀 How to Run the Platform

### **Option 1: Python Flask + MySQL Backend (Standard Hackathon Stack)**
```bash
# 1. Open terminal and navigate to flask_backend
cd flask_backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. (Optional) Initialize MySQL Database
python setup_mysql.py

# 4. Start Flask server
python app.py
```
Open your browser at: **`http://127.0.0.1:5000`**

---

### **Option 2: Zero-Dependency Native Node.js Server (Instant 1-Second Setup)**
```bash
# In the project root directory
node server.js
```
Open your browser at: **`http://localhost:5000`**

---

### **Option 3: Standalone Browser Mode (Zero Server Needed)**
Double click **`public/index.html`** in any web browser.  
The built-in resilient client-side data engine powers all 8 modules seamlessly!

---

## 👥 Demo Personas for Evaluation

| Persona | Stream | Marks % | Family Income | Category | Attributes |
| --- | --- | --- | --- | --- | --- |
| **Aarav Sharma** | B.Tech CSE | **84.5%** | ₹3,20,000 / yr | General | Meritorious student; matches Central Sector & Reliance schemes |
| **Priya Verma** | B.Tech IT | **88.2%** | ₹2,10,000 / yr | OBC | Single Girl Child; matches AICTE Pragati & Adobe WIT |
| **Rahul Kumar** | Diploma Mech | **76.0%** | ₹1,80,000 / yr | SC | Post-Matric SC scholarship recipient |
| **Admin Evaluator** | System Admin | N/A | N/A | Admin | Email: `admin@grantglide.edu` / Pass: `admin123` |

> 💡 **Tip:** Click **"Framework Structure"** in the top navigation bar to inspect the interactive blueprint, or click **"Pitch Deck (10 Slides)"** to present the project to judges.
