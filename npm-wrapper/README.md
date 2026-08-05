# OnyxDB (v0.2.0)

**The Multi-Table Omni-Channel Database built natively on B+ Trees.**

OnyxDB is an embedded, offline-first, high-performance database written entirely in Java. It features a built-in React dashboard for visual management and zero external runtime dependencies.

## Quickstart

Run the database server instantly from your terminal:

```bash
npx onyxdb
```

Or connect directly in Node.js:

```javascript
const { OnyxClient } = require('onyxdb');

const db = new OnyxClient('http://localhost:8080', 'admin-secret-key');

async function main() {
    await db.insert('users', 101, { name: 'Satoshi Nakamoto' });
    const user = await db.get('users', 101);
    console.log(user);

    // Onyx Query Syntax (OQS)
    const results = await db.oqs('FIND users WHERE role = ADMIN');
    console.log(results);
}

main();
```

## Core Features
- **B+ Tree Storage Engine**: Disk-based storage with O(log n) lookups.
- **Onyx Query Syntax (OQS)**: Lightweight human-readable string query language (`GET`, `FIND`, `INSERT`, `UPDATE`, `DELETE`, `INDEX`).
- **Visual Dashboard**: Integrated React UI served directly from the backend.
- **Role-Based Access Control (RBAC)**: Native `ADMIN` and `READ_ONLY` authorization.
- **Write-Ahead Logging (WAL)**: ACID durability and automated crash recovery.
- **Vector Search (HNSW)**: Cosine Similarity and K-Nearest Neighbors for AI embeddings.

## Engine Architecture
OnyxDB operates offline. Running the CLI command boots a Spring Boot server on port `8080`, exposing the REST API and Onyx Studio dashboard simultaneously.
