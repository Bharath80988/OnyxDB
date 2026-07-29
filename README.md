# OnyxDB (v3.0.0)

> **The Multi-Table Omni-Channel Database built on B+ Trees.**

OnyxDB is a fast, local-first database built for a clean developer experience. It is fully offline capable, natively concurrent, and visual by design.

Unlike traditional relational database systems that require heavy setup, background services, and complex configuration files, OnyxDB runs entirely as an embedded Java library or a standalone server. It uses standard JSON payloads over HTTP and TCP socket connections, enabling straightforward integration with any modern application backend.

## Why OnyxDB?

- **Embeddability and Offline Operation:** Runs directly inside your Java application or locally on your system without requiring Docker containers or background daemon processes.
- **Visual Observability:** Includes a real-time dashboard that displays B+ Tree states, buffer pool cache metrics, and Write-Ahead Log events.
- **Zero Configuration:** Ready to run immediately without custom network socket rules, system user creation, or configuration files.
- **Multi-Table Dynamic Routing:** Automatically creates and routes query payloads to independent storage files (`<table_name>.db`).
- **Secondary Indexing:** Non-primary key queries execute in logarithmic time ($O(\log N)$) with automatic secondary index synchronization.
- **Schema Normalization & Foreign Keys:** Enforces cross-table relational integrity (`RESTRICT` and `CASCADE` policies) with persistent disk schemas.
- **OS Zero-Copy Memory Mapping (`mmap`)**: Maps storage files directly into Operating System Virtual Memory for direct off-heap page access without heap memory copies.
- **Round-Robin Multi-Reactor Event Loops**: Distributes client socket connections across CPU worker threads using Round-Robin scheduling for high multi-core throughput.

---

## Release Highlights

### v3.0.0: OS Memory Mapping, Round-Robin Worker Pool & Native TCP Server
- **OS Memory Mapping (`MmapStorageManager.java`)**: Maps database files directly into OS Virtual Memory using `MappedByteBuffer`, eliminating heap copying and user-kernel context switching overhead.
- **Round-Robin Multi-Reactor Worker Pool (`RoundRobinWorkerGroup.java`)**: Distributes TCP socket connections across worker event loops using Round-Robin load balancing.
- **Non-Blocking TCP Socket Server (`OnyxNativeSocketServer.java`)**: High-performance socket server running on port `8081` bypassing HTTP servlet overhead for low latency queries.
- **Technical Product Architecture Pitch ([`docs/onyxdb_architecture_pitch.md`](./docs/onyxdb_architecture_pitch.md))**: Complete architectural comparison against MySQL, PostgreSQL, and MongoDB.

### v2.5.0: Schema Normalization & Foreign Key Constraints
- **Foreign Key Engine (`ForeignKeyConstraint.java`)**: Relational integrity enforcement supporting `RESTRICT` and `CASCADE` deletion policies.
- **Schema Persistence (`SchemaManager.java`)**: Automatic `.schema` disk file serialization preserving schema rules across system restarts.
- **Master Query Guide ([`docs/query_guide.md`](./docs/query_guide.md))**: Complete developer reference manual for query syntax and usage.

### v2.4.0: Secondary B+ Tree Indexing & Query Acceleration
- **Secondary Index Engine (`SecondaryBTreeIndex.java`)**: Maps non-primary key values (`email`, `status`, `role`) to primary record IDs.
- **Automated Index Maintenance**: Automatically synchronizes secondary indexes during `insert`, `update`, and `delete` operations.

---

## Usage & Query Actions

OnyxDB accepts query payloads via standard HTTP `POST` requests to `http://localhost:8080/api/query` or non-blocking TCP socket connections on port `8081`.

### 1. Authentication (RBAC)
Include the appropriate `Authorization` header with requests:
- **Admin Role** (Full access: Insert, Update, Delete, Select, Create Index, Create Foreign Key):
  `Authorization: Bearer admin-secret-key`
- **Read-Only Role** (Selects and vector searches only):
  `Authorization: Bearer readonly-secret-key`

---

### 2. Query Actions

#### A. Insert Record
Inserts a record payload into the specified table.
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

#### B. Update Record
Modifies an existing record in place within the B+ Tree page.
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

#### C. Delete Record
Removes a record from B+ Tree leaf pages and shifts memory slots.
```json
{
  "action": "delete",
  "table": "users",
  "id": 1
}
```

#### D. Point Select by Primary Key
Performs a fast binary search lookup by primary key (`id`).
```json
{
  "action": "select",
  "table": "users",
  "id": 1
}
```

#### E. Create Secondary Index
Builds a secondary B+ Tree index on a specific attribute field (`email`).
```json
{
  "action": "create_index",
  "table": "users",
  "field": "email"
}
```

#### F. Select by Secondary Index
Retrieves matching records using a secondary index scan without scanning the entire table.
```json
{
  "action": "select",
  "table": "users",
  "where": { "email": "satoshi@bitcoin.org" }
}
```

#### G. Vector Search (AI KNN Cosine Similarity)
Queries the top `k` nearest vector embeddings using Cosine Similarity:
```json
{
  "action": "vector_search",
  "table": "products",
  "vector": [0.12, 0.85, 0.43, -0.21],
  "k": 5
}
```

#### H. Create Foreign Key Constraint
Enforces cross-table relational links between child and parent tables:
```json
{
  "action": "create_foreign_key",
  "table": "orders",
  "field": "user_id",
  "parent_table": "users",
  "parent_field": "id",
  "on_delete": "CASCADE"
}
```

For complete query documentation, complex filters, and advanced usage patterns, see the [Master Query Guide (`docs/query_guide.md`)](./docs/query_guide.md).

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
mvn clean package -DskipTests
java -jar onyxdb-api/target/onyxdb-api-0.1.3.jar
```

---

## Architecture Overview

OnyxDB is structured into three main modules:
- `onyxdb-core`: Java storage engine managing zero-copy memory mapping (`mmap`), B+ Tree indexing, vector HNSW search, foreign keys, and WAL durability.
- `onyxdb-api`: Service layer providing HTTP REST endpoints, non-blocking TCP socket multiplexing (`OnyxNativeSocketServer`), and RBAC authentication.
- `onyxdb-dashboard`: React web dashboard providing dynamic node-based query building and system metrics.

---

## Documentation

All documentation and technical guides are located in the [`docs/`](./docs) directory:
- [Project Folder Structure](docs/structure.md)
- [File Index and Component Catalog](docs/file_index.md)
- [System Status and Roadmap](docs/status.md)
- [Architecture Overview](docs/architecture.md)
- [Master Query Guide](docs/query_guide.md)
- [Product Architecture Pitch and Comparison](docs/onyxdb_architecture_pitch.md)
