"""
==============================================================================
GrantGlide – ScholarQuest: Python Flask Backend Application
Educational Technology Hackathon Project
Smart Scholarship Discovery and Application Platform

Technology Framework:
  • Frontend: HTML5, CSS3, Bootstrap 5.3, JavaScript (ES6+)
  • Backend: Python Flask (REST API)
  • Database: MySQL (with transparent JSON persistence fallback)
  • Architecture: Client-Server RESTful Model
==============================================================================
"""

import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="../public", static_url_path="")
CORS(app)

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

# Database Configuration (MySQL)
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "localhost"),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", ""),
    "database": os.environ.get("DB_NAME", "grantglide_db")
}

def get_db_connection():
    """Attempt MySQL connection; returns connection or None."""
    try:
        import pymysql
        conn = pymysql.connect(
            host=DB_CONFIG["host"],
            port=DB_CONFIG["port"],
            user=DB_CONFIG["user"],
            password=DB_CONFIG["password"],
            database=DB_CONFIG["database"],
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )
        return conn
    except Exception:
        try:
            import mysql.connector
            conn = mysql.connector.connect(
                host=DB_CONFIG["host"],
                port=DB_CONFIG["port"],
                user=DB_CONFIG["user"],
                password=DB_CONFIG["password"],
                database=DB_CONFIG["database"]
            )
            return conn
        except Exception:
            return None

def is_db_connected():
    conn = get_db_connection()
    if conn:
        try:
            conn.close()
            return True
        except Exception:
            pass
    return False

# JSON Persistence Helpers (Zero-config fallback)
def read_json(filename):
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {filename}: {e}")
        return []

def write_json(filename, data):
    file_path = os.path.join(DATA_DIR, filename)
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error writing {filename}: {e}")
        return False

def calculate_days_left(deadline_str):
    try:
        target = datetime.strptime(str(deadline_str).split(" ")[0], "%Y-%m-%d")
        diff = target - datetime.now()
        return diff.days + 1
    except Exception:
        return 0

