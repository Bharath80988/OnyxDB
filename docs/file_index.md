# OnyxDB - File Index & Component Catalog

This document catalogs all major source files across the **OnyxDB** codebase, outlining their core purpose, dependencies, usage, and system relationships.

---

## 📦 `onyxdb-core` Engine Files

### 1. `ExecutionEngine.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/execution/ExecutionEngine.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/execution/ExecutionEngine.java)
* **Purpose:** Central execution orchestrator and query command router.
* **Responsibilities:**
  - Parses incoming JSON queries (`insert`, `update`, `delete`, `select`, `create_index`, `vector_search`).
  - Manages per-table B+ Trees, WAL files, HNSW vector indexes, and secondary indexes.
  - Replays WAL logs during automated crash recovery.
* **Dependencies:** `BTreeManager`, `SecondaryBTreeIndex`, `WriteAheadLog`, `HnswIndex`, `StorageManager`, `BufferPool`.
* **Used By:** `QueryService.java`.

### 2. `BTreeManager.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/index/BTreeManager.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/index/BTreeManager.java)
* **Purpose:** High-level interface managing primary B+ Tree operations over 8KB page blocks.
* **Responsibilities:**
  - Handles node insertion, leaf splitting, node conversion, binary search lookups, in-place updates, and slot-shifting deletions.
* **Dependencies:** `BufferPool`, `Page`.
* **Used By:** `ExecutionEngine.java`, `BTreeManagerTest.java`.

### 3. `SecondaryBTreeIndex.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/index/SecondaryBTreeIndex.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/index/SecondaryBTreeIndex.java)
* **Purpose:** Secondary attribute indexing engine.
* **Responsibilities:**
  - Maps non-primary key string values (e.g., `email`, `role`) to primary record IDs (`id`).
  - Supports insert, remove, update, and fast $O(\log N)$ search operations.
* **Dependencies:** Standard Java concurrent collections (`ConcurrentHashMap`, `ConcurrentSkipListSet`).
* **Used By:** `ExecutionEngine.java`, `SecondaryIndexTest.java`.

### 4. `StorageManager.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/storage/StorageManager.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/storage/StorageManager.java)
* **Purpose:** Low-level unbuffered RandomAccess file I/O layer.
* **Responsibilities:**
  - Reads and writes raw 8KB blocks to `.db` physical disk files using Java NIO.
* **Dependencies:** `java.nio.channels.FileChannel`, `Page`.
* **Used By:** `BufferPool.java`.

### 5. `BufferPool.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/storage/BufferPool.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/storage/BufferPool.java)
* **Purpose:** In-memory LRU cache manager for disk pages.
* **Responsibilities:**
  - Evicts least-recently-used pages to prevent RAM exhaustion on large datasets.
* **Dependencies:** `StorageManager`, `Page`.
* **Used By:** `BTreeManager.java`, `ExecutionEngine.java`.

### 6. `WriteAheadLog.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/wal/WriteAheadLog.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/wal/WriteAheadLog.java)
* **Purpose:** Append-only log file manager for ACID crash durability.
* **Responsibilities:**
  - Appends mutation records (`UPDATE`, `DELETE`, `INSERT`) before disk flushes and reads logs during startup recovery.
* **Dependencies:** Java NIO file streams.
* **Used By:** `ExecutionEngine.java`.

### 7. `SchemaManager.java` & `ForeignKeyConstraint.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/schema/SchemaManager.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/schema/SchemaManager.java)
* **Purpose:** Relational foreign key constraint engine and `.schema` persistence manager.
* **Responsibilities:**
  - Enforces `RESTRICT` and `CASCADE` relational constraints during record mutations.
  - Persists table schema files across database restarts.
* **Dependencies:** `ForeignKeyConstraint.java`, Java Object Streams.
* **Used By:** `ExecutionEngine.java`, `ForeignKeyTest.java`.

### 8. `MmapStorageManager.java`
* **Path:** [`onyxdb-core/src/main/java/com/onyxdb/core/storage/MmapStorageManager.java`](file:///d:/db/onyxdb-core/src/main/java/com/onyxdb/core/storage/MmapStorageManager.java)
* **Purpose:** OS-level Zero-Copy memory-mapped storage engine.
* **Responsibilities:** Maps `.db` files directly into OS Virtual Memory Page Cache using `MappedByteBuffer`.
* **Dependencies:** Java NIO `FileChannel`, `MappedByteBuffer`.
* **Used By:** `BufferPool.java`, `ExecutionEngine.java`, `MmapStorageManagerTest.java`.

---

## 🌐 `onyxdb-api` Network Layer Files

### 9. `OnyxNativeSocketServer.java` & `RoundRobinWorkerGroup.java`
* **Path:** [`onyxdb-api/src/main/java/com/onyxdb/api/network/OnyxNativeSocketServer.java`](file:///d:/db/onyxdb-api/src/main/java/com/onyxdb/api/network/OnyxNativeSocketServer.java)
* **Purpose:** High-performance non-blocking NIO TCP socket server on port `8081` with Round-Robin worker thread load balancing.
* **Responsibilities:** Bypasses HTTP REST servlet overhead for microsecond query latencies across CPU worker event loops.
* **Dependencies:** `ServerSocketChannel`, `Selector`, `ExecutionEngine`.
* **Used By:** `OnyxDbConfig.java`, `NativeSocketServerTest.java`.

---

## 🎨 `onyxdb-dashboard` UI Files

### 10. `App.tsx`
* **Path:** `onyxdb-dashboard/src/App.tsx`
* **Purpose:** Main React application entry point and layout shell.

---

## 📖 Documentation Suite

### 11. `query_guide.md`
* **Path:** [`docs/query_guide.md`](file:///d:/db/docs/query_guide.md)
* **Purpose:** Authoritative developer reference manual for all simple and complex query patterns.

### 12. `onyxdb_architecture_pitch.md`
* **Path:** [`docs/onyxdb_architecture_pitch.md`](file:///d:/db/docs/onyxdb_architecture_pitch.md)
* **Purpose:** Technical competitive breakdown and pitch matrix vs MySQL, PostgreSQL, and MongoDB.
