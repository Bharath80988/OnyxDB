# Changelog

All notable changes to **ForgeQL** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-08-12 — Initial Open-Source Public Release

### 🚀 Highlights
* **mmap Virtual Memory Storage**: Zero-copy off-heap memory mapping via `FileChannel.map` (`MappedByteBuffer`).
* **8KB Slotted Page B+ Tree Indexing**: Logarithmic $O(\log N)$ primary key lookups, inserts, leaf splits, and deletes.
* **Native HNSW Vector Search**: Hierarchical Navigable Small World proximity graph computing exact Cosine Distance for AI vector embeddings.
* **Hybrid Relational + Vector Queries**: Combine relational filter predicates with KNN vector similarity searches.
* **ACID Write-Ahead Logging (`WAL`)**: Append-only transaction logging with CRC32 checksum verification for instant crash recovery replay.
* **Forge Wire Protocol (OWP)**: Non-blocking binary TCP socket protocol on port 8081 with a 9-byte header framing structure (`0x4F4E5958`).
* **Embedded REST API & JWT Security**: Spring Boot endpoints on port 8080 with HMAC-SHA256 JWT RBAC guards (`ADMIN` & `READ_ONLY`).
* **Forge Studio Web IDE (`/studio`)**: Visual Drag-and-Drop Node Builder, JSON Console, Table Creator, and Telemetry.
* **Interactive REPL CLI & SDKs**: `pip install forgeql`, `npx forgeql`, Maven `com.forgeql:forgeql-core`.
## [Unreleased]
### Changed
- Rebranded from OnyxDB to ForgeQL due to an existing name conflict.
- Updated tagline to ""Data, Forged Better"".
- Renamed all root folders, packages, and updated frontend/backend accordingly.