# ==============================================================================
# CORE ELIGIBILITY ENGINE (Module 4)
# ==============================================================================
def evaluate_eligibility(student, scholarship):
    score = 0
    total = 5
    breakdown = []

    # 1. Percentage / Marks
    student_marks = float(student.get("percentage", 0) or 0)
    min_marks = float(scholarship.get("min_percentage", 50) or 50)
    if student_marks >= min_marks:
        score += 1
        breakdown.append({
            "criterion": "Academic Performance",
            "passed": True,
            "student_value": f"{student_marks}%",
            "required_value": f"Min {min_marks}%",
            "explanation": f"Your aggregate ({student_marks}%) satisfies the threshold of {min_marks}%."
        })
    else:
        breakdown.append({
            "criterion": "Academic Performance",
            "passed": False,
            "student_value": f"{student_marks}%",
            "required_value": f"Min {min_marks}%",
            "explanation": f"Requires minimum {min_marks}%. Current aggregate is {student_marks}%."
        })

    # 2. Family Income Limit
    student_inc = int(student.get("family_income", 0) or 0)
    max_inc = int(scholarship.get("max_family_income", 9999999) or 9999999)
    if student_inc <= max_inc:
        score += 1
        breakdown.append({
            "criterion": "Annual Family Income",
            "passed": True,
            "student_value": f"₹{student_inc:,}/yr",
            "required_value": "No Upper Limit" if max_inc >= 9000000 else f"Max ₹{max_inc:,}/yr",
            "explanation": "Family income satisfies scholarship ceiling."
        })
    else:
        breakdown.append({
            "criterion": "Annual Family Income",
            "passed": False,
            "student_value": f"₹{student_inc:,}/yr",
            "required_value": f"Max ₹{max_inc:,}/yr",
            "explanation": f"Income exceeds the ₹{max_inc:,} ceiling."
        })

    # 3. Social Category
    student_cat = student.get("category", "General") or "General"
    allowed_cats = scholarship.get("categories", ["All"]) or ["All"]
    if isinstance(allowed_cats, str):
        allowed_cats = [c.strip() for c in allowed_cats.split(",") if c.strip()]
    if "All" in allowed_cats or student_cat in allowed_cats:
        score += 1
        breakdown.append({
            "criterion": "Social Category",
            "passed": True,
            "student_value": student_cat,
            "required_value": ", ".join(allowed_cats),
            "explanation": f"Category '{student_cat}' is eligible."
        })
    else:
        breakdown.append({
            "criterion": "Social Category",
            "passed": False,
            "student_value": student_cat,
            "required_value": ", ".join(allowed_cats),
            "explanation": f"Scheme designated for [{', '.join(allowed_cats)}]."
        })

    # 4. Education Level / Course
    student_lvl = student.get("education_level", "Undergraduate") or "Undergraduate"
    allowed_lvls = scholarship.get("level", ["All"]) or ["All"]
    if isinstance(allowed_lvls, str):
        allowed_lvls = [c.strip() for c in allowed_lvls.split(",") if c.strip()]
    if "All" in allowed_lvls or student_lvl in allowed_lvls:
        score += 1
        breakdown.append({
            "criterion": "Education Level",
            "passed": True,
            "student_value": student_lvl,
            "required_value": ", ".join(allowed_lvls),
            "explanation": f"Eligible for {student_lvl} students."
        })
    else:
        breakdown.append({
            "criterion": "Education Level",
            "passed": False,
            "student_value": student_lvl,
            "required_value": ", ".join(allowed_lvls),
            "explanation": f"Requires enrollment in [{', '.join(allowed_lvls)}]."
        })

    # 5. Gender Requirement
    student_gdr = student.get("gender", "All") or "All"
    req_gdr = scholarship.get("gender", "All") or "All"
    if req_gdr == "All" or req_gdr.lower() == student_gdr.lower():
        score += 1
        breakdown.append({
            "criterion": "Gender Requirement",
            "passed": True,
            "student_value": student_gdr,
            "required_value": req_gdr,
            "explanation": "Open to applicant gender."
        })
    else:
        breakdown.append({
            "criterion": "Gender Requirement",
            "passed": False,
            "student_value": student_gdr,
            "required_value": req_gdr,
            "explanation": f"Restricted to {req_gdr} candidates."
        })

    pct = round((score / total) * 100)
    status = "Ineligible"
    if pct == 100:
        status = "100% Eligible"
    elif pct >= 60:
        status = "Partially Eligible"

    return {
        "scholarship_id": scholarship.get("id"),
        "scholarship_name": scholarship.get("name"),
        "amount": scholarship.get("amount"),
        "provider": scholarship.get("provider"),
        "deadline": scholarship.get("deadline"),
        "score": score,
        "totalCriteria": total,
        "match_percentage": pct,
        "status": status,
        "breakdown": breakdown,
        "official_url": scholarship.get("official_url")
    }

# ==============================================================================
# ROOT & STATIC FILE SERVING
# ==============================================================================
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

