# OnyxDB - Project Structure & Directory Guide

This document provides a comprehensive guide to the folder hierarchy, responsibilities, and key components of **OnyxDB**.

---

## Workspace Directory Map

```text
OnyxDB/
├── README.md                 # Primary GitHub repository documentation
├── docs/                     # Centralized documentation directory
│   ├── structure.md          # Project folder structure reference
│   ├── file_index.md         # Component catalog and dependencies
│   ├── status.md             # System health & current capabilities
│   ├── architecture.md       # Core architecture map
│   ├── implemented.md        # Implemented feature inventory
│   ├── roadmap.md            # Upcoming technical roadmap
│   ├── refactor_log.md       # Audit trail of codebase refactorings
│   ├── version_history.md    # Chronological version timeline
│   ├── paths.md              # Developer path guide
│   ├── logs/                 # Release logs (v0.1.0 to v2.4.0)
│   └── versions/             # Archived historical prototype iterations
├── onyxdb-core/              # Storage engine, B+ Trees, WAL, HNSW vector search
│   └── src/main/java/com/onyxdb/core/
│       ├── execution/        # Query execution engine & command router
│       ├── index/            # B+ Tree Primary & Secondary Indexing, HNSW vector search
│       ├── storage/          # Disk Page allocation, RandomAccess I/O & LRU BufferPool
│       └── wal/              # Append-only Write-Ahead Logging & crash recovery
├── onyxdb-api/               # Spring Boot REST API & Tomcat embedded web server
│   └── src/main/java/com/onyxdb/api/
│       ├── OnyxDbApplication.java # Spring Boot entry point
│       ├── QueryController.java   # HTTP REST endpoints & RBAC security token guard
│       └── QueryService.java      # Service layer transaction boundaries & caching
├── onyxdb-dashboard/         # React + Vite + DaisyUI administration interface
│   └── src/
│       ├── components/        # Reusable visual components & Theme toggles
│       ├── pages/             # Overview, Query Builder, Status, and Docs views
│       ├── hooks/             # Custom React hooks (e.g. useQuery)
│       └── lib/               # Utility functions and formatters
├── sdks/                     # Client SDKs (Python CLI, etc.)
├── npm-wrapper/              # NPM global distribution package
└── pip-wrapper/              # Python PyPI distribution package
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

### 2. `onyxdb-api/`
* **Path:** `d:\db\onyxdb-api`
* **Purpose:** Network layer exposing the core engine via HTTP REST APIs.
* **Responsibilities:**
  - Bootstraps embedded Tomcat server via Spring Boot.
  - Enforces Role-Based Access Control (RBAC) token security.
  - Serves statically embedded React dashboard assets.

### 3. `onyxdb-dashboard/`
* **Path:** `d:\db\onyxdb-dashboard`
* **Purpose:** Modern visual web administration dashboard.
* **Responsibilities:**
  - Provides a React Flow visual node query builder.
  - Real-time telemetry monitoring for server stats and database activity.
  - Supports 10 DaisyUI themes and MongoDB-style smooth scrollspy documentation.

### 4. `docs/`
* **Path:** `d:\db\docs`
* **Purpose:** Single consolidated lowercase documentation root containing all system guides, release logs, architecture maps, and archived prototype versions.
