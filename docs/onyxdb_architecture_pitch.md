# OnyxDB — Product Architecture and Technical Feature Comparison

This document provides a clear technical comparison explaining how **OnyxDB** compares against traditional database systems (MySQL, PostgreSQL, and MongoDB). It highlights key operating system, networking, and algorithmic design choices.

---

## 1. OnyxDB vs. Traditional Databases (MySQL, PostgreSQL, MongoDB)

| Feature / System Domain | MySQL (InnoDB) | PostgreSQL | MongoDB | **OnyxDB (v3.0.0)** |
| :--- | :--- | :--- | :--- | :--- |
| **Database Type** | Relational Database | Relational Database | Document Store | **Hybrid B+ Tree and AI Vector Engine** |
| **Deployment Model** | External Server | System Service | External Daemon Process | **Embedded Library or Standalone JAR** |
| **Query Protocol** | SQL String Commands | SQL String Commands | MQL JSON Queries | **Structured JSON over HTTP and TCP** |
| **Native AI Vector Search** | Requires external plugins | Requires pgvector extension | Requires Atlas Search | **Native HNSW Vector Search Built-In** |
| **Secondary Indexes** | B+ Tree | B-Tree / BRIN / GIST | B-Tree | **Secondary B+ Trees with Auto-Sync** |
| **Relational Integrity** | Foreign Key Constraints | Foreign Key Constraints | Manual Application Logic | **Foreign Keys (RESTRICT and CASCADE)** |
| **OS Memory Model** | Buffer Pool System Calls | Shared Buffers / OS Cache | WiredTiger Engine Cache | **Zero-Copy Operating System Memory Mapping (`mmap`)** |
| **Network Architecture** | Custom Binary Protocol | Wire Protocol | Wire Protocol | **Round-Robin Multi-Reactor TCP Server** |
| **Visual Dashboard** | Third-Party Workbench | Third-Party pgAdmin | MongoDB Compass | **Built-In Real-Time Dashboard** |

---

## 2. Core Differences in OnyxDB

### A. Combined Relational and AI Vector Engine
Traditional setups require running separate relational databases for structured data and specialized vector databases for AI embeddings. 
- **OnyxDB combines both into a single engine**: Leaf nodes in OnyxDB can store both structured JSON data and high-dimensional floating-point vectors. This enables developers to run exact vector similarity searches and relational foreign key queries in the same database.

### B. Embedded Operation Without Setup
- OnyxDB requires no user setup scripts, configuration files, or Docker setups.
- It runs inside your Java application or as a standalone process (`npx onyxdb` or `pip install onyxdb`), automatically creating database files (`<table_name>.db`) on demand.

---

## 3. Operating System Level Optimizations

### A. Zero-Copy Memory Mapping (`MmapStorageManager`)
- Standard database systems execute frequent file read and write system calls, causing context switches between user space and kernel space.
- **OnyxDB uses memory-mapped files (`FileChannel.map`)**: Database files (`.db`) are mapped directly into the Operating System Virtual Memory Page Cache.
- **Benefit**: Page lookups happen directly through off-heap memory pointers. The operating system kernel manages background page writes to storage asynchronously without blocking application threads.

### B. Off-Heap Direct Memory Buffers
- OnyxDB uses off-heap direct memory buffers (`ByteBuffer.allocateDirect`) to bypass the Java Garbage Collector, eliminating garbage collection pauses during heavy database traffic.

---

## 4. Networking Optimizations

### A. Round-Robin Multi-Reactor Event Loop Architecture
- OnyxDB uses a multi-reactor event loop pattern:
  - **Acceptor Thread**: A central acceptor thread listens for incoming client TCP socket connections on port `8081`.
  - **Round-Robin Worker Pool**: Incoming socket connections are assigned across CPU worker threads using a Round-Robin algorithm.
- **Benefit**: Avoids thread lock contention and ensures efficient multi-core CPU usage for low latency queries.

### B. Dual-Channel Protocol Support
- Provides standard **HTTP REST** (`/api/query` on port `8080`) for web clients and **Native TCP Sockets** (port `8081`) for backend services.

---

## 5. Algorithmic Optimizations

1. **Leaf Slot Binary Search ($O(\log N)$)**:
   - Records in 8KB slotted B+ Tree pages are searched using binary search over 256-byte slots, replacing slow linear scans with logarithmic lookups.
2. **HNSW Vector Similarity Search**:
   - Computes Cosine Similarity metrics in native Java to return the top nearest neighbor embeddings.
3. **Automatic Secondary Index Updates**:
   - Secondary indexes automatically stay synchronized during record inserts, updates, and deletes.
4. **Foreign Key Rule Enforcement**:
   - Enforces `RESTRICT` and `CASCADE` rules during record mutations to maintain relational data integrity across tables.
