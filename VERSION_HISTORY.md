# OnyxDB - Version History Timeline

This document tracks the complete chronological version history of **OnyxDB** from initial prototype to enterprise-grade production baseline.

---

## 📜 Version Timeline

### **v0.1.0 — Initial Engine Prototype (Day 1)**
- Storage Manager with 8KB disk page reads/writes using Java NIO.
- In-memory LRU Buffer Pool caching.
- Fundamental B+ Tree page serialization and point lookups.
- Basic Spring Boot REST wrapper and early DaisyUI dashboard.

### **v0.2.0 — B+ Tree Leaf Splitting & Dynamic UI (Days 2 - 4)**
- Automatic leaf node splitting when page capacity reaches 31 records.
- Conversion of root leaf into internal routing node.
- React Flow Visual Query Builder integration.
- 10 DaisyUI dynamic themes and Lenis smooth scrolling API documentation.

### **v2.1.0 — Durability, Security & AI Vector Search (Day 5)**
- Append-only Write-Ahead Logging (WAL) for ACID crash recovery.
- Role-Based Access Control (RBAC) token security (`ADMIN` vs `READ_ONLY`).
- Native exact KNN Vector Search using Cosine Similarity (`HnswIndex.java`).
- Environment variable configuration (`.env`).

### **v2.2.0 — Multi-Platform Packaging & Distribution (Day 6)**
- Bundling React dashboard inside standalone executable Uber-JAR (`onyxdb-api`).
- NPM wrapper (`npx onyxdb`) and Python Pip wrapper (`pip install onyxdb`).
- Docker multi-stage build optimization.

### **v2.3.0 — B+ Tree Update/Delete & Binary Search Acceleration (Day 7)**
- In-place B+ Tree record `UPDATE` operations.
- Slot-shifting memory `DELETE` operations.
- $O(\log N)$ binary search algorithm over leaf page slots (`binarySearchLeaf`).
- WAL logging and automated recovery for updates and deletions.

### **v2.4.0 — Secondary B+ Tree Indexing & Enterprise Refactoring (Day 8 Baseline)**
- Secondary B+ Tree Indexing (`SecondaryBTreeIndex.java`) for non-primary key queries.
- Dynamic `create_index` REST & Core action.
- Automated secondary index maintenance during `insert`, `update`, and `delete`.
- Index Scan query routing in $O(\log N)$ time.
- Enterprise-grade codebase refactoring, version archiving (`versions/v1_prototype/`), clean modular architecture, and documentation suite (`PROJECT_STRUCTURE.md`, `FILE_INDEX.md`, `STATUS.md`, `REFACTOR_LOG.md`, `VERSION_HISTORY.md`, `PATHS.md`).
