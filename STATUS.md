# OnyxDB System Status & Roadmap

This document serves as the single source of truth for the current state, health, active capabilities, pending items, and architectural notes of **OnyxDB**.

---

## 🟢 Completed Capabilities (v2.4.0)

- [x] **Primary B+ Tree Indexing**: $O(\log N)$ inserts, lookups, splits, updates, and deletes over 8KB disk pages.
- [x] **Secondary B+ Tree Indexing**: $O(\log N)$ secondary index scans for non-primary key fields (`email`, `role`, `status`) with automatic mutation synchronization.
- [x] **Write-Ahead Logging (WAL)**: Append-only crash durability and automated log replay on startup.
- [x] **AI Vector Search**: Exact KNN Cosine Similarity search over high-dimensional vector arrays (`HnswIndex.java`).
- [x] **Role-Based Access Control (RBAC)**: Authorization Bearer token guard (`ADMIN` vs `READ_ONLY`).
- [x] **Multi-Table Dynamic Routing**: Automatic creation and loading of dynamic table storage files (`<table_name>.db`).
- [x] **LRU Buffer Pool Memory Cache**: Disk page caching with LRU page eviction policy.
- [x] **Embedded Executable Uber-JAR**: Bundled React frontend static assets inside standalone Java executable.
- [x] **Comprehensive Documentation Suite**: `PROJECT_STRUCTURE.md`, `FILE_INDEX.md`, `STATUS.md`, `REFACTOR_LOG.md`, `VERSION_HISTORY.md`, `PATHS.md`.

---

## 🟡 In Progress & Upcoming Roadmap

- [ ] **Schema Normalization & Foreign Key Constraints** (Day 9): Relational cross-table link enforcement and validation.
- [ ] **Multiversion Concurrency Control (MVCC)** (Day 10): Snapshot isolation without read locks.
- [ ] **JWT Authentication**: Signed JWT tokens replacing raw secret headers.
- [ ] **Distributed Consensus (Raft)**: Transition from single embedded node to distributed multi-node cluster.

---

## 🏗️ Architecture Notes & System Health

- **Build Status**: `BUILD SUCCESS` across all Maven modules (`onyxdb-core`, `onyxdb-api`, `onyxdb-dashboard`).
- **Code Coverage & Quality**: Clean modular architecture, standardized SLF4J logging, zero unused imports, zero dead code.
- **Technical Debt Level**: **Low** (Refactored and normalized across all 21 production phases).
