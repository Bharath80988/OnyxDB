# OnyxDB - Project Structure & Directory Guide

This document provides a comprehensive guide to the folder hierarchy, responsibilities, and key components of **OnyxDB**.

---

## Workspace Directory Map

```text
OnyxDB/
├── onyxdb-core/              # Storage engine, B+ Trees, WAL, HNSW vector search
│   ├── src/main/java/com/onyxdb/core/
│   │   ├── engine/           # Internal engine wrappers & life cycle managers
│   │   ├── execution/        # Query execution engine & command router
│   │   ├── index/            # B+ Tree Primary & Secondary Indexing, HNSW vector search
│   │   ├── storage/          # Disk Page allocation, RandomAccess I/O & LRU BufferPool
│   │   └── wal/              # Append-only Write-Ahead Logging & crash recovery
│   └── src/test/java/        # JUnit5 unit tests for core engine components
├── onyxdb-api/               # Spring Boot REST API & Tomcat embedded web server
│   ├── src/main/java/com/onyxdb/api/
│   │   ├── OnyxDbApplication.java # Spring Boot entry point
│   │   ├── QueryController.java   # HTTP REST endpoints & RBAC security token guard
│   │   └── QueryService.java      # Service layer transaction boundaries & caching
│   └── src/main/resources/        # Application configurations & static assets
├── onyxdb-dashboard/         # React + Vite + DaisyUI administration interface
│   └── src/
│       ├── components/        # Reusable visual components & Theme toggles
│       ├── pages/             # Overview, Query Builder, Status, and Docs views
│       ├── hooks/             # Custom React hooks (e.g. useQuery)
│       └── lib/               # Utility functions and formatters
├── logs/                     # Release logs from v0.1.0 to v2.4.0
├── status/                   # System architecture documentation & feature status
│   ├── architecture.md       # High-level architecture map
│   └── functionalities/      # Implemented features and upcoming roadmap
└── versions/                 # Archived historical prototype iterations
    └── v1_prototype/          # Day 1 - Day 8 prototype logs and legacy artifacts
```

---

## Detailed Directory Breakdown

### 1. `onyxdb-core/`
* **Path:** `d:\db\onyxdb-core`
* **Purpose:** Core storage, indexing, memory management, and crash durability engine.
* **Responsibilities:**
  - Manages byte-level serialization onto 8KB disk pages.
  - Implements $O(\log N)$ B+ Tree primary key lookups and leaf splits.
  - Manages Secondary B+ Tree indexes for non-primary key queries.
  - Computes exact Cosine Similarity for AI vector embeddings.
  - Enforces ACID durability via append-only `.wal` logging.
* **Typical Files:** `BTreeManager.java`, `ExecutionEngine.java`, `StorageManager.java`, `BufferPool.java`, `WriteAheadLog.java`, `HnswIndex.java`.

### 2. `onyxdb-api/`
* **Path:** `d:\db\onyxdb-api`
* **Purpose:** Network layer exposing the core engine via HTTP REST APIs.
* **Responsibilities:**
  - Bootstraps embedded Tomcat server via Spring Boot.
  - Enforces Role-Based Access Control (RBAC) token security.
  - Manages query caching via Spring `@Cacheable` and `@CacheEvict`.
  - Serves statically embedded React dashboard assets.
* **Typical Files:** `OnyxDbApplication.java`, `QueryController.java`, `QueryService.java`, `application.properties`.

### 3. `onyxdb-dashboard/`
* **Path:** `d:\db\onyxdb-dashboard`
* **Purpose:** Modern visual web administration dashboard.
* **Responsibilities:**
  - Provides a React Flow visual node query builder.
  - Real-time telemetry monitoring for server stats and database activity.
  - Supports 10 DaisyUI themes and MongoDB-style smooth scrollspy documentation.
* **Typical Files:** `App.tsx`, `VisualQueryBuilder.tsx`, `Sidebar.tsx`, `ThemeToggle.tsx`.

### 4. `logs/`
* **Path:** `d:\db\logs`
* **Purpose:** Release log directory detailing feature releases from v0.1.0 to v2.4.0.

### 5. `status/`
* **Path:** `d:\db\status`
* **Purpose:** Active architecture and feature status tracking.

### 6. `versions/`
* **Path:** `d:\db\versions`
* **Purpose:** Archival directory for legacy prototype iterations, keeping production clean.
