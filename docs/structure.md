# ForgeQL - Project Structure and Directory Guide

This document provides a guide to the folder hierarchy, responsibilities, and components of **ForgeQL**.

---

## Workspace Directory Map

```text
ForgeQL/
├── README.md                 # Primary GitHub repository documentation
├── docs/                     # Centralized documentation directory
│   ├── structure.md          # Project folder structure reference
│   ├── file_index.md         # Component catalog and dependencies
│   ├── status.md             # System health and current capabilities
│   ├── architecture.md       # Core architecture map
│   ├── implemented.md        # Implemented feature inventory
│   ├── roadmap.md            # Upcoming technical roadmap
│   ├── query_guide.md        # Master query developer guide
│   ├── forgeql_architecture_pitch.md # Product architecture and comparison matrix
│   ├── refactor_log.md       # Audit trail of codebase refactorings
│   ├── version_history.md    # Chronological version timeline
│   ├── paths.md              # Developer path guide
│   ├── logs/                 # Release logs (v0.1.0 to v2.4.0)
│   └── versions/             # Archived historical prototype iterations
├── forgeql-core/              # Storage engine, B+ Trees, WAL, HNSW vector search, mmap
│   └── src/main/java/com/forgeql/core/
│       ├── execution/        # Query execution engine and command router
│       ├── index/            # B+ Tree primary and secondary indexing, HNSW vector search
│       ├── schema/           # Foreign key constraints and schema persistence
│       ├── storage/          # Memory-mapped files (mmap), page allocation, LRU buffer pool
│       └── wal/              # Append-only Write-Ahead Logging and crash recovery
├── forgeql-api/               # Spring Boot REST API, NIO socket server, embedded UI
│   └── src/main/java/com/forgeql/api/
│       ├── network/          # Non-blocking TCP socket server and Round-Robin worker group
│       ├── ForgeDbApplication.java # Spring Boot entry point
│       ├── QueryController.java   # HTTP REST endpoints and RBAC security token guard
│       └── QueryService.java      # Service layer transaction boundaries and caching
├── forgeql-dashboard/         # React dashboard interface
│   └── src/
│       ├── components/        # Reusable visual components and theme toggles
│       ├── pages/             # Overview, Query Builder, Status, and Docs views
│       ├── hooks/             # Custom React hooks
│       └── lib/               # Utility functions and formatters
├── sdks/                     # Client SDKs
├── npm-wrapper/              # NPM global distribution package
└── pip-wrapper/              # Python PyPI distribution package
```

---

## Detailed Directory Breakdown

### 1. `forgeql-core/`
* **Path:** `d:\db\forgeql-core`
* **Purpose:** Core storage, zero-copy memory mapping, indexing, memory management, and crash durability engine.
* **Responsibilities:**
  - Manages zero-copy OS memory mapping (`MmapStorageManager.java`) and off-heap direct memory buffers.
  - Implements logarithmic ($O(\log N)$) B+ Tree primary key lookups and leaf splits.
  - Manages secondary B+ Tree indexes for non-primary key queries.
  - Enforces relational foreign key constraints (`RESTRICT` and `CASCADE`).
  - Computes exact Cosine Similarity for AI vector embeddings.
  - Enforces ACID durability via append-only `.wal` logging.

### 2. `forgeql-api/`
* **Path:** `d:\db\forgeql-api`
* **Purpose:** Network layer exposing the core engine via HTTP REST APIs and non-blocking TCP sockets.
* **Responsibilities:**
  - Operates a Round-Robin Multi-Reactor TCP socket server on port `8081` (`ForgeNativeSocketServer.java`).
  - Bootstraps embedded Tomcat server via Spring Boot on port `8080`.
  - Enforces Role-Based Access Control (RBAC) token security.
  - Serves statically embedded React dashboard assets.

### 3. `forgeql-dashboard/`
* **Path:** `d:\db\forgeql-dashboard`
* **Purpose:** Web administration dashboard.
* **Responsibilities:**
  - Provides a React Flow visual node query builder.
  - Real-time telemetry monitoring for server statistics and database activity.
  - Supports 10 DaisyUI themes and scrollable API documentation.

### 4. `docs/`
* **Path:** `d:\db\docs`
* **Purpose:** Consolidated documentation directory containing system guides, release logs, architecture maps, and query reference guides.
