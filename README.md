# OnyxDB (v3.0.0)

> **The Multi-Table Omni-Channel Database built on B+ Trees.**

OnyxDB is a high-performance, local-first database built on B+ Tree page indexing, zero-copy OS virtual memory mapping (`mmap`), non-blocking NIO socket channels, and native AI KNN vector search. It features an embedded visual database visualizer (**Onyx Studio**) served directly from its standalone binary engine.

---

## 📦 Quick Installation & Links

- **Python PyPI Package**: [![PyPI](https://img.shields.io/pypi/v/onyxdb.svg)](https://pypi.org/project/onyxdb/) `pip install onyxdb`
- **Node.js NPM Package**: [![npm](https://img.shields.io/npm/v/onyxdb.svg)](https://www.npmjs.com/package/onyxdb) `npx onyxdb`
- **Standalone Spring Boot Uber-JAR**: [GitHub Releases (v0.1.3)](https://github.com/Bharath80988/OnyxDB/releases)
- **Documentation Suite**: [`docs/`](./docs)

---

## ⚡ How It Works & Step-by-Step Tutorial

### Step 1: Starting the OnyxDB Engine

You can bootstrap OnyxDB using your preferred runtime environment:

#### Option A: Node.js (NPM)
```bash
npx onyxdb
```

#### Option B: Python (Pip)
```bash
pip install onyxdb
onyxdb
```

#### Option C: Standalone Executable Java Uber-JAR
Download `onyxdb-api-0.1.3.jar` from [GitHub Releases](https://github.com/Bharath80988/OnyxDB/releases) and run:
```bash
java -jar onyxdb-api-0.1.3.jar
```

Upon startup, OnyxDB will initialize:
- **HTTP REST API Server**: `http://localhost:8080`
- **Zero-Copy Non-Blocking TCP Socket Server**: `localhost:8081`
- **Onyx Studio Visual IDE Dashboard**: Embedded at `http://localhost:8080/`

---

### Step 2: Executing Queries

OnyxDB accepts structured JSON query payloads via HTTP `POST` to `http://localhost:8080/api/query` or directly over TCP socket connections on port `8081`.

#### Authentication (Role-Based Access Control)
Include an `Authorization` header with requests:
- **Admin Access** (Full permissions: `insert`, `update`, `delete`, `select`, `create_index`, `create_foreign_key`):
  `Authorization: Bearer admin-secret-key`
- **Read-Only Access** (Query permissions: `select`, `vector_search`):
  `Authorization: Bearer readonly-secret-key`

---

#### Query Tutorial & Examples

##### 1. Inserting Records into a Table
Automatically creates the dynamic storage file (`users.db`) and inserts records into 8KB B+ Tree pages.

```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "insert",
    "table": "users",
    "data": {
      "id": 101,
      "name": "Satoshi Nakamoto",
      "email": "satoshi@bitcoin.org",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }'
```

##### 2. Point Lookup by Primary Key
Executes an $O(\log N)$ binary search lookup over leaf page slots.

```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer readonly-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "select",
    "table": "users",
    "id": 101
  }'
```

##### 3. Creating a Secondary B+ Tree Index
Builds a secondary index on non-primary key attributes for fast lookup without scanning entire tables.

```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_index",
    "table": "users",
    "field": "email"
  }'
```

##### 4. Querying by Secondary Index
Routes execution directly through the secondary index tree in $O(\log N)$ time.

```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer readonly-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "select",
    "table": "users",
    "where": { "email": "satoshi@bitcoin.org" }
  }'
```

##### 5. AI Vector Search (KNN Cosine Similarity)
Executes exact K-Nearest Neighbor vector search over embedded vector arrays.

```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer readonly-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "vector_search",
    "table": "documents",
    "vector": [0.15, 0.82, -0.41, 0.09],
    "k": 3
  }'
```

##### 6. Schema Normalization & Foreign Key Rules
Enforces relational links between tables with automatic `.schema` disk persistence and deletion policies (`CASCADE` or `RESTRICT`).

```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_foreign_key",
    "table": "orders",
    "field": "user_id",
    "parent_table": "users",
    "parent_field": "id",
    "on_delete": "CASCADE"
  }'
```

##### 7. Updating and Deleting Records
```bash
# Update Record in Place
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "table": "users",
    "data": { "id": 101, "status": "INACTIVE" }
  }'

# Delete Record and Shift Leaf Slots
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "delete",
    "table": "users",
    "id": 101
  }'
```

---

### Step 3: Utilizing the Onyx Studio Frontend Visual IDE

When OnyxDB is running, open **`http://localhost:8080`** in your browser to access **Onyx Studio**.

#### Core Studio Features:

1. **Visual Database Explorer**:
   - Inspect active database tables (`users`, `orders`, `products`).
   - View dynamic primary & secondary B+ Tree index structures.
   - Explore persistent schema rules and relational foreign key linkages.

2. **Drag-and-Drop Visual Query Builder**:
   - Build complex queries visually without manually writing JSON objects.
   - Connect query nodes, set filter criteria, and test query execution with real-time JSON response previewing.

3. **Real-Time Telemetry & System Monitoring**:
   - Track **LRU Buffer Pool Memory Cache** hit ratios.
   - Monitor **Round-Robin TCP Worker Event Loops** and active channel connections.
   - View live **Write-Ahead Logging (WAL)** mutation event streams for crash recovery verification.

---

## 🏛️ Engine Architecture Highlights

- **OS Virtual Memory Mapping (`MmapStorageManager.java`)**: Maps storage files directly into OS kernel virtual memory pages using `MappedByteBuffer`, eliminating JVM heap garbage collection pauses and user-kernel copying overhead.
- **Round-Robin Multi-Reactor (`RoundRobinWorkerGroup.java`)**: Non-blocking Java NIO socket server distributing TCP channels across CPU core worker threads.
- **Durability & Recovery (`WriteAheadLog.java`)**: Sequential append-only WAL transaction logging guaranteeing ACID crash recovery.

---

## 📚 Complete Documentation Suite

Detailed guides, architectural blueprints, and specifications are located in [`docs/`](./docs):
- [Project Folder Structure](docs/structure.md)
- [File Index and Component Catalog](docs/file_index.md)
- [Master Architecture Roadmap (v4.0.0)](docs/roadmap.md)
- [System Status & Capabilities](docs/status.md)
- [Master Query Guide](docs/query_guide.md)
- [Product Architecture Pitch & Database Comparison](docs/onyxdb_architecture_pitch.md)