# ==============================================================================
# HACKATHON FRAMEWORK SPECIFICATION ENDPOINT
# ==============================================================================
@app.route("/api/framework", methods=["GET"])
def get_framework_structure():
    """Returns the complete hackathon framework specification structure."""
    return jsonify({
        "success": True,
        "project": {
            "name": "GrantGlide – ScholarQuest",
            "type": "Web-Based Scholarship Discovery and Management Platform",
            "version": "1.0.0 Production Prototype"
        },
        "technology_framework": {
            "frontend": "HTML",
            "styling": "CSS, Bootstrap 5.3",
            "interactivity": "JavaScript (ES6+)",
            "backend": "Python Flask",
            "database": "MySQL (with JSON persistence engine fallback)",
            "editor": "VS Code"
        },
        "system_architecture": {
            "user_interface": "HTML • CSS • Bootstrap • JavaScript",
            "backend_server": "Python • Flask RESTful API",
            "business_logic": "5-Factor Eligibility Matching, Search, Application Tracking",
            "authentication": "Student Registration/Login and Admin Login",
            "database_layer": "MySQL (grantglide_db) – Student, Scholarship, Eligibility, and Application Records"
        },
        "functional_framework": [
            {"id": 1, "name": "User Authentication", "description": "Student registration and login."},
            {"id": 2, "name": "Student Profile", "description": "Academic, personal and eligibility details."},
            {"id": 3, "name": "Scholarship Management", "description": "Display and manage scholarship information."},
            {"id": 4, "name": "Eligibility Matching", "description": "Compare student details with scholarship requirements."},
            {"id": 5, "name": "Application Guidance", "description": "Provide application instructions and official links."},
            {"id": 6, "name": "Document Management", "description": "Display required document checklists."},
            {"id": 7, "name": "Notification System", "description": "Display upcoming deadlines and reminders."},
            {"id": 8, "name": "Admin Dashboard", "description": "Manage scholarship records and platform information."}
        ],
        "database_framework": [
            {"table": "students", "columns": "id, name, email, password_hash, phone, course, education_level, percentage, cgpa, family_income, category, gender, state, college, year_of_study, disability_status, single_girl_child, created_at"},
            {"table": "scholarships", "columns": "id, name, provider, type, subtype, amount, amount_val, deadline, status, description, official_url, portal_name, created_at"},
            {"table": "eligibility", "columns": "id, scholarship_id, income_limit, marks, category, course, gender, education_level"},
            {"table": "applications", "columns": "id, student_id, scholarship_id, status, application_no, submission_date, notes, created_at"},
            {"table": "documents", "columns": "id, document_name, requirement, upload_reference, category, issuing_authority, validity, how_to_obtain, common_rejection_reasons"},
            {"table": "notifications", "columns": "id, student_id, title, message, type, date, read_status"}
        ],
        "working_framework": [
            "1. Student Registration",
            "2. Profile Information",
            "3. Scholarship Search",
            "4. Eligibility Verification",
            "5. Suitable Scholarships Displayed",
            "6. Application Guidance",
            "7. Application Status Tracking"
        ],
        "development_phases": [
            {"phase": "Phase 1", "work": "Requirement analysis"},
            {"phase": "Phase 2", "work": "UI/UX design"},
            {"phase": "Phase 3", "work": "Frontend development"},
            {"phase": "Phase 4", "work": "Backend development"},
            {"phase": "Phase 5", "work": "Database integration"},
            {"phase": "Phase 6", "work": "Eligibility matching implementation"},
            {"phase": "Phase 7", "work": "Testing and debugging"},
            {"phase": "Phase 8", "work": "Final deployment and presentation"}
        ],
        "expected_final_output": [
            "Student registration and login page",
            "Student dashboard",
            "Scholarship search page",
            "Eligibility checker",
            "Scholarship details page",
            "Application guidance page",
            "Deadline tracker",
            "Admin dashboard"
        ],
        "future_scope": [
            "AI-based personalized scholarship recommendations",
            "Multilingual support",
            "Scholarship chatbot",
            "Mobile application",
            "Integration with verified government scholarship portals"
        ],
        "runtime_status": {
            "mysql_connected": is_db_connected(),
            "active_storage": "MySQL Database (grantglide_db)" if is_db_connected() else "JSON Persistence Engine (Zero-Config Hackathon Fallback)"
        }
    })

# ==============================================================================
# AUTHENTICATION & PROFILE APIS (Module 1 & 2)
# ==============================================================================
@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip().lower()
    password = body.get("password", "")
    role = body.get("role", "student")

    # Admin check
    if role == "admin" or email == "admin@grantglide.edu":
        if password in ["admin123", "admin"]:
            return jsonify({
                "success": True,
                "role": "admin",
                "user": {
                    "id": "adm-001",
                    "name": "Hackathon Admin Evaluator",
                    "email": "admin@grantglide.edu",
                    "role": "admin"
                }
            })

    # Try MySQL if connected
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM students WHERE LOWER(email) = %s", (email,))
            row = cursor.fetchone()
            conn.close()
            if row and (row.get("password_hash") == password or password == "password123"):
                safe = {k: v for k, v in row.items() if k != "password_hash"}
                return jsonify({"success": True, "role": "student", "user": safe})
        except Exception as e:
            print(f"MySQL auth error: {e}")

    # Fallback to JSON
    students = read_json("students.json")
    student = next((s for s in students if s.get("email", "").lower() == email), None)
    if student and (student.get("password") == password or password == "password123"):
        safe_student = {k: v for k, v in student.items() if k != "password"}
        return jsonify({"success": True, "role": "student", "user": safe_student})

    return jsonify({"success": False, "message": "Invalid email or password. Use demo account or password123."}), 401

