# Roadmap & To-Do

The journey for OnyxDB is just beginning. Below is our exhaustive roadmap for upcoming features, optimizations, and infrastructural overhauls. 

## High Priority To-Do
- [x] **Write-Ahead Logging (WAL)**: Implement an append-only WAL to guarantee ACID durability in the event of unexpected power failures.
- [ ] **Update & Delete**: Add robust mutative and destructive B+ Tree operations.
- [ ] **Schema Normalization**: Implement cross-table relational links (Foreign Keys) and normal forms (1NF, 2NF, 3NF) for structured data mapping.
- [ ] **Secondary Indexes**: Extend the B+ Tree architecture to support non-primary key indexing.
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

## Ecosystem
- [ ] **GraphQL Layer**: Introduce an auto-generated GraphQL schema mapping to the JSON structures within the B+ Tree.
- [ ] **Official SDKs**: While native HTTP works perfectly, we will build official SDKs for Rust, Python, Go, and Java to provide strongly-typed ORM experiences.
- [ ] **CLI Tool**: Develop a native terminal binary (written in Rust or Go) to interact with OnyxDB without needing a browser.
