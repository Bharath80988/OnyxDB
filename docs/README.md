# ForgeQL Documentation Index

Welcome to the centralized documentation hub for **ForgeQL** — a high-performance Java database engine for AI vector search and relational workloads.

---

## 📚 Documentation Index

### 🏛 Architecture & Product Overview
- [**Root README**](../README.md): Project overview, features, 30-second quickstart, and HTTP/OWP interface guides.
- [**Architecture Guide**](architecture.md): Core storage engine architecture, B+ Trees, WAL, memory mapping, and TCP multi-reactor loop.
- [**Product Architecture & Pitch**](forgeql_architecture_pitch.md): Detailed comparison matrix of ForgeQL vs. MySQL, PostgreSQL, and MongoDB.
- [**Project Structure**](structure.md): Workspace directory tree, folder responsibilities, and subsystem maps.
- [**File Index Catalog**](file_index.md): Complete component index, Java source classes, dependencies, and file functions.
- [**Developer Paths Guide**](paths.md): Code execution paths, request lifecycle flow, and storage routing.

### 📋 Status & Technical Roadmap
- [**System Status**](status.md): Current system capabilities, build health, and completed v3.0.0 features.
- [**Master Roadmap**](roadmap.md): Master v4.0.0 architecture roadmap across Storage, Indexing, AI Vector Search, Networking, and Studio IDE.
- [**Implemented Feature Inventory**](implemented.md): Comprehensive inventory of validated core capabilities and unit tests.
- [**Version History**](version_history.md): Full release timeline from initial prototype iterations to current v3.0.0 architecture.

### 📖 Query & Performance Reference
- [**Master Query Developer Guide**](query_guide.md): Declarative OQL query syntax, HTTP REST API payload specification, and OWP wire protocol reference.
- [**Benchmarks & Performance Metrics**](benchmarks.md): Hardware specs, latency profiles ($O(\log N)$ point lookups, HNSW KNN, throughput), and reproduction steps.
- [**Refactor Log**](refactor_log.md): Architectural refactoring log and maintenance history.

### 📁 Release Logs, Community & Project Governance
- [**Changelog**](CHANGELOG.md): Master release changelog and version notes.
- [**Contributing Guidelines**](CONTRIBUTING.md): Guidelines for code contributions, pull requests, and development.
- [**Code of Conduct**](CODE_OF_CONDUCT.md): Community guidelines and standards of conduct.
- [**Security Policy**](SECURITY.md): Vulnerability reporting procedures and security guidelines.
- [**Release Logs**](logs/): Individual release notes (v0.1.0 through v4.0.0).
- [**v1 Prototype Archive**](versions/v1_prototype/README.md): Archival logs and prototype milestone notes (Day 1 through Day 8).

---

## 🚀 Quick Navigation Links

| Resource | Path / Link |
|---|---|
| Main Repository Landing Page | [`/README.md`](../README.md) |
| Core Java Storage Engine | [`/forgeql-core`](../forgeql-core/) |
| Network & REST API Server | [`/forgeql-api`](../forgeql-api/) |
| Forge Studio React Web IDE | [`/forgeql-dashboard`](../forgeql-dashboard/) |
| Benchmarks Suite | [`/benchmarks`](../benchmarks/) |
