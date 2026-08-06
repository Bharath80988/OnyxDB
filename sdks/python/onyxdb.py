import requests
import argparse
import json

class OnyxDB:
    def __init__(self, host="http://localhost:8080", token="admin-secret-key"):
        self.host = host.rstrip('/')
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}" if not token.startswith("Bearer ") else token
        }

    def _post(self, payload):
        response = requests.post(f"{self.host}/api/query", json=payload, headers=self.headers)
        return response.json()

    def get(self, table, record_id):
        """Point lookup by primary key ID."""
        return self._post({"action": "select", "table": table, "id": record_id})

    def find(self, table, where=None):
        """Filtered scan or full table scan."""
        payload = {"action": "select", "table": table}
        if where:
            payload["where"] = where
        return self._post(payload)

    def insert(self, table, record_id, data=None):
        """Insert record into table."""
        record = {"id": record_id}
        if data:
            record.update(data)
        return self._post({"action": "insert", "table": table, "data": record})

    def update(self, table, record_id, updates):
        """Update existing record in place."""
        record = {"id": record_id}
        record.update(updates)
        return self._post({"action": "update", "table": table, "data": record})

    def delete(self, table, record_id):
        """Delete record by ID."""
        return self._post({"action": "delete", "table": table, "id": record_id})

    def create_index(self, table, field):
        """Create secondary B+ Tree index on table field."""
        return self._post({"action": "create_index", "table": table, "field": field})

    def vector_search(self, table, vector, k=5):
        """Execute AI vector nearest neighbor search."""
        return self._post({"action": "vector_search", "table": table, "vector": vector, "k": k})

    def oqs(self, query_string):
        """Execute a string query in Onyx Query Syntax (e.g. 'GET users 101')."""
        return self._post({"oqs": query_string})

    def explain(self, query_string):
        """Return the Cost-Based Optimizer (CBO) execution plan for an OQS query."""
        return self._post({"oqs": f"EXPLAIN {query_string}"})

    def hybrid_search(self, table, vector, where=None, k=5):
        """KNN Cosine vector search combined with a relational field filter."""
        payload = {"action": "hybrid_search", "table": table, "vector": vector, "k": k}
        if where:
            payload["where"] = where
        return self._post(payload)

    def query(self, raw_json):
        """Execute a raw JSON query dictionary."""
        return self._post(raw_json)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OnyxDB Terminal CLI")
    parser.add_argument("--host", default="http://localhost:8080", help="OnyxDB API Host")
    parser.add_argument("--token", default="admin-secret-key", help="Authorization Token")
    subparsers = parser.add_subparsers(dest="command")

    # OQS Command
    oqs_parser = subparsers.add_parser("oqs", help="Execute Onyx Query Syntax string")
    oqs_parser.add_argument("query", type=str, help="OQS String (e.g., 'GET users 101')")

    # Insert Command
    insert_parser = subparsers.add_parser("insert", help="Insert a record")
    insert_parser.add_argument("--table", required=True, help="Table name")
    insert_parser.add_argument("id", type=int, help="Record ID")
    insert_parser.add_argument("data", type=str, help="JSON Data string")

    # Select Command
    select_parser = subparsers.add_parser("get", help="Get a record by ID")
    select_parser.add_argument("--table", required=True, help="Table name")
    select_parser.add_argument("id", type=int, help="Record ID")

    args = parser.parse_args()
    db = OnyxDB(host=args.host, token=args.token)

    if args.command == "oqs":
        result = db.oqs(args.query)
        print(json.dumps(result, indent=2))
    elif args.command == "insert":
        data = json.loads(args.data)
        result = db.insert(args.table, args.id, data)
        print(json.dumps(result, indent=2))
    elif args.command == "get":
        result = db.get(args.table, args.id)
        print(json.dumps(result, indent=2))
    else:
        parser.print_help()
