"""ForgeQL Python Client SDK — high-level helper methods for ForgeQL REST API queries."""

import requests
import json

class ForgeQL:
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

    def fql(self, query_string):
        """Execute a string query in Forge Query Syntax (e.g. 'GET users 101')."""
        return self._post({"fql": query_string})

    def explain(self, query_string):
        """Return Cost-Based Optimizer (CBO) execution plan for the given FQL query.

        Example:
            db.explain("FIND users WHERE status = ACTIVE")
        """
        return self._post({"fql": f"EXPLAIN {query_string}"})

    def hybrid_search(self, table, vector, where=None, k=5):
        """Execute Hybrid Search: KNN Cosine vector similarity combined with relational field filters.

        Args:
            table:  Target table name.
            vector: Float list query embedding.
            where:  Optional dict of field filters applied after vector ranking.
            k:      Number of nearest neighbors to return before filtering.

        Example:
            db.hybrid_search("docs", [0.1, 0.9, 0.3], where={"status": "ACTIVE"}, k=10)
        """
        payload = {"action": "hybrid_search", "table": table, "vector": vector, "k": k}
        if where:
            payload["where"] = where
        return self._post(payload)

    def query(self, raw_json):
        """Execute a raw JSON query dictionary against the REST API."""
        return self._post(raw_json)
