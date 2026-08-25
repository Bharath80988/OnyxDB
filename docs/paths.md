# ForgeQL - Developer Path Reference Guide

This document defines the purpose, contents, and usage of every major path in the **ForgeQL** codebase to help new developers navigate and onboard seamlessly.

---

## 📂 Active Core & API Directories

### 1. `forgeql-core/src/main/java/com/forgeql/core/index/`
* **Purpose:** Core indexing structures.
* **Contains:**
  - [`BTreeManager.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/index/BTreeManager.java): Primary key B+ Tree implementation.
  - [`SecondaryBTreeIndex.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/index/SecondaryBTreeIndex.java): Secondary attribute indexing.
  - `hnsw/HnswIndex.java`: AI embedding KNN vector search engine.
* **Used By:** `ExecutionEngine.java`.

### 2. `forgeql-core/src/main/java/com/forgeql/core/storage/`
* **Purpose:** Disk persistence and page memory cache.
* **Contains:**
  - `StorageManager.java`: Low-level RandomAccess disk file I/O.
  - `BufferPool.java`: LRU page memory cache.
  - `Page.java`: 8KB slotted page byte structure.
* **Used By:** `BTreeManager.java`.

### 3. `forgeql-core/src/main/java/com/forgeql/core/execution/`
* **Purpose:** Query processing engine.
* **Contains:**
  - [`ExecutionEngine.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/execution/ExecutionEngine.java): Translates JSON query nodes into database operations across multi-table storage files.
* **Used By:** `QueryService.java`.

### 4. `forgeql-api/src/main/java/com/forgeql/api/`
* **Purpose:** Spring Boot REST server & RBAC security.
* **Contains:**
  - `ForgeDbApplication.java`: Main application bootstrapper.
  - [`QueryController.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/QueryController.java): REST endpoints & RBAC header guards.
  - `QueryService.java`: Service layer and Spring cache boundary.
* **Used By:** HTTP clients, Web dashboard.

---

## 🎨 Active Frontend Dashboard Directories

### 5. `forgeql-dashboard/src/components/`
* **Purpose:** Reusable UI components.
* **Contains:** `Sidebar.tsx`, `Header.tsx`, `ThemeToggle.tsx`, `MetricCard.tsx`, `QueryEditor.tsx`, `QueryResults.tsx`.

### 6. `forgeql-dashboard/src/pages/`
* **Purpose:** Main views.
* **Contains:** Overview metrics, Visual Query Builder, System Status dashboard, API documentation.

---

## 📜 Documentation & Version Archiving Directories (`docs/`)

### 7. `docs/logs/`
* **Purpose:** Release log directory detailing feature releases from v0.1.0 to v2.4.0.

### 8. `docs/versions/`
* **Purpose:** Archival directory for legacy prototype iterations, keeping production clean.
  - [`docs/versions/v1_prototype/`](./versions/v1_prototype/): Archived prototype files and daily development logs.
