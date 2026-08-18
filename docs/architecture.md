# ForgeQL Architecture and System Overview

This document outlines the architecture, module layout, source components, and execution flow of ForgeQL.

---

## 1. `forgeql-core` (The Storage and Search Engine)
This module acts as the core database engine. It manages disk page I/O, OS memory mapping, caching, structured B+ Tree indexing, relational foreign keys, vector storage, and crash recovery.

### `com.forgeql.core.execution`
- **`ExecutionEngine.java`**: Parses incoming JSON query payloads (e.g. `{"action": "insert", "table": "users"}`) and coordinates operations across B+ Trees, WAL files, HNSW vector indexes, secondary indexes, and foreign key rules.

### `com.forgeql.core.index`
- **`BTreeManager.java`**: Primary key B+ Tree indexing engine over 8KB slotted page blocks.
- **`SecondaryBTreeIndex.java`**: Secondary attribute indexing engine for non-primary key attributes.
- **`HnswIndex.java`**: K-Nearest Neighbors (KNN) vector search engine using Cosine Similarity.

### `com.forgeql.core.schema`
- **`SchemaManager.java` & `ForeignKeyConstraint.java`**: Foreign key constraint engine enforcing `RESTRICT` and `CASCADE` relational rules with persistent `.schema` files.

### `com.forgeql.core.storage`
- **`MmapStorageManager.java`**: OS-level zero-copy memory-mapped storage manager (`MappedByteBuffer`).
- **`StorageManager.java`**: Random-access file I/O layer using off-heap direct memory buffers.
- **`BufferPool.java`**: In-memory LRU page cache manager.

### `com.forgeql.core.wal`
- **`WriteAheadLog.java`**: Append-only log file manager for crash durability and automatic startup recovery.

---

## 2. `forgeql-api` (The Network and API Layer)
- **`ForgeDbApplication.java`**: Spring Boot application entry point.
- **`ForgeNativeSocketServer.java` & `RoundRobinWorkerGroup.java`**: Non-blocking TCP socket server on port `8081` with Round-Robin worker thread load balancing.
- **`QueryController.java`**: HTTP REST API endpoint (`/api/query`) implementing Role-Based Access Control (RBAC).
- **`QueryService.java`**: Spring Service wrapping `ExecutionEngine` execution.

---

## 3. `forgeql-dashboard` (The Frontend Dashboard)
A React dashboard built with TypeScript and Vite that provides system telemetry metrics, visual node-based query construction, and dynamic theme switching.
