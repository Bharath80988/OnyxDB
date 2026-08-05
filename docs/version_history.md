# OnyxDB - Version History Timeline

This document tracks the complete chronological version history of **OnyxDB** from initial prototype to enterprise baseline.

---

## Version Timeline

### v0.1.0 — Initial Engine Prototype
- Storage Manager with 8KB disk page reads and writes using Java NIO.
- In-memory LRU Buffer Pool caching.
- Fundamental B+ Tree page serialization and point lookups.
- Basic Spring Boot REST wrapper and React dashboard.

### v0.2.0 — B+ Tree Leaf Splitting & Dynamic UI
- Automatic leaf node splitting when page capacity reaches 31 records.
- Conversion of root leaf into internal routing node.
- React Flow Visual Query Builder integration.
- 10 DaisyUI dynamic themes and smooth scrolling API documentation.

### v2.1.0 — Durability, Security & AI Vector Search
- Append-only Write-Ahead Logging (WAL) for ACID crash recovery.
- Role-Based Access Control (RBAC) token security (`ADMIN` vs `READ_ONLY`).
- Native exact KNN Vector Search using Cosine Similarity (`HnswIndex.java`).
- Environment variable configuration (`.env`).

### v2.2.0 — Multi-Platform Packaging & Distribution
- Bundling React dashboard inside standalone executable Uber-JAR (`onyxdb-api`).
- NPM wrapper (`npx onyxdb`) and Python Pip wrapper (`pip install onyxdb`).
- Docker multi-stage build optimization.

### v2.3.0 — B+ Tree Update/Delete & Binary Search Acceleration
- In-place B+ Tree record `UPDATE` operations.
- Slot-shifting memory `DELETE` operations.
- Logarithmic ($O(\log N)$) binary search algorithm over leaf page slots (`binarySearchLeaf`).
- WAL logging and automated recovery for updates and deletions.

### v2.4.0 — Secondary B+ Tree Indexing & Enterprise Refactoring
- Secondary B+ Tree Indexing (`SecondaryBTreeIndex.java`) for non-primary key queries.
- Dynamic `create_index` REST and Core action.
- Automated secondary index maintenance during `insert`, `update`, and `delete`.
- Index Scan query routing in $O(\log N)$ time.
- Enterprise codebase refactoring and documentation suite setup.

### v2.5.0 — Schema Normalization & Foreign Key Constraints
- Cross-table relational links and Foreign Key constraint engine ([`ForeignKeyConstraint.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/schema/ForeignKeyConstraint.java)).
- Persistence manager ([`SchemaManager.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/schema/SchemaManager.java)) for storing `.schema` files to disk across database restarts.
- Dynamic query action `create_foreign_key`.
- `RESTRICT` policy enforcement: blocks parent deletion when active child table references exist.
- `CASCADE` policy enforcement: automatically deletes child table records when parent record is deleted.
- Unit test coverage ([`ForeignKeyTest.java`](file:///d:/db/onyxdb-core/src/test/java/com/onyxdb/core/schema/ForeignKeyTest.java)).

### v0.2.0 — Onyx Query Syntax, Simplified SDKs & Professional Baseline
- **Onyx Query Syntax (OQS)**: Native string query parser (`ExecutionEngine.java`) for `GET`, `FIND`, `INSERT`, `UPDATE`, `DELETE`, and `INDEX` commands without JSON payload verbosity.
- **Python SDK Enhancements (`onyxdb.py` & `pip-wrapper`)**: High-level helper methods (`db.get()`, `db.find()`, `db.insert()`, `db.update()`, `db.delete()`, `db.oqs()`).
- **Node.js Client SDK (`npm-wrapper`)**: Exported `OnyxClient` helper class for Node applications.
- **Pure Java JSON Parser**: Embedded zero-dependency JSON parser (`parseSimpleJsonObject`) in `onyxdb-core`.
- **Zero-Emoji Professional Documentation**: Clean, standardized documentation across `README.md` and module READMEs.

### v3.0.0 — OS Memory Mapping, Round-Robin Worker Pool & Native TCP Multiplexing
- **OS Zero-Copy Memory Mapping ([`MmapStorageManager.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/storage/MmapStorageManager.java))**: Maps `.db` physical disk files directly into OS Virtual Memory Page Cache (`MappedByteBuffer`), eliminating heap buffer copying and user-kernel context switching overhead.
- **Off-Heap Direct Memory Acceleration**: Uses `ByteBuffer.allocateDirect()` in `StorageManager.java` to bypass JVM Garbage Collection pauses during high-concurrency I/O.
- **Round-Robin Multi-Reactor Event Loops ([`RoundRobinWorkerGroup.java`](file:///d:/db/onyxdb-api/src/main/java/com/onyxdb/api/network/RoundRobinWorkerGroup.java))**: Distributes client socket channels across CPU worker threads using a Round-Robin load-balancing algorithm.
- **Non-Blocking Native TCP Server ([`OnyxNativeSocketServer.java`](file:///d:/db/onyxdb-api/src/main/java/com/onyxdb/api/network/OnyxNativeSocketServer.java))**: High-throughput socket server on port `8081` bypassing HTTP servlet overhead for low latency queries.
- **Product Architecture Pitch ([`onyxdb_architecture_pitch.md`](file:///d:/db/docs/onyxdb_architecture_pitch.md))**: Technical competitive comparison against MySQL, PostgreSQL, and MongoDB.
