# Implemented Functionalities

Below is a comprehensive list of all implemented functionalities in OnyxDB that are currently live and production-ready.

## Core Storage Engine
- **Write-Ahead Logging (WAL)**: Robust crash recovery via `.wal` append-only logs, guaranteeing ACID durability.
- **B+ Tree Indexing**: The foundational data structure ensuring O(log n) lookups, inserts, updates, and deletes.
- **Disk-Backed Paging**: Data is persisted to disk in 8KB pages to maximize OS-level cache hits.
- **Buffer Pool Manager (LRU)**: Intelligent in-memory cache that evicts least-recently-used pages to prevent OOM errors.
- **Slotted Pages**: Dynamic record sizing within a single page, preventing internal fragmentation.
- **Secondary B+ Tree Indexing**: $O(\log N)$ non-primary key lookups across dynamic JSON record attributes with automated mutation synchronization.
- **Schema Normalization & Foreign Keys**: Cross-table relational enforcement (`RESTRICT` / `CASCADE`) with persistent `.schema` disk files (`SchemaManager.java`).

## Vector Search (AI)
- **HNSW Vector Storage**: Native AI embedding storage designed as a foundation for Navigable Small World graphs.
- **Exact KNN Search**: Cosine Similarity distance calculations executed in native Java to return Top-K nearest neighbors instantly.

## API & Networking
- **Role-Based Access Control (RBAC)**: Secure endpoints differentiating `ADMIN` (read/write/update/delete/index) and `READ_ONLY` roles.
- **Native JSON over HTTP**: Native REST protocol over HTTP.
- **Spring Boot Embedded Tomcat**: Concurrent HTTP handling for multi-threaded queries.
- **Multi-Table Dynamic Routing**: The engine intercepts the `"table"` field in JSON payloads and dynamically routes queries to `<table_name>.db`.

## Operations
- **Insert / Upsert**: Automatically handles duplicate keys by overwriting existing records.
- **Update**: In-place payload modification in B+ Tree leaf pages with $O(\log N)$ binary search lookup.
- **Delete**: Record removal with memory slot shifting (`System.arraycopy`) and $O(\log N)$ binary search lookup.
- **Binary Search Acceleration**: $O(\log N)$ point lookups across B+ Tree leaf nodes.
- **Select by ID**: $O(\log N)$ lookups using primary keys.
- **Create Index**: Dynamic creation of secondary indices on non-primary key fields.
- **Select by Secondary Index**: Index scan routing via secondary B+ trees.
- **Vector Search**: Computes distance metrics on high-dimensional arrays.
- **Full Table Scans**: Sequential iteration over leaf nodes for unindexed queries.

## Frontend Dashboard
- **React + Vite Architecture**: Production dashboard with hot reloading.
- **10 Dynamic Themes**: Implemented via DaisyUI and Tailwind CSS.
- **Visual Query Builder**: React Flow node-based interface for drag-and-drop pipeline construction.
