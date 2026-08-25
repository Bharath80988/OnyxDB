import time
from forgeql.client import ForgeQL

def main():
    print("Initializing ForgeQL Python SDK v4...")
    db = ForgeQL(host="http://localhost:8080", token="admin-secret-key")

    # 1. Insert a document
    print("\n[1] Inserting user document...")
    res = db.insert("users", 1001, {
        "name": "Jane Doe",
        "email": "jane@forgeql.io",
        "status": "ACTIVE"
    })
    print("Insert Response:", res)

    # 2. Get the document by ID
    print("\n[2] Fetching document by ID...")
    res = db.get("users", 1001)
    print("Get Response:", res)

    # 3. Use FQL Query
    print("\n[3] Running FQL Query...")
    res = db.fql("GET users 1001")
    print("FQL Response:", res)

if __name__ == "__main__":
    main()