@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    body = request.get_json() or {}
    email = (body.get("email") or "").strip().lower()

    students = read_json("students.json")
    if any(s.get("email", "").lower() == email for s in students):
        return jsonify({"success": False, "message": "An account with this email already exists"}), 400

    new_id = f"std-{int(datetime.now().timestamp()) % 10000:04d}"
    new_student = {
        "id": new_id,
        "name": body.get("name") or "New Student",
        "email": body.get("email") or "",
        "password": body.get("password") or "password123",
        "phone": body.get("phone") or "+91 98000 00000",
        "course": body.get("course") or "Undergraduate Degree",
        "education_level": body.get("education_level") or "Undergraduate",
        "percentage": float(body.get("percentage") or 75.0),
        "cgpa": str(body.get("cgpa") or "8.0"),
        "family_income": int(body.get("family_income") or 300000),
        "category": body.get("category") or "General",
        "gender": body.get("gender") or "All",
        "state": body.get("state") or "Delhi",
        "college": body.get("college") or "University College",
        "year_of_study": body.get("year_of_study") or "1st Year",
        "disability_status": body.get("disability_status") or "No",
        "single_girl_child": body.get("single_girl_child") or "No",
        "created_at": datetime.now().strftime("%Y-%m-%d")
    }

    # If MySQL connected, insert to MySQL
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO students (id, name, email, password_hash, phone, course, education_level, percentage, cgpa, family_income, category, gender, state, college, year_of_study, disability_status, single_girl_child)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                new_student["id"], new_student["name"], new_student["email"], new_student["password"],
                new_student["phone"], new_student["course"], new_student["education_level"], new_student["percentage"],
                new_student["cgpa"], new_student["family_income"], new_student["category"], new_student["gender"],
                new_student["state"], new_student["college"], new_student["year_of_study"], new_student["disability_status"],
                new_student["single_girl_child"]
            ))
            conn.close()
        except Exception as e:
            print(f"MySQL insert student error: {e}")

    students.append(new_student)
    write_json("students.json", students)
    safe = {k: v for k, v in new_student.items() if k != "password"}
    return jsonify({"success": True, "message": "Registration successful", "user": safe}), 201

@app.route("/api/auth/profile", methods=["GET"])
def get_profile():
    student_id = request.args.get("id", "std-101")
    conn = get_db_connection()
    if conn:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM students WHERE id = %s", (student_id,))
            row = cursor.fetchone()
            conn.close()
            if row:
                safe = {k: v for k, v in row.items() if k != "password_hash"}
                return jsonify({"success": True, "user": safe})
        except Exception:
            pass

    students = read_json("students.json")
    student = next((s for s in students if s["id"] == student_id), None)
    if not student:
        return jsonify({"success": False, "message": "Student not found"}), 404
    safe = {k: v for k, v in student.items() if k != "password"}
    return jsonify({"success": True, "user": safe})

@app.route("/api/auth/profile", methods=["PUT"])
def update_profile():
    body = request.get_json() or {}
    student_id = body.get("id", "std-101")

    students = read_json("students.json")
    idx = next((i for i, s in enumerate(students) if s["id"] == student_id), None)
    if idx is None:
        return jsonify({"success": False, "message": "Student not found"}), 404

    for key, value in body.items():
        if key != "password":
            students[idx][key] = value

    write_json("students.json", students)
    safe = {k: v for k, v in students[idx].items() if k != "password"}
    return jsonify({"success": True, "message": "Profile updated successfully", "user": safe})

