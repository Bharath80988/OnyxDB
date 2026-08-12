# OnyxDB System Status and Roadmap

This document summarizes the current status, active capabilities, upcoming features, and architectural notes for **OnyxDB**.

---

## Completed Capabilities (v3.0.0)

- [x] **OS-Level Memory Mapping (`mmap`)**: Zero-copy operating system virtual memory page mapping (`MmapStorageManager.java`) bypassing heap memory allocations and context switches.
- [x] **Round-Robin Multi-Reactor TCP Server**: High-throughput non-blocking TCP socket server on port `8081` with Round-Robin worker load balancing (`RoundRobinWorkerGroup.java`).
- [x] **Primary B+ Tree Indexing**: Logarithmic time ($O(\log N)$) inserts, lookups, splits, updates, and deletes over 8KB disk pages.
- [x] **Secondary B+ Tree Indexing**: Logarithmic time ($O(\log N)$) secondary index scans for non-primary key fields (`email`, `role`, `status`) with automatic mutation synchronization.
- [x] **Schema Normalization & Foreign Key Constraints**: Relational cross-table Foreign Key enforcement (`RESTRICT` and `CASCADE` policies) with persistent `.schema` metadata storage (`SchemaManager.java`).
- [x] **Write-Ahead Logging (WAL)**: Append-only durability logs and automated log replay on startup.
- [x] **AI Vector Search**: Exact KNN Cosine Similarity search over vector arrays (`HnswIndex.java`).
- [x] **Role-Based Access Control (RBAC)**: Authorization Bearer token security (`ADMIN` vs `READ_ONLY`).
- [x] **Multi-Table Dynamic Routing**: Automatic creation and routing for table storage files (`<table_name>.db`).
- [x] **LRU Buffer Pool Memory Cache**: Disk page caching with LRU page eviction policy.
- [x] **Embedded Executable Uber-JAR**: Bundled React frontend static assets inside a standalone Java executable.
- [x] **Onyx Wire Protocol (OWP)**: Binary socket framing protocol (`0x4F4E5958` header, 9-byte binary header) over NIO TCP sockets (`OnyxWireProtocol.java`).
- [x] **`EXPLAIN` Query Profiler**: Cost-Based Query Optimizer (CBO) plan inspection for OQS queries (`EXPLAIN FIND ...`).
- [x] **Hybrid Search Engine**: Single query execution path combining HNSW KNN vector search with secondary index / relational metadata filtering (`executeHybridSearch`).
- [x] **Interactive Onyx CLI**: Terminal REPL shell with command suggestions and query execution (`OnyxCli.java`).
- [x] **High-Level Client SDKs**: Built-in helper wrappers in Python (`onyxdb.py`) and Node.js (`OnyxClient`).
- [x] **Multi-Language Package Distribution**: Published zero-dependency Python package (`pip install onyxdb`) and Node.js package (`npx onyxdb`).
- [x] **JWT Authentication & Studio Login**: Full-stack HMAC-SHA256 JWT auth (`JwtTokenProvider.java`), `/api/auth/login` endpoint, terminal CLI prompt (`OnyxCli.java`), and visual Onyx Studio login UI (`LoginPage.tsx`).

---

## Upcoming Roadmap

- [ ] **Multiversion Concurrency Control (MVCC)**: Snapshot isolation without read locks.
- [ ] **Distributed Consensus (Raft)**: Multi-node distributed cluster setup.

---

## Architecture Notes and System Health

- **Build Status**: `BUILD SUCCESS` across all Maven modules (`onyxdb-core`, `onyxdb-api`, `onyxdb-dashboard`).
- **Code Quality**: Clean modular architecture, standardized SLF4J logging, zero dead code.
- **Technical Debt Level**: Low.
