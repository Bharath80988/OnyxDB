# OnyxDB Architecture & Codebase Overview

This document outlines the architecture, folder structure, files, and core logic of OnyxDB, serving as a developer reference for the internal workings of the database engine, API layer, and dashboard UI.

---

## 1. `onyxdb-core` (The Database Engine)
This module acts as the heart of the database. It manages disk I/O, caching, structured B+ Tree indexing, vector storage, and crash recovery.

### `com.onyxdb.core.execution`
- **`ExecutionEngine.java`**: 
  - **Logic**: Parses structured JSON queries (e.g., `{"action": "insert", "table": "users"}`) and coordinates the execution. It maintains instances of `BTreeManager`, `WriteAheadLog`, and `HnswIndex` per table.
  - **Functions**:
    - `execute(query)`: Master router for incoming queries.
    - `executeInsert(...)`: Persists new records to WAL, inserts into B+ Tree, and populates vector index (if applicable).
    - `executeSelect(...)`: Handles point lookups (ID-based) and full-table scans.
    - `executeVectorSearch(...)`: Translates vector arrays into `float[]` and queries the HNSW/KNN index.

### `com.onyxdb.core.index`
- **`BTreeManager.java`**:
  - **Logic**: A high-level interface over the low-level B+ Tree page management. Handles inserting records and searching.
  - **Functions**: `insert(id, value)`, `search(id)`, `scanAll()`.
- **`BTreePage.java`**:
  - **Logic**: Manages byte-level serialization of B+ Tree nodes onto 4KB disk pages.
  - **Functions**: `readFromBytes(byte[])`, `writeToBytes()`.
- **`BTreeNode.java`**:
  - **Logic**: Represents an in-memory B+ Tree Node (Internal or Leaf). Handles splitting and binary-search logic for keys.
  - **Functions**: `insert(id, value)`, `split()`.

### `com.onyxdb.core.index.hnsw` (Vector Search)
- **`HnswIndex.java`**:
  - **Logic**: Foundation for Hierarchical Navigable Small World graphs. Currently implements Exact K-Nearest Neighbors (KNN) search as the base layer, storing AI embeddings in memory.
  - **Functions**: `insert(id, vector)`, `search(queryVector, k)` (uses a priority queue to rank nearest matches).
- **`VectorMath.java`**:
  - **Logic**: Mathematical utilities for vectors.
  - **Functions**: `cosineSimilarity(vecA, vecB)`: Computes spatial angle/similarity between vectors.

### `com.onyxdb.core.storage`
- **`StorageManager.java`**:
  - **Logic**: Handles unbuffered, low-level disk Random Access. Reads and writes exact 4KB blocks to `.db` files.
  - **Functions**: `readPage(pageId)`, `writePage(pageId, data)`, `allocatePage()`.
- **`BufferPool.java`**:
  - **Logic**: In-memory cache layer. Avoids hitting the disk on every query by caching active pages. Uses LRU (Least Recently Used) eviction policy.
  - **Functions**: `getPage(pageId)`, `flush()`.

### `com.onyxdb.core.wal`
- **`WriteAheadLog.java`**:
  - **Logic**: Append-only log file (`.wal`). Guarantees ACID durability by writing changes to disk *before* they are applied to the B+ Tree. Allows recovery after an unexpected crash.
  - **Functions**: `append(byte[])`, `readAllLogs()`.

---

## 2. `onyxdb-api` (The Network/REST Layer)
This module exposes the OnyxDB core engine to the outside world over HTTP REST protocols using Spring Boot.

### `com.onyxdb.api`
- **`OnyxDbApplication.java`**:
  - **Logic**: Spring Boot entry point. Bootstraps the embedded Tomcat server.
  - **Functions**: `main(args)`.
- **`QueryController.java`**:
  - **Logic**: The API Endpoint (`/api/query`). It accepts JSON POST requests from clients. It also implements **Role-Based Access Control (RBAC)** checking the `Authorization` header for `ADMIN` vs `READ_ONLY` privileges.
  - **Functions**: `executeQuery(authHeader, query)`: Validates tokens, blocks Unauthorized/Forbidden requests, and passes valid queries to the service layer.
- **`QueryService.java`**:
  - **Logic**: A Spring `@Service` that wraps `ExecutionEngine` logic, catching exceptions and acting as a transaction boundary.

---

## 3. `dashboard` (The Frontend UI)
A React + TypeScript + Vite frontend that provides a modern, dark-themed administrative dashboard to monitor and query OnyxDB.

### Core Configuration
- **`package.json`**: Dependencies (React, Lucide icons, TailwindCSS).
- **`tailwind.config.js`**: Defines the custom "Onyx" color palette (purples, dark themes).
- **`vite.config.ts`**: Bundler settings.

### `/src` (React Application)
- **`main.tsx`**: React DOM mount point.
- **`App.tsx`**: Main application layout. Assembles Sidebar, Header, Metrics, and Query Editor.
- **`index.css`**: Global vanilla CSS resets, font imports (Inter), and Tailwind directives.

### `/src/components` (UI Modules)
- **`Sidebar.tsx`**: Left-side navigation menu containing links (Overview, Tables, Settings) and brand logos.
- **`Header.tsx`**: Top navigation bar containing the dark/light mode toggle.
- **`ThemeToggle.tsx`**: Switcher button that applies `dark` class to the HTML document.
- **`MetricCard.tsx`**: Reusable component to display metrics (e.g., Uptime, Queries/sec, Memory).
- **`QueryEditor.tsx`**: Provides a JSON text area for users to type OnyxDB structured queries (Insert/Select/VectorSearch).
- **`QueryResults.tsx`**: Takes API response data and renders it as formatted JSON or a data table.

### `/src/hooks` (Logic)
- **`useQuery.ts`**: Custom React Hook that manages `fetch` requests to `http://localhost:8080/api/query`. Handles loading states, errors, and passing the `Authorization` token header.