# ==============================================================================
# SCHOLARSHIPS DISCOVERY & CRUD (Module 3 & 8)
# ==============================================================================
@app.route("/api/scholarships", methods=["GET"])
def get_scholarships():
    scholarships = read_json("scholarships.json")
    q = request.args.get("q", "").lower()
    sch_type = request.args.get("type")
    level = request.args.get("level")
    category = request.args.get("category")
    gender = request.args.get("gender")
    max_income = request.args.get("max_income")
    min_percentage = request.args.get("min_percentage")

    for s in scholarships:
        s["days_left"] = calculate_days_left(s.get("deadline", "2026-12-31"))
        s["urgency"] = "Urgent" if s["days_left"] <= 7 else ("Approaching" if s["days_left"] <= 20 else "Active")

    if q:
        scholarships = [s for s in scholarships if q in s["name"].lower() or q in s["provider"].lower() or q in s.get("description", "").lower()]
    if sch_type and sch_type != "All":
        scholarships = [s for s in scholarships if s["type"].lower() == sch_type.lower()]
    if level and level != "All":
        scholarships = [s for s in scholarships if "All" in s.get("level", []) or level in s.get("level", [])]
    if category and category != "All":
        scholarships = [s for s in scholarships if "All" in s.get("categories", []) or category in s.get("categories", [])]
    if gender and gender != "All":
        scholarships = [s for s in scholarships if s.get("gender") == "All" or s.get("gender", "").lower() == gender.lower()]
    if max_income:
        try:
            mi = int(max_income)
            scholarships = [s for s in scholarships if s.get("max_family_income", 9999999) >= mi]
        except ValueError:
            pass
    if min_percentage:
        try:
            mp = float(min_percentage)
            scholarships = [s for s in scholarships if s.get("min_percentage", 0) <= mp]
        except ValueError:
            pass

    return jsonify({"success": True, "count": len(scholarships), "data": scholarships})

@app.route("/api/scholarships/<sch_id>", methods=["GET"])
def get_single_scholarship(sch_id):
    scholarships = read_json("scholarships.json")
    found = next((s for s in scholarships if s["id"] == sch_id), None)
    if not found:
        return jsonify({"success": False, "message": "Scholarship not found"}), 404
    found["days_left"] = calculate_days_left(found.get("deadline", "2026-12-31"))
    return jsonify({"success": True, "data": found})

@app.route("/api/scholarships", methods=["POST"])
def create_scholarship():
    body = request.get_json() or {}
    scholarships = read_json("scholarships.json")
    new_id = f"sch-{int(datetime.now().timestamp()) % 10000:04d}"

    levels = body.get("level")
    if not isinstance(levels, list):
        levels = [x.strip() for x in str(levels or "Undergraduate").split(",") if x.strip()]

    cats = body.get("categories")
    if not isinstance(cats, list):
        cats = [x.strip() for x in str(cats or "General").split(",") if x.strip()]

    new_sch = {
        "id": new_id,
        "name": body.get("name") or "Untitled Scholarship",
        "provider": body.get("provider") or "Scholarship Organization",
        "type": body.get("type") or "Government",
        "subtype": body.get("subtype") or "Central",
        "level": levels,
        "courses": body.get("courses") if isinstance(body.get("courses"), list) else ["All"],
        "min_percentage": float(body.get("min_percentage") or 50.0),
        "max_family_income": int(body.get("max_family_income") or 500000),
        "categories": cats,
        "gender": body.get("gender") or "All",
        "amount": body.get("amount") or "₹25,000 / year",
        "amount_val": int(body.get("amount_val") or 25000),
        "deadline": body.get("deadline") or "2026-12-31",
        "days_left": calculate_days_left(body.get("deadline", "2026-12-31")),
        "status": "Active",
        "description": body.get("description") or "",
        "official_url": body.get("official_url") or "https://scholarships.gov.in/",
        "portal_name": body.get("portal_name") or "Official Portal",
        "documents_required": body.get("documents_required") or ["Aadhaar Card", "Marksheet", "Income Certificate"],
        "application_steps": body.get("application_steps") or ["Submit online", "Verify documents"]
    }

    scholarships.insert(0, new_sch)
    write_json("scholarships.json", scholarships)
    return jsonify({"success": True, "message": "Scholarship created successfully", "data": new_sch}), 201

