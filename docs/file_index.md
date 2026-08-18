# ForgeQL - File Index and Component Catalog

This document catalogs all major source files across the **ForgeQL** codebase, outlining their core purpose, dependencies, usage, and system relationships.

---

## `forgeql-core` Engine Files

### 1. `ExecutionEngine.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/execution/ExecutionEngine.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/execution/ExecutionEngine.java)
* **Purpose:** Central execution orchestrator and query command router.
* **Responsibilities:**
  - Parses incoming JSON queries (`insert`, `update`, `delete`, `select`, `create_index`, `create_foreign_key`, `vector_search`).
  - Manages per-table B+ Trees, WAL files, HNSW vector indexes, secondary indexes, and foreign keys.
  - Replays WAL logs during automated crash recovery.
* **Dependencies:** `BTreeManager`, `SecondaryBTreeIndex`, `WriteAheadLog`, `HnswIndex`, `StorageManager`, `SchemaManager`.
* **Used By:** `QueryService.java`, `ForgeNativeSocketServer.java`.

### 2. `BTreeManager.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/index/BTreeManager.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/index/BTreeManager.java)
* **Purpose:** High-level interface managing primary B+ Tree operations over 8KB page blocks.
* **Responsibilities:**
  - Handles node insertion, leaf splitting, node conversion, binary search lookups, in-place updates, and slot-shifting deletions.
* **Dependencies:** `BufferPool`, `Page`.
* **Used By:** `ExecutionEngine.java`, `BTreeManagerTest.java`.

### 3. `SecondaryBTreeIndex.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/index/SecondaryBTreeIndex.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/index/SecondaryBTreeIndex.java)
* **Purpose:** Secondary attribute indexing engine.
* **Responsibilities:**
  - Maps non-primary key values (e.g. `email`, `role`) to primary record IDs (`id`).
  - Supports insert, remove, update, and logarithmic ($O(\log N)$) search operations.
* **Dependencies:** Standard Java concurrent collections (`ConcurrentHashMap`, `ConcurrentSkipListSet`).
* **Used By:** `ExecutionEngine.java`, `SecondaryIndexTest.java`.

### 4. `StorageManager.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/storage/StorageManager.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/storage/StorageManager.java)
* **Purpose:** File I/O layer using off-heap direct memory buffers.
* **Responsibilities:**
  - Reads and writes 8KB page blocks to `.db` disk files using Java NIO and direct memory.
* **Dependencies:** `java.nio.channels.FileChannel`, `Page`.
* **Used By:** `BufferPool.java`.

### 5. `BufferPool.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/storage/BufferPool.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/storage/BufferPool.java)
* **Purpose:** In-memory LRU cache manager for disk pages.
* **Responsibilities:**
  - Evicts least-recently-used pages to prevent memory exhaustion on large datasets.
* **Dependencies:** `StorageManager`, `Page`.
* **Used By:** `BTreeManager.java`, `ExecutionEngine.java`.

### 6. `WriteAheadLog.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/wal/WriteAheadLog.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/wal/WriteAheadLog.java)
* **Purpose:** Append-only log file manager for ACID crash durability.
* **Responsibilities:**
  - Appends mutation records (`UPDATE`, `DELETE`, `INSERT`) before disk flushes and reads logs during startup recovery.
* **Dependencies:** Java NIO file streams.
* **Used By:** `ExecutionEngine.java`.

### 7. `SchemaManager.java` & `ForeignKeyConstraint.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/schema/SchemaManager.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/schema/SchemaManager.java)
* **Purpose:** Relational foreign key constraint engine and `.schema` persistence manager.
* **Responsibilities:**
  - Enforces `RESTRICT` and `CASCADE` relational constraints during record mutations.
  - Persists table schema files across database restarts.
* **Dependencies:** `ForeignKeyConstraint.java`, Java Object Streams.
* **Used By:** `ExecutionEngine.java`, `ForeignKeyTest.java`.

### 8. `MmapStorageManager.java`
* **Path:** [`forgeql-core/src/main/java/com/forgeql/core/storage/MmapStorageManager.java`](file:///d:/db/forgeql-core/src/main/java/com/forgeql/core/storage/MmapStorageManager.java)
* **Purpose:** OS-level Zero-Copy memory-mapped storage engine.
* **Responsibilities:** Maps `.db` files directly into OS Virtual Memory Page Cache using `MappedByteBuffer`.
* **Dependencies:** Java NIO `FileChannel`, `MappedByteBuffer`.
* **Used By:** `BufferPool.java`, `ExecutionEngine.java`, `MmapStorageManagerTest.java`.

---

## `forgeql-api` Network Layer Files

### 9. `ForgeNativeSocketServer.java` & `RoundRobinWorkerGroup.java`
* **Path:** [`forgeql-api/src/main/java/com/forgeql/api/network/ForgeNativeSocketServer.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/network/ForgeNativeSocketServer.java)
* **Purpose:** Non-blocking TCP socket server on port `8081` with Round-Robin worker load balancing.
* **Responsibilities:** Bypasses HTTP REST servlet overhead for low latency queries across CPU worker event loops.
* **Dependencies:** `ServerSocketChannel`, `Selector`, `ExecutionEngine`.
* **Used By:** `ForgeDbConfig.java`, `NativeSocketServerTest.java`.

### 10. `JwtTokenProvider.java` & `AuthController.java`
* **Path:** [`forgeql-api/src/main/java/com/forgeql/api/security/JwtTokenProvider.java`](file:///d:/db/forgeql-api/src/main/java/com/forgeql/api/security/JwtTokenProvider.java)
* **Purpose:** Zero-dependency HMAC-SHA256 JWT provider and authentication REST controller (`POST /api/auth/login`).
* **Responsibilities:** Generates signed JWT bearer tokens, validates claims, and manages user login authentication.
* **Dependencies:** Standard Java Cryptography (`javax.crypto.Mac`), Base64URL, Jackson `ObjectMapper`.
* **Used By:** `QueryController.java`, `AuthController.java`, `JwtAuthTest.java`.

---

## `forgeql-dashboard` UI Files

### 10. `App.tsx`
* **Path:** `forgeql-dashboard/src/App.tsx`
* **Purpose:** Main React application entry point and layout shell.

---

## Documentation Suite

### 11. `query_guide.md`
* **Path:** [`docs/query_guide.md`](file:///d:/db/docs/query_guide.md)
* **Purpose:** Developer reference manual for simple and complex query patterns.

### 12. `forgeql_architecture_pitch.md`
* **Path:** [`docs/forgeql_architecture_pitch.md`](file:///d:/db/docs/forgeql_architecture_pitch.md)
* **Purpose:** Technical comparison and feature breakdown vs MySQL, PostgreSQL, and MongoDB.
