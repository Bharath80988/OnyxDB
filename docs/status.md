# OnyxDB System Status & Roadmap

This document serves as the single source of truth for the current state, health, active capabilities, pending items, and architectural notes of **OnyxDB**.

---

## 🟢 Completed Capabilities (v3.0.0)

- [x] **OS-Level Memory Mapping (`mmap`)**: Zero-copy OS virtual memory page cache mapping (`MmapStorageManager.java`) bypassing heap memory copies and context switching.
- [x] **Round-Robin Multi-Reactor TCP Server**: High-throughput non-blocking TCP socket server on port `8081` with Round-Robin worker load balancing (`RoundRobinWorkerGroup.java`).
- [x] **Primary B+ Tree Indexing**: $O(\log N)$ inserts, lookups, splits, updates, and deletes over 8KB disk pages.
- [x] **Secondary B+ Tree Indexing**: $O(\log N)$ secondary index scans for non-primary key fields (`email`, `role`, `status`) with automatic mutation synchronization.
- [x] **Schema Normalization & Foreign Key Constraints**: Relational cross-table Foreign Key enforcement (`RESTRICT` / `CASCADE`) with persistent `.schema` metadata storage (`SchemaManager.java`).
- [x] **Write-Ahead Logging (WAL)**: Append-only crash durability and automated log replay on startup.
- [x] **AI Vector Search**: Exact KNN Cosine Similarity search over high-dimensional vector arrays (`HnswIndex.java`).
- [x] **Role-Based Access Control (RBAC)**: Authorization Bearer token guard (`ADMIN` vs `READ_ONLY`).
- [x] **Multi-Table Dynamic Routing**: Automatic creation and loading of dynamic table storage files (`<table_name>.db`).
- [x] **LRU Buffer Pool Memory Cache**: Disk page caching with LRU page eviction policy.
- [x] **Embedded Executable Uber-JAR**: Bundled React frontend static assets inside standalone Java executable.
- [x] **Consolidated Documentation Suite**: Single lowercase [`docs/`](./) directory structure.

---

## 🟡 In Progress & Upcoming Roadmap

- [ ] **Multiversion Concurrency Control (MVCC)** (Day 10): Snapshot isolation without read locks.
- [ ] **JWT Authentication**: Signed JWT tokens replacing raw secret headers.
- [ ] **Distributed Consensus (Raft)**: Transition from single embedded node to distributed multi-node cluster.

---

## 🏗️ Architecture Notes & System Health

- **Build Status**: `BUILD SUCCESS` across all Maven modules (`onyxdb-core`, `onyxdb-api`, `onyxdb-dashboard`).
- **Code Coverage & Quality**: Clean modular architecture, standardized SLF4J logging, zero unused imports, zero dead code.
- **Technical Debt Level**: **Low** (Refactored and normalized across all production phases).
