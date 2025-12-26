from pymongo import MongoClient

# Hardcoded URI for verification script to avoid import issues
MONGO_URI = "mongodb://localhost:27017/battlevault"

client = MongoClient(MONGO_URI)
db = client.get_database()
users = list(db.users.find())

print(f"Total Users: {len(users)}")
for u in users:
    print(f"- {u.get('name')} ({u.get('email')}) | Role: {u.get('role')} | Primary: {u.get('isPrimary', False)}")
