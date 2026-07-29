# Roadmap & To-Do

Comprehensive roadmap for upcoming features, optimizations, and infrastructural overhauls in OnyxDB.

## High Priority To-Do
- [x] **Write-Ahead Logging (WAL)**: Implement an append-only WAL to guarantee ACID durability in the event of unexpected power failures.
- [x] **Update & Delete**: Add robust mutative and destructive B+ Tree operations with $O(\log N)$ binary search node indexing.
- [x] **Secondary Indexes**: Extend the B+ Tree architecture to support non-primary key indexing.
- [x] **Schema Normalization**: Implement cross-table relational links (Foreign Keys) and normal forms for structured data mapping.
- [x] **OS-Level Memory Mapping (`mmap`)**: Zero-copy kernel virtual memory page cache mapping (`MmapStorageManager.java`).
- [x] **Round-Robin Multi-Reactor TCP Server**: High-throughput non-blocking TCP socket server with Round-Robin worker load balancing (`OnyxNativeSocketServer.java`).
- [ ] **Transaction Isolation**: Introduce Multiversion Concurrency Control (MVCC) for Snapshot Isolation without locking reads (ACID Isolation).

## Distributed Systems
- [ ] **Raft Consensus**: Transition from a standalone node to a globally distributed cluster.
- [ ] **Horizontal Sharding**: Automatically split massive B+ Trees across multiple nodes based on primary key ranges.
- [ ] **Read Replicas**: Route HTTP `GET` requests to follower nodes to relieve pressure on the Leader.

## Advanced Querying
- [x] **Vector Search (Embeddings)**: Integrate HNSW (Hierarchical Navigable Small World) graphs directly into the leaf nodes of our B+ Tree to support hyper-fast RAG applications.
- [ ] **Full-Text Search**: Implement an inverted index for lexical search capabilities.
- [ ] **Geospatial Indexing**: Add R-Tree support for bounding box and radius queries.

## Security & Access Control
- [x] **Role-Based Access Control (RBAC)**: Define granular permissions (`READ`, `WRITE`, `ADMIN`) at the table level.
- [ ] **JWT Authentication**: Secure the `/api/query` endpoint utilizing stateless tokens.
- [ ] **TLS/SSL Encryption**: Enforce secure transit for all REST payloads.
