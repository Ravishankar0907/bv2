from pymongo import MongoClient
import sys

MONGO_URI = "mongodb://localhost:27017/battlevault"
client = MongoClient(MONGO_URI)
db = client.get_database()

# User ID from the screenshot context (assuming it matches the one mentioned)
# Or I can list all users with ID proofs
users = list(db.users.find())

print(f"Total Users: {len(users)}")
for u in users:
    uid = str(u.get('_id'))
    email = u.get('email')
    has_proof = 'Yes' if u.get('idProofUrl') else 'No'
    proof_len = len(u.get('idProofUrl')) if u.get('idProofUrl') else 0
    print(f"User: {uid} | Email: {email} | Has Proof: {has_proof} (Len: {proof_len})")

# Check orders to see what userId they reference
orders = list(db.orders.find())
print(f"\nTotal Orders: {len(orders)}")
for o in orders:
    print(f"Order ID: {o.get('_id')} | UserRef: {o.get('userId')}")
