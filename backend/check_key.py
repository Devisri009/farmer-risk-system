import sqlite3

conn = sqlite3.connect("farmvista.db")
cursor = conn.cursor()
cursor.execute("UPDATE users SET role = 'consumer' WHERE role = 'retailer'")
print("Updated users count:", cursor.rowcount)
conn.commit()

cursor.execute("SELECT id, username, role FROM users")
print("Users:", cursor.fetchall())
conn.close()
