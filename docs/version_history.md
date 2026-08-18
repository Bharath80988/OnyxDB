# ForgeQL - Version History Timeline

This document tracks the complete chronological version history of **ForgeQL** from initial prototype to enterprise baseline.

---

## Version Timeline

### v4.1.0 — Full-Stack JWT Authentication, AuthController & Studio Login Screen
- **Zero-Dependency JWT Provider ([`JwtTokenProvider.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/security/JwtTokenProvider.java))**: Lightweight HMAC-SHA256 token generation, Base64URL encoding, and claims-based RBAC parsing (`sub`, `role`, `exp`).
- **REST Authentication Endpoint ([`AuthController.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/AuthController.java))**: Added `POST /api/auth/login` endpoint issuing signed JWT Bearer tokens for `ADMIN` and `READ_ONLY` accounts.
- **Dynamic Rest API & Terminal CLI Auth**: Integrated token verification into [`QueryController.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/QueryController.java) and startup authentication prompt in [`ForgeCli.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/cli/ForgeCli.java).
- **Forge Studio Visual Login Page ([`LoginPage.tsx`](file:///d:/db/forgeql-dashboard/src/pages/LoginPage.tsx))**: Glassmorphic login UI screen, session storage token management, and user role badges in [`Navbar.tsx`](file:///d:/db/forgeql-dashboard/src/components/Navbar.tsx).
- **Unit Test Suite ([`JwtAuthTest.java`](file:///d:/db/forgeql-api/src/test/java/com/forgeql/api/security/JwtAuthTest.java))**: 100% test coverage for token generation, claims extraction, tampered signature rejection, and token expiration.

### v4.0.0 — Forge Wire Protocol, EXPLAIN Profiler, Hybrid Search & Interactive CLI
- **Forge Wire Protocol (OWP)**: 9-byte binary header socket protocol (`0x4F4E5958` "FORGE" magic bytes) over NIO TCP socket streams.
- **`EXPLAIN` Query Profiler**: Cost-Based Query Optimizer (CBO) plan inspection detailing plan types (`POINT_LOOKUP`, `SECONDARY_INDEX_SCAN`, `FULL_TABLE_SCAN`) and I/O costs.
- **Hybrid Search Engine**: Single query execution path combining HNSW KNN Cosine vector search with secondary index / relational metadata filtering (`hybrid_search`).
- **Interactive Forge CLI**: Terminal REPL interactive shell with command auto-completion suggestions, execution timing, and formatted table outputs (`ForgeCli.java`).

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
- Bundling React dashboard inside standalone executable Uber-JAR (`forgeql-api`).
- NPM wrapper (`npx forgeql`) and Python Pip wrapper (`pip install forgeql`).
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
- Cross-table relational links and Foreign Key constraint engine ([`ForeignKeyConstraint.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/schema/ForeignKeyConstraint.java)).
- Persistence manager ([`SchemaManager.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/schema/SchemaManager.java)) for storing `.schema` files to disk across database restarts.
- Dynamic query action `create_foreign_key`.
- `RESTRICT` policy enforcement: blocks parent deletion when active child table references exist.
- `CASCADE` policy enforcement: automatically deletes child table records when parent record is deleted.
- Unit test coverage ([`ForeignKeyTest.java`](file:///d:/db/forgeql-core/src/test/java/com/forgeql/core/schema/ForeignKeyTest.java)).

### v0.2.0 — Forge Query Syntax, Simplified SDKs & Professional Baseline
- **Forge Query Syntax (FQL)**: Native string query parser (`ExecutionEngine.java`) for `GET`, `FIND`, `INSERT`, `UPDATE`, `DELETE`, and `INDEX` commands without JSON payload verbosity.
- **Python SDK Enhancements (`forgeql.py` & `pip-wrapper`)**: High-level helper methods (`db.get()`, `db.find()`, `db.insert()`, `db.update()`, `db.delete()`, `db.fql()`).
- **Node.js Client SDK (`npm-wrapper`)**: Exported `ForgeClient` helper class for Node applications.
- **Pure Java JSON Parser**: Embedded zero-dependency JSON parser (`parseSimpleJsonObject`) in `forgeql-core`.
- **Zero-Emoji Professional Documentation**: Clean, standardized documentation across `README.md` and module READMEs.

### v3.0.0 — OS Memory Mapping, Round-Robin Worker Pool & Native TCP Multiplexing
- **OS Zero-Copy Memory Mapping ([`MmapStorageManager.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/storage/MmapStorageManager.java))**: Maps `.db` physical disk files directly into OS Virtual Memory Page Cache (`MappedByteBuffer`), eliminating heap buffer copying and user-kernel context switching overhead.
- **Off-Heap Direct Memory Acceleration**: Uses `ByteBuffer.allocateDirect()` in `StorageManager.java` to bypass JVM Garbage Collection pauses during high-concurrency I/O.
- **Round-Robin Multi-Reactor Event Loops ([`RoundRobinWorkerGroup.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/network/RoundRobinWorkerGroup.java))**: Distributes client socket channels across CPU worker threads using a Round-Robin load-balancing algorithm.
- **Non-Blocking Native TCP Server ([`ForgeNativeSocketServer.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/network/ForgeNativeSocketServer.java))**: High-throughput socket server on port `8081` bypassing HTTP servlet overhead for low latency queries.
- **Product Architecture Pitch ([`forgeql_architecture_pitch.md`](file:///d:/db/docs/forgeql_architecture_pitch.md))**: Technical competitive comparison against MySQL, PostgreSQL, and MongoDB.