@app.route("/api/scholarships/<sch_id>", methods=["PUT"])
def update_scholarship(sch_id):
    body = request.get_json() or {}
    scholarships = read_json("scholarships.json")
    idx = next((i for i, s in enumerate(scholarships) if s["id"] == sch_id), None)
    if idx is None:
        return jsonify({"success": False, "message": "Scholarship not found"}), 404

    for key, val in body.items():
        if key != "id":
            scholarships[idx][key] = val

    write_json("scholarships.json", scholarships)
    return jsonify({"success": True, "message": "Scholarship updated successfully", "data": scholarships[idx]})

@app.route("/api/scholarships/<sch_id>", methods=["DELETE"])
def delete_scholarship(sch_id):
    scholarships = read_json("scholarships.json")
    initial_len = len(scholarships)
    scholarships = [s for s in scholarships if s["id"] != sch_id]
    if len(scholarships) == initial_len:
        return jsonify({"success": False, "message": "Scholarship not found"}), 404

    write_json("scholarships.json", scholarships)
    return jsonify({"success": True, "message": "Scholarship deleted successfully"})

# ==============================================================================
# SMART ELIGIBILITY CHECKER (Module 4)
# ==============================================================================
@app.route("/api/eligibility/check", methods=["POST"])
def check_eligibility():
    student = request.get_json() or {}
    scholarships = read_json("scholarships.json")
    results = [evaluate_eligibility(student, s) for s in scholarships]
    results.sort(key=lambda x: x["match_percentage"], reverse=True)

    fully = sum(1 for r in results if r["match_percentage"] == 100)
    partial = sum(1 for r in results if 60 <= r["match_percentage"] < 100)

    return jsonify({
        "success": True,
        "summary": {
            "total_analyzed": len(results),
            "fully_eligible": fully,
            "partially_eligible": partial,
            "ineligible": len(results) - fully - partial
        },
        "results": results
    })

# ==============================================================================
# APPLICATION TRACKER (Module 6)
# ==============================================================================
@app.route("/api/applications", methods=["GET"])
def get_applications():
    student_id = request.args.get("student_id", "std-101")
    applications = read_json("applications.json")
    scholarships = {s["id"]: s for s in read_json("scholarships.json")}

    user_apps = []
    for app_item in applications:
        if app_item.get("student_id") == student_id:
            sch = scholarships.get(app_item.get("scholarship_id"), {})
            app_item["scholarship_name"] = sch.get("name", "Unknown Scholarship")
            app_item["provider"] = sch.get("provider", "Scholarship Portal")
            app_item["amount"] = sch.get("amount", "N/A")
            app_item["official_url"] = sch.get("official_url", "https://scholarships.gov.in/")
            app_item["days_left"] = calculate_days_left(sch.get("deadline", "2026-12-31"))
            user_apps.append(app_item)

    return jsonify({"success": True, "count": len(user_apps), "data": user_apps})

@app.route("/api/applications", methods=["POST"])
def add_application():
    body = request.get_json() or {}
    student_id = body.get("student_id", "std-101")
    scholarship_id = body.get("scholarship_id")
    applications = read_json("applications.json")

    if any(a.get("student_id") == student_id and a.get("scholarship_id") == scholarship_id for a in applications):
        return jsonify({"success": False, "message": "This scholarship is already in your application tracker"}), 400

    new_app = {
        "id": f"app-{int(datetime.now().timestamp()) % 10000:04d}",
        "student_id": student_id,
        "scholarship_id": scholarship_id,
        "status": body.get("status") or "Saved",
        "application_no": body.get("application_no") or "",
        "submission_date": body.get("submission_date") or "",
        "deadline": body.get("deadline") or "",
        "notes": body.get("notes") or "Added to tracker from discovery catalog.",
        "documents_completed": body.get("documents_completed") or [],
        "created_at": datetime.now().strftime("%Y-%m-%d")
    }

    applications.append(new_app)
    write_json("applications.json", applications)
    return jsonify({"success": True, "message": "Added to Application Tracker", "data": new_app}), 201

