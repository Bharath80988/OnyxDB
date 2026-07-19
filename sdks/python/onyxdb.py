import requests
import argparse
import json

class OnyxDB:
    def __init__(self, host="http://localhost:8080"):
        self.host = host

    def insert(self, id, data):
        payload = {
            "action": "insert",
            "data": {
                "id": id,
                **data
            }
        }
        response = requests.post(f"{self.host}/api/query", json=payload)
        return response.json()

    def select(self, id=None):
        payload = {"action": "select"}
        if id is not None:
            payload["id"] = id
        
        response = requests.post(f"{self.host}/api/query", json=payload)
        return response.json()

    def query(self, raw_json):
        response = requests.post(f"{self.host}/api/query", json=raw_json)
        return response.json()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OnyxDB Terminal CLI")
    parser.add_argument("--host", default="http://localhost:8080", help="OnyxDB API Host")
    subparsers = parser.add_subparsers(dest="command")

    # Insert Command
    insert_parser = subparsers.add_parser("insert", help="Insert a record")
    insert_parser.add_argument("id", type=int, help="Record ID")
    insert_parser.add_argument("data", type=str, help="JSON Data string")

    # Select Command
    select_parser = subparsers.add_parser("select", help="Select a record")
    select_parser.add_argument("--id", type=int, help="Record ID (optional, omits for full scan)")

    args = parser.parse_args()
    db = OnyxDB(host=args.host)

    if args.command == "insert":
        data = json.loads(args.data)
        result = db.insert(args.id, data)
        print(json.dumps(result, indent=2))
    elif args.command == "select":
        result = db.select(args.id)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()
