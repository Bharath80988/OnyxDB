"""
OnyxDB Native HNSW Vector Search Example (Python SDK)
=====================================================
Demonstrates loading AI embeddings into HNSW graphs and executing KNN similarity searches.
"""

import requests
import json

DB_URL = "http://localhost:8080"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer admin-secret-key"
}

def main():
    print("🤖 Executing HNSW Vector KNN Search in OnyxDB...")

    # Query 1536-dimensional or 4-dimensional vector embedding
    vector_query = {
        "action": "vector_search",
        "table": "embeddings",
        "vector": [0.12, 0.85, 0.43, -0.21],
        "k": 5
    }

    res = requests.post(f"{DB_URL}/api/query", json=vector_query, headers=HEADERS)
    print("Top-K Vector Nearest Neighbors Response:")
    print(json.dumps(res.json(), indent=2))

if __name__ == "__main__":
    main()
