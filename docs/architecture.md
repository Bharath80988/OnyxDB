# OnyxDB Architecture & Codebase Overview

This document outlines the architecture, folder structure, files, and core logic of OnyxDB, serving as a developer reference for the internal workings of the database engine, API layer, and dashboard UI.

---

## 1. `onyxdb-core` (The Database Engine)
This module acts as the heart of the database. It manages disk I/O, caching, structured B+ Tree indexing, vector storage, and crash recovery.

### `com.onyxdb.core.execution`
- **`ExecutionEngine.java`**: 
  - **Logic**: Parses structured JSON queries (e.g., `{"action": "insert", "table": "users"}`) and coordinates execution across `BTreeManager`, `WriteAheadLog`, `HnswIndex`, and `SecondaryBTreeIndex` per table.

### `com.onyxdb.core.index`
- **`BTreeManager.java`**: Primary key B+ Tree indexing interface.
- **`SecondaryBTreeIndex.java`**: Secondary attribute indexing engine.
- **`HnswIndex.java`**: Exact K-Nearest Neighbors (KNN) vector search.

### `com.onyxdb.core.storage`
- **`StorageManager.java`**: Unbuffered 8KB disk page random access.
- **`BufferPool.java`**: In-memory LRU cache manager.

### `com.onyxdb.core.wal`
- **`WriteAheadLog.java`**: Append-only durability logger.

---

## 2. `onyxdb-api` (The Network/REST Layer)
- **`OnyxDbApplication.java`**: Spring Boot entry point.
- **`QueryController.java`**: REST Endpoint (`/api/query`) implementing Role-Based Access Control (RBAC).
- **`QueryService.java`**: Spring `@Service` transaction boundary with caching.

---

## 3. `onyxdb-dashboard` (The Frontend UI)
A React + TypeScript + Vite frontend offering observability, a Visual Query Builder, telemetry metrics, and 10 dynamic themes.
