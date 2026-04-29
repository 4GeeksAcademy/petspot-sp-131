import sqlite3
import os

db_path = "instance/petspot.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

def add_column(table, column, type_def):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column} {type_def}")
        print(f"Added {column} to {table}")
    except Exception as e:
        print(f"Skipped {column} in {table}: {e}")

add_column("chat", "created_at", "DATETIME")
add_column("chat", "is_read", "BOOLEAN DEFAULT 0")
add_column("places", "start_time", "TIME")
add_column("places", "end_time", "TIME")

# Also add latitude/longitude if missing since they were in the migration
add_column("user", "latitude", "FLOAT")
add_column("user", "longitude", "FLOAT")
add_column("cities", "latitude", "FLOAT")
add_column("cities", "longitude", "FLOAT")
add_column("pets", "other_type", "VARCHAR(120)")

conn.commit()
conn.close()
print("Manual database sync complete.")
