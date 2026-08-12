"""
OnyxDB Basic Query Example (Python SDK)
=======================================
Demonstrates basic record creation, selection, and primary key lookups via HTTP REST API.
"""

import requests
import json

DB_URL = "http://localhost:8080"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer admin-secret-key"
}

def main():
    print("🚀 Connecting to OnyxDB on http://localhost:8080...")

    # 1. Insert Record
    insert_payload = {
        "action": "insert",
        "table": "users",
        "data": {
            "id": 101,
            "username": "alice",
            "email": "alice@onyxdb.io",
            "role": "ADMIN"
        }
    }
    res = requests.post(f"{DB_URL}/api/query", json=insert_payload, headers=HEADERS)
    print("Insert Response:", res.json())

    # 2. Execute OQS Point Lookup
    oqs_payload = {
        "oqs": "GET users 101"
    }
    res = requests.post(f"{DB_URL}/api/query", json=oqs_payload, headers=HEADERS)
    print("Point Lookup Response:", res.json())

if __name__ == "__main__":
    main()
