# OnyxDB v4.0.0 Master Architecture Roadmap

This document outlines the master architecture roadmap for **OnyxDB v4.0.0**, organizing technical enhancements across core subsystems: Storage, Indexing, AI & Vector Search, Networking, Query Engine, Developer Experience, Onyx Studio Visual IDE, and Long-Term Enterprise Features.

---

## 1. Storage Engine Subsystem

### 1. Write-Ahead Logging (WAL)
- **Status:** Implemented (v2.1.0)
- **Description:** Append-only transaction logging guaranteeing ACID crash recovery by replaying mutation logs on startup.

### 2. Multi-Version Concurrency Control (MVCC)
- **Status:** Planned (v4.0.0 Milestone 2)
- **Description:** Tuple versioning (`xmin`, `xmax`) providing Snapshot Isolation without read locks.

### 3. Advanced Slotted Page Storage & Compaction
- **Status:** In Progress
- **Description:** Page headers, slot directory reorganization, variable-length record packing, and background page compaction to reduce fragmentation.

### 4. Memory-Mapped Page Cache (`mmap`)
- **Status:** Implemented (v3.0.0)
- **Description:** Zero-copy OS virtual memory page cache mapping (`MmapStorageManager.java`) and off-heap direct memory allocation.

### 5. Page Compression Engine
- **Status:** Planned (v4.0.0 Milestone 3)
- **Description:** LZ4/ZSTD page block compression before writing pages to disk storage.

### 6. Bloom Filters
- **Status:** Planned (v4.0.0 Milestone 3)
- **Description:** Probabilistic Bloom filters per page block to eliminate unnecessary page reads during failed point lookups.

---

## 2. Indexing & Optimization Subsystem

### 7. B+ Tree Page Management
- **Status:** Implemented (v2.4.0)
- **Description:** Primary B+ Trees with $O(\log N)$ binary search node indexing and dynamic secondary index synchronization.

### 8. Cost-Based Query Optimizer (CBO)
- **Status:** Planned (v4.0.0 Milestone 2)
- **Description:** Evaluates query paths using table statistics and index selectivity to choose optimal execution plans.

### 9. Table Statistics Engine
- **Status:** Planned (v4.0.0 Milestone 2)
- **Description:** Maintains row counts, min/max values, and value distribution histograms for query planning.

---

## 3. AI & Vector Engine Subsystem

### 10. Hybrid Search Engine
- **Status:** In Progress
- **Description:** Unified execution path combining keyword search, relational foreign key filtering, and vector similarity search in a single query.

### 11. SIMD Vector Acceleration
- **Status:** Planned (v4.0.0 Milestone 4)
- **Description:** Java Vector API SIMD hardware acceleration for Cosine Similarity and dot-product calculations.

---

## 4. Networking Engine Subsystem

### 12. Onyx Wire Protocol (OWP)
- **Status:** Planned (v4.0.0 Milestone 1)
- **Description:** Binary wire protocol replacing raw JSON over TCP sockets for lower latency and smaller packet overhead.

### 13. Zero-Copy TCP Networking
- **Status:** Implemented (v3.0.0)
- **Description:** Non-blocking Java NIO socket channels (`ServerSocketChannel` & `Selector`) with direct off-heap memory transfers.

### 14. Round-Robin Multi-Reactor Event Loops
- **Status:** Implemented (v3.0.0)
- **Description:** `RoundRobinWorkerGroup.java` distributing TCP client connections across CPU worker threads.

### 15. Persistent Connection Pooling
- **Status:** Implemented (v3.0.0)
- **Description:** Non-blocking keep-alive connection reuse across queries.

---

## 5. Query Engine Subsystem

### 16. Onyx Query Language (OQL)
- **Status:** Planned (v4.0.0 Milestone 1 - Next Step)
- **Description:** Human-friendly, SQL-inspired declarative query syntax (e.g. `FIND users WHERE age > 20`).

### 17. Lexer, Parser, and AST Execution Planner
- **Status:** Planned (v4.0.0 Milestone 1 - Next Step)
- **Description:** Converts OQL text into Abstract Syntax Tree (AST) nodes and translates AST into `ExecutionEngine` execution steps.

### 18. `EXPLAIN` Query Profiler
- **Status:** Planned (v4.0.0 Milestone 1 - Next Step)
- **Description:** Outputs execution plan estimates, index selections, and cost evaluations prior to query execution.

---

## 6. Developer Experience & Distribution Subsystem

### 19. Interactive Onyx CLI
- **Status:** Planned (v4.0.0 Milestone 1)
- **Description:** Terminal REPL (`onyx`) featuring auto-completion, syntax highlighting, and query execution.

### 20. Multi-Language Client SDKs (Python & Node.js)
- **Status:** Implemented (PyPI `onyxdb` & NPM `onyxdb`)
- **Description:** Python Pip package (`pip install onyxdb`) and Node.js package (`npx onyxdb`) offering embedded server bootstrapping and socket driver clients.

---

## 7. Onyx Studio (Visual Database IDE)

### 21. Drag-and-Drop Database Designer
- Visual canvas for designing tables, defining column data types, and establishing foreign key relationships.

### 22. Visual Query Builder
- Node-based interface generating OQL queries automatically.

### 23. Database Explorer & Live Data Viewer
- Spreadsheet-style record browser with inline editing, pagination, and sorting.

### 24. Real-Time Telemetry & Monitoring Dashboard
- Live dashboard tracking CPU usage, memory cache hit ratios, active worker threads, and query latencies.

---

## 8. Enterprise Features (v5+ Long-Term Roadmap)

- **Replication & Automatic Failover**: Leader-follower replication and automated leader election.
- **Horizontal Sharding & Distributed Queries**: Primary key range partitioning across cluster nodes.
- **Security & Compliance**: Signed JWT tokens, TLS encryption, and audit logging.
- **Change Data Capture (CDC)**: Streaming database mutation events to external message buses.
