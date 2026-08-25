"""
ForgeQL Hybrid Relational + Vector Query Example (Python SDK)
============================================================
Demonstrates combining relational filters with HNSW Cosine Similarity vector search.
"""

import requests
import json

DB_URL = "http://localhost:8080"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer admin-secret-key"
}

def main():
    print("⚡ Executing Hybrid Relational + AI Vector Query...")

    hybrid_query = {
        "action": "hybrid_search",
        "table": "products",
        "vector": [0.12, 0.85, 0.43, -0.21],
        "k": 5,
        "where": {
            "category": "hardware",
            "in_stock": True
        }
    }

    res = requests.post(f"{DB_URL}/api/query", json=hybrid_query, headers=HEADERS)
    print("Hybrid Query Results:")
    print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    main()
