from pymongo import MongoClient
from bson.objectid import ObjectId

MONGO_URI = "mongodb://localhost:27017/battlevault"
client = MongoClient(MONGO_URI)
db = client.get_database()

# Delete the specific orphan order identified earlier
# Order ID: 694e949f046ce9f947da4880 | UserRef: user-Google-1766743959320
# I'll modify the logic to delete ANY order where the user doesn't exist

users = list(db.users.find())
user_ids = [str(u['_id']) for u in users]

orders = list(db.orders.find())
deleted_count = 0

for o in orders:
    user_ref = o.get('userId')
    if user_ref not in user_ids:
        print(f"Deleting orphan order {o['_id']} (UserRef: {user_ref})")
        db.orders.delete_one({'_id': o['_id']})
        deleted_count += 1

print(f"Cleanup complete. Deleted {deleted_count} orphan orders.")
