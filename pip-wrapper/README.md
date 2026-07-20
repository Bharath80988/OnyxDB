# OnyxDB

**The Multi-Table Omni-Channel Database built natively on B+ Trees.**

OnyxDB is an embedded, offline-first, high-performance database written entirely in Java. It features a built-in React dashboard for visual management, requiring zero external dependencies.

## Quickstart

Run the database instantly from your terminal:

### Node.js (NPM)
```bash
npx onyxdb
```

### Python (Pip)
```bash
pip install onyxdb
onyxdb
```

## Features
- **B+ Tree Storage Engine:** Ultra-fast disk-based storage with O(log n) lookups.
- **Visual Dashboard:** An integrated, beautiful React UI served directly from the Java backend.
- **Role-Based Access Control (RBAC):** Native `ADMIN` and `READ_ONLY` authorization.
- **Write-Ahead Logging (WAL):** ACID compliance and system crash recovery.
- **Vector Search (HNSW):** Built-in native support for Cosine Similarity and K-Nearest Neighbors for AI embeddings.

## Architecture
OnyxDB operates entirely offline. When you run the CLI command, it boots a Spring Boot server locally on your machine on port `8080`, exposing the REST API and the React Dashboard simultaneously.

Enjoy using OnyxDB!
