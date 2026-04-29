import sqlite3
import os

db_path = "instance/petspot.db"
if not os.path.exists(db_path):
    # Try alternate paths
    db_path = "instance/test.db" 
if not os.path.exists(db_path):
    db_path = "instance/app.db"

print(f"Connecting to {db_path}...")
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS _alembic_tmp_chat")
    conn.commit()
    conn.close()
    print("Dropped _alembic_tmp_chat successfully.")
except Exception as e:
    print(f"Error: {e}")
