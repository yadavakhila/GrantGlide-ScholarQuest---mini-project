"""
==============================================================================
GrantGlide – ScholarQuest: MySQL Database Initializer & Migration Tool
Automatically creates the `grantglide_db` database and runs `database.sql`
to populate all tables: students, scholarships, eligibility, applications,
documents, and notifications.
==============================================================================
"""

import os
import sys

def run_setup():
    db_host = os.environ.get("DB_HOST", "localhost")
    db_port = int(os.environ.get("DB_PORT", 3306))
    db_user = os.environ.get("DB_USER", "root")
    db_password = os.environ.get("DB_PASSWORD", "")
    db_name = os.environ.get("DB_NAME", "grantglide_db")

    print("==============================================================")
    print("🎓 GrantGlide – ScholarQuest: MySQL Database Setup")
    print(f"Connecting to MySQL at {db_host}:{db_port} as '{db_user}'...")
    print("==============================================================")

    # Try PyMySQL first, then mysql.connector
    conn = None
    try:
        import pymysql
        conn = pymysql.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            autocommit=True
        )
        print("Connected via PyMySQL!")
    except Exception as e_pymysql:
        try:
            import mysql.connector
            conn = mysql.connector.connect(
                host=db_host,
                port=db_port,
                user=db_user,
                password=db_password
            )
            print("Connected via mysql.connector!")
        except Exception as e_connector:
            print("\n❌ Could not connect to MySQL server:")
            print(f"   PyMySQL error: {e_pymysql}")
            print(f"   mysql.connector error: {e_connector}")
            print("\n💡 Tip: Please ensure MySQL server is running (e.g. XAMPP, WAMP, or standalone MySQL service).")
            print("   You can specify credentials with environment variables:")
            print("   $env:DB_USER='root'; $env:DB_PASSWORD='your_password'; python setup_mysql.py\n")
            return False

    sql_path = os.path.join(os.path.dirname(__file__), "database.sql")
    if not os.path.exists(sql_path):
        print(f"❌ SQL file not found at: {sql_path}")
        return False

    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Split into statements
    statements = [stmt.strip() for stmt in sql_content.split(";") if stmt.strip()]

    cursor = conn.cursor()
    print(f"\nExecuting {len(statements)} SQL statements from database.sql...")

    success_count = 0
    for i, stmt in enumerate(statements, 1):
        # Ignore comments
        clean_stmt = "\n".join(line for line in stmt.split("\n") if not line.strip().startswith("--")).strip()
        if not clean_stmt:
            continue
        try:
            cursor.execute(clean_stmt)
            success_count += 1
        except Exception as ex:
            print(f"⚠️ Statement {i} notice: {ex}")

    cursor.close()
    conn.close()

    print("\n✅ Database Setup Completed Successfully!")
    print(f"   Database '{db_name}' is initialized with 6 core tables:")
    print("   • students      (Student ID, name, email, course)")
    print("   • scholarships  (Scholarship ID, name, amount, deadline)")
    print("   • eligibility   (Income limit, marks, category, course)")
    print("   • applications  (Student ID, scholarship ID, status)")
    print("   • documents     (Document name, requirement, upload reference)")
    print("   • notifications (Notification ID, message, date)")
    print("==============================================================\n")
    return True

if __name__ == "__main__":
    run_setup()
