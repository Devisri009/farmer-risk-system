import sqlite3
import os

db_path = "farmvista.db"
# If not in the local dir, check one up
if not os.path.exists(db_path):
    db_path = "../farmvista.db"

if not os.path.exists(db_path):
    print("Database not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Check columns for 'users' table
cursor.execute("PRAGMA table_info(users)")
columns = [row[1] for row in cursor.fetchall()]

print(f"Current columns in 'users': {columns}")

to_add = {
    "avatar": "TEXT DEFAULT '👨‍🌾'",
    "created_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "latitude": "DECIMAL",
    "longitude": "DECIMAL"
}

added_count = 0
for col, definition in to_add.items():
    if col not in columns:
        print(f"Adding missing column: {col}")
        try:
            cursor.execute(f"ALTER TABLE users ADD COLUMN {col} {definition}")
            added_count = int(added_count) + 1
        except Exception as e:
            print(f"Error adding {col}: {e}")

if added_count > 0:
    conn.commit()
    print(f"Successfully added {added_count} columns.")
else:
    print("All required columns already exist.")

conn.close()
