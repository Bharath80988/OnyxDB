# Roadmap and To-Do List

Comprehensive roadmap for upcoming features, optimizations, and infrastructure work in OnyxDB.

## Core Storage and Operations
- [x] **Write-Ahead Logging (WAL)**: Append-only durability logs to guarantee crash recovery.
- [x] **Update and Delete**: In-place modifications and memory slot-shifting deletions in B+ Trees using logarithmic ($O(\log N)$) binary search.
- [x] **Secondary Indexes**: B+ Tree indexing for non-primary key fields.
- [x] **Schema Normalization**: Cross-table relational links (Foreign Keys) with `RESTRICT` and `CASCADE` deletion rules.
- [x] **OS-Level Memory Mapping (`mmap`)**: Zero-copy Operating System virtual memory page mapping (`MmapStorageManager.java`).
- [x] **Round-Robin Multi-Reactor TCP Server**: High-throughput non-blocking TCP socket server with Round-Robin worker load balancing (`OnyxNativeSocketServer.java`).
- [ ] **Transaction Isolation**: Multiversion Concurrency Control (MVCC) for Snapshot Isolation without read locks.

## Distributed Systems
- [ ] **Raft Consensus**: Transition from a single node to a distributed cluster.
- [ ] **Horizontal Sharding**: Automatically split large B+ Trees across multiple nodes based on primary key ranges.
- [ ] **Read Replicas**: Route read-only queries to follower nodes to balance cluster load.

## Advanced Search
- [x] **Vector Search (Embeddings)**: HNSW graphs integrated into B+ Tree leaf nodes for fast AI vector search.
- [ ] **Full-Text Search**: Inverted index engine for lexical keyword searching.
- [ ] **Geospatial Indexing**: R-Tree support for bounding box and radius queries.

## Security and Access Control
- [x] **Role-Based Access Control (RBAC)**: Fine-grained permissions (`READ` vs `ADMIN`) for endpoints.
- [ ] **JWT Authentication**: Signed JWT tokens replacing raw secret headers.
- [ ] **TLS/SSL Encryption**: Secure payload encryption in transit.
