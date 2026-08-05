import requests
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
        """Execute string query in Onyx Query Syntax (e.g. 'GET users 101')."""
        return self._post({"oqs": query_string})

    def query(self, raw_json):
        """Execute raw JSON query dictionary."""
        return self._post(raw_json)
