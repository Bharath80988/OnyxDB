# OnyxDB (v2.4.0)

> **The Multi-Table Omni-Channel Database built on B+ Trees.**

OnyxDB is a lightning-fast, local-first database built from the ground up for the modern developer experience. Fully offline capable, natively concurrent, and hyper-visual by design.

Unlike traditional RDBMS systems that require heavy installations, background services, and complex configurations, OnyxDB runs entirely as an embedded JAR or standalone server. It speaks pure JSON over HTTP natively, allowing seamless integration with any modern backend framework.

## Why OnyxDB?

- **Embeddability & Offline-First:** Runs inside your Java process or locally without spinning up Docker containers or managing background services. Perfect for local dev environments.
- **Visual Transparency:** The out-of-the-box Dashboard visually shows you exactly what the B+ Tree, Buffer Pool, and Write-Ahead Log are doing in real-time.
- **Zero Configuration:** Click, start, and query. No `pg_hba.conf`, no user creation scripts, no socket configuration.
- **Multi-Table Dynamic Routing:** Automatically routes JSON payloads to independent B+ Trees on the fly.
- **Secondary B+ Tree Indexing:** Non-primary key queries execute in $O(\log N)$ time with automatic index synchronization.

## Release Highlights

### v2.4.0: Secondary B+ Tree Indexing & Query Acceleration
- **Secondary Index Engine (`SecondaryBTreeIndex.java`)**: Maps secondary string attribute values (e.g. `email`, `role`, `status`) to primary key integer record IDs (`id`).
- **Dynamic Index Creation (`create_index`)**: Easily create indexes over existing B+ Tree record pages on demand.
- **Automated Index Maintenance**: `insert`, `update`, and `delete` operations automatically synchronize registered secondary indexes.
- **Index Scan Query Routing**: `select` queries with `"where"` filters transparently execute Secondary Index Scans in $O(\log N)$ time, avoiding full table scans.
- **RBAC Protection**: Administrative `create_index` actions are protected with `ADMIN` Bearer tokens.

### v2.3.0: B+ Tree Update/Delete & Binary Search Acceleration
- **Update & Delete Operations**: In-place modifications and slot-shifting deletions.
- **Binary Search Acceleration**: Leaf page searches utilize $O(\log N)$ binary search indexing over 256-byte page slots.
- **WAL Durability**: Append-only durability logging for crash recovery.
- **RBAC Security Guard**: Restricts mutative and administrative operations to `ADMIN` Bearer tokens.

---

## ⚡ What OnyxDB Can Do & How To Use It

OnyxDB processes queries over standard HTTP `POST` requests to `http://localhost:8080/api/query`.

### 1. Authentication (RBAC)
Include the appropriate `Authorization` header with your requests:
- **Admin Role** (Full access: Insert, Update, Delete, Select, Create Index):
  `Authorization: Bearer admin-secret-key`
- **Read-Only Role** (Selects only, rejects mutations):
  `Authorization: Bearer readonly-secret-key`

---

### 2. Supported Query Actions

#### **A. Insert / Upsert Record**
Inserts a record into the target table (dynamically creating `<table_name>.db` if it doesn't exist).
```json
{
  "action": "insert",
  "table": "users",
  "data": {
    "id": 1,
    "name": "Satoshi Nakamoto",
    "email": "satoshi@bitcoin.org",
    "role": "admin"
  }
}
```

#### **B. Update Record**
Modifies an existing record in place inside the B+ Tree page.
```json
{
  "action": "update",
  "table": "users",
  "data": {
    "id": 1,
    "name": "Satoshi Nakamoto",
    "email": "satoshi@bitcoin.org",
    "role": "founder"
  }
}
```

#### **C. Delete Record**
Removes a record from B+ Tree leaf pages and shifts slot memory.
```json
{
  "action": "delete",
  "table": "users",
  "id": 1
}
```

#### **D. Point Select by Primary Key ($O(\log N)$)**
Fast binary search lookup by primary key `id`.
```json
{
  "action": "select",
  "table": "users",
  "id": 1
}
```

#### **E. Create Secondary Index ($O(\log N)$ Lookups on Non-Primary Keys)**
Builds a secondary index on a specific field (e.g. `email`).
```json
{
  "action": "create_index",
  "table": "users",
  "field": "email"
}
```

#### **F. Select by Secondary Index ($O(\log N)$ Index Scan)**
Retrieves records matching secondary attribute values via Secondary Index Scan without scanning the entire table.
```json
{
  "action": "select",
  "table": "users",
  "where": { "email": "satoshi@bitcoin.org" }
}
```

#### **G. Vector Search (AI KNN Cosine Similarity)**
Insert vector arrays in your payload and query top `k` mathematically similar items:
```json
{
  "action": "vector_search",
  "table": "products",
  "vector": [0.12, 0.85, 0.43, -0.21],
  "k": 5
}
```

---

## Getting Started

### 1. Node.js (NPM)
```bash
npx onyxdb
```

### 2. Python (Pip)
```bash
pip install onyxdb
onyxdb
```

### 3. Java (JitPack)
Add JitPack dependency to `pom.xml`:
```xml
<dependency>
    <groupId>com.github.Bharath80988</groupId>
    <artifactId>OnyxDB</artifactId>
    <version>v0.1.3</version>
</dependency>
```

### 4. Build from Source
```bash
git clone https://github.com/Bharath80988/OnyxDB.git
cd OnyxDB
.\maven-bin\apache-maven-3.9.6\bin\mvn.cmd clean package -DskipTests
java -jar onyxdb-api/target/onyxdb-api-0.1.3.jar
```
*Note: OnyxDB statically bundles the React dashboard directly inside the Java `.jar` file!*

---

## Architecture

OnyxDB operates across three isolated modules:
- `onyxdb-core`: Java 21 storage engine with Page Manager, B+ Tree primary & secondary indexes, Vector HNSW search, and WAL crash recovery.
- `onyxdb-api`: Spring Boot REST API layer handling query dispatching, RBAC authentication, and caching.
- `onyxdb-dashboard`: React + Vite UI featuring Visual Query Builder, real-time telemetry metrics, and 10 dynamic themes.

## Status & Roadmap

To view our comprehensive implemented features list and upcoming roadmap items, navigate to the `/status` page in the OnyxDB Dashboard or view `status/functionalities/roadmap.md`.