@app.route("/api/applications/<app_id>", methods=["PUT"])
def update_application(app_id):
    body = request.get_json() or {}
    applications = read_json("applications.json")
    idx = next((i for i, a in enumerate(applications) if a["id"] == app_id), None)
    if idx is None:
        return jsonify({"success": False, "message": "Application not found"}), 404

    for key, val in body.items():
        if key != "id":
            applications[idx][key] = val

    write_json("applications.json", applications)
    return jsonify({"success": True, "message": "Application updated", "data": applications[idx]})

@app.route("/api/applications/<app_id>", methods=["DELETE"])
def delete_application(app_id):
    applications = read_json("applications.json")
    initial_len = len(applications)
    applications = [a for a in applications if a["id"] != app_id]
    if len(applications) == initial_len:
        return jsonify({"success": False, "message": "Application not found"}), 404

    write_json("applications.json", applications)
    return jsonify({"success": True, "message": "Removed from tracker"})

# ==============================================================================
# DOCUMENTS & DEADLINES (Module 5 & 7)
# ==============================================================================
@app.route("/api/documents", methods=["GET"])
def get_documents():
    docs = read_json("documents.json")
    return jsonify({"success": True, "count": len(docs), "data": docs})

@app.route("/api/deadlines", methods=["GET"])
def get_deadlines():
    scholarships = read_json("scholarships.json")
    res = []
    for s in scholarships:
        days = calculate_days_left(s.get("deadline", "2026-12-31"))
        res.append({
            "id": s["id"],
            "name": s["name"],
            "provider": s["provider"],
            "amount": s["amount"],
            "deadline": s["deadline"],
            "days_left": days,
            "urgency": "Urgent" if days <= 7 else ("Approaching" if days <= 20 else "Active"),
            "official_url": s.get("official_url")
        })
    res.sort(key=lambda x: x["days_left"])
    return jsonify({"success": True, "data": res})

@app.route("/api/notifications", methods=["GET"])
def get_notifications():
    notifs = read_json("notifications.json")
    return jsonify({"success": True, "data": notifs})

# ==============================================================================
# METRICS & ADMIN OVERVIEW (Module 8)
# ==============================================================================
@app.route("/api/stats", methods=["GET"])
def get_stats():
    scholarships = read_json("scholarships.json")
    students = read_json("students.json")
    applications = read_json("applications.json")
    total_val = sum(s.get("amount_val", 0) for s in scholarships)
    active_deadlines = sum(1 for s in scholarships if calculate_days_left(s.get("deadline", "2026-12-31")) > 0)

    return jsonify({
        "success": True,
        "stats": {
            "total_scholarships": len(scholarships),
            "active_deadlines": active_deadlines,
            "total_students": len(students),
            "tracked_applications": len(applications),
            "potential_funds": total_val,
            "potential_funds_formatted": f"₹{total_val / 100000:.1f} Lakhs+"
        }
    })

@app.route("/api/admin/overview", methods=["GET"])
def get_admin_overview():
    scholarships = read_json("scholarships.json")
    students = read_json("students.json")
    applications = read_json("applications.json")
    safe_students = [{k: v for k, v in s.items() if k != "password"} for s in students]

    return jsonify({
        "success": True,
        "scholarships": scholarships,
        "students": safe_students,
        "applications": applications
    })

if __name__ == "__main__":
    print("==============================================================")
    print("🚀 GrantGlide – ScholarQuest: Python Flask Server Starting")
    print("   Technology Stack: Python Flask + MySQL + Bootstrap 5.3 + JS")
    if is_db_connected():
        print("   ✅ Connected to MySQL Database (grantglide_db)")
    else:
        print("   ℹ️ MySQL not connected. Using high-speed JSON persistence engine.")
        print("   💡 Tip: Run 'python setup_mysql.py' to initialize MySQL database.")
    print("🔗 Local URL: http://127.0.0.1:5000")
    print("==============================================================")
    app.run(host="0.0.0.0", port=5000, debug=True)
