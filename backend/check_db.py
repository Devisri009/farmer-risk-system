
from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    users = db.query(models.User).all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"ID: {user.id}, Name: {user.name}, Email: {user.email}, Role: {user.role}")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
