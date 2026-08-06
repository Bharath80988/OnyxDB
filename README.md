# OnyxDB (v4.0.0)

> **The Multi-Table Omni-Channel Database built on B+ Trees.**

OnyxDB is a high-performance, local-first database engine featuring B+ Tree page indexing, zero-copy OS virtual memory mapping (`mmap`), non-blocking NIO socket channels, native AI KNN vector search, hybrid vector+relational search, and an interactive **Onyx Terminal CLI** REPL. It includes an embedded database visualizer (**Onyx Studio**) served directly from its standalone binary engine.

---

## Quick Installation & Links

- **Python PyPI Package**: [![PyPI](https://img.shields.io/pypi/v/onyxdb.svg)](https://pypi.org/project/onyxdb/) `pip install onyxdb`
- **Node.js NPM Package**: [![npm](https://img.shields.io/npm/v/onyxdb.svg)](https://www.npmjs.com/package/onyxdb) `npx onyxdb`
- **Standalone Java Uber-JAR**: [GitHub Releases (v0.2.0)](https://github.com/Bharath80988/OnyxDB/releases)
- **Documentation Suite**: [`docs/`](./docs)

---

## Quickstart & Engine Startup

### Starting the OnyxDB Engine

OnyxDB can be bootstrapped instantly using any runtime environment:

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
Download `onyxdb-api-0.2.0.jar` from [GitHub Releases](https://github.com/Bharath80988/OnyxDB/releases) and execute:
```bash
java -jar onyxdb-api-0.2.0.jar
```

Upon initialization, OnyxDB starts the following services:
- **HTTP REST API Server**: `http://localhost:8080`
- **Zero-Copy Non-Blocking TCP Socket Server**: `localhost:8081`
- **Onyx Studio Visual IDE Dashboard**: `http://localhost:8080/`

---

## Simple Querying Options

OnyxDB provides three intuitive ways to query data:
1. **Onyx Query Syntax (OQS)**: Lightweight human-readable string commands.
2. **Client SDK Methods**: High-level helper methods in Python and Node.js.
3. **Structured JSON REST API**: Low-level REST endpoint queries.

---

### Method 1: Onyx Query Syntax (OQS)

Onyx Query Syntax (OQS) allows executing plain-text query strings without verbose JSON structures:

#### Point Fetch by ID
```sql
GET users 101
```

#### Filtered Record Search
```sql
FIND users WHERE status = ACTIVE
```

#### Insert Record
```sql
INSERT INTO users {"id": 101, "name": "Satoshi Nakamoto", "email": "satoshi@bitcoin.org", "status": "ACTIVE"}
```

#### Update Record
```sql
UPDATE users 101 SET status = INACTIVE
```

#### Delete Record
```sql
DELETE users 101
```

#### Create Secondary Index
```sql
INDEX users ON email
```

---

### Method 2: High-Level Client SDKs

#### Python SDK (`pip install onyxdb`)

```python
from onyxdb import OnyxDB

# Connect to local OnyxDB engine
db = OnyxDB(host="http://localhost:8080", token="admin-secret-key")

# Insert record
db.insert("users", 101, {"name": "Satoshi Nakamoto", "role": "ADMIN"})

# Get record by ID
user = db.get("users", 101)
print(user)

# Find records with matching criteria
active_users = db.find("users", {"role": "ADMIN"})

# Run Onyx Query Syntax (OQS) string query
res = db.oqs("FIND users WHERE role = ADMIN")

# EXPLAIN — show CBO execution plan
plan = db.explain("FIND users WHERE role = ADMIN")

# Hybrid Search — KNN vector similarity + relational filter
results = db.hybrid_search("docs", [0.1, 0.9, 0.3], where={"status": "ACTIVE"}, k=10)

# Update record
db.update("users", 101, {"status": "INACTIVE"})

# Delete record
db.delete("users", 101)
```

#### Node.js SDK (`npm install onyxdb`)

```javascript
const { OnyxClient } = require('onyxdb');

const db = new OnyxClient('http://localhost:8080', 'admin-secret-key');

async function main() {
    // Insert record
    await db.insert('users', 101, { name: 'Satoshi Nakamoto', role: 'ADMIN' });

    // Get record by ID
    const user = await db.get('users', 101);
    console.log(user);

    // Execute Onyx Query Syntax
    const activeUsers = await db.oqs('FIND users WHERE role = ADMIN');

    // EXPLAIN — get CBO execution plan
    const plan = await db.explain('FIND users WHERE role = ADMIN');
    console.log(plan);

    // Hybrid Search — KNN vector similarity + relational filter
    const results = await db.hybridSearch('docs', [0.1, 0.9, 0.3], { status: 'ACTIVE' }, 10);
    console.log(results);

    // Delete record
    await db.delete('users', 101);
}

main();
```

---

### Method 3: HTTP REST API & Authentication

HTTP queries are sent as `POST` requests to `http://localhost:8080/api/query`.

#### Authorization Roles
Include an `Authorization` header with all HTTP requests:
- **Admin Role** (Full read, write, update, delete, indexing permissions):
  `Authorization: Bearer admin-secret-key`
- **Read-Only Role** (Query and vector search permissions):
  `Authorization: Bearer readonly-secret-key`

#### REST Examples

##### 1. OQS Query Payload
```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"oqs": "GET users 101"}'
```

##### 2. AI Vector Search (KNN Cosine Similarity)
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

##### 3. EXPLAIN Query Profiling
```sql
EXPLAIN FIND users WHERE status = ACTIVE
```

##### 4. Hybrid Search Engine (KNN Vector Similarity + Relational Filter)
```bash
curl -X POST http://localhost:8080/api/query \
  -H "Authorization: Bearer readonly-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "hybrid_search",
    "table": "documents",
    "vector": [0.15, 0.82, -0.41, 0.09],
    "k": 3,
    "where": {"status": "ACTIVE"}
  }'
```

##### 5. Onyx Wire Protocol (OWP) Binary Socket Stream (Port 8081)
OnyxDB supports low-overhead binary framing over native TCP sockets on port `8081`:
- **Magic Header**: `0x4F4E5958` ("ONYX")
- **Header Length**: 9 Bytes (`[4B Magic][1B MsgType][4B Payload Length]`)
- **Message Types**: `0x01` (Query), `0x02` (Response), `0x03` (Explain)

##### 6. Interactive Onyx CLI REPL (SQL-like Terminal)
Launch the interactive terminal shell with ASCII table rendering, ANSI color, auto-completion, and live query execution:
```bash
java -cp onyxdb-api-*.jar com.onyxdb.api.cli.OnyxCli ./onyx_data
```

Once inside the REPL:
```sql
onyx> SHOW TABLES
onyx> DESCRIBE users
onyx> GET users 101
onyx> FIND users WHERE role = ADMIN
onyx> EXPLAIN FIND users WHERE role = ADMIN
onyx> SHOW METRICS
onyx> HELP
onyx> EXIT
```

##### 7. Live System Metrics Endpoint
```bash
curl http://localhost:8080/api/metrics
```

---

## Onyx Studio Frontend Visual IDE

When OnyxDB is running, navigate to **`http://localhost:8080`** in a web browser to access **Onyx Studio**.

### Studio Features
1. **Visual Database Explorer**: Inspect active tables, B+ Tree index structures, and foreign key rules.
2. **Visual Query Builder**: Drag-and-drop node interface for building and testing queries.
3. **System Telemetry & Monitoring**: Monitor LRU buffer pool hit ratios, active TCP event loop channels, and WAL mutation logs.

---

## Engine Architecture Highlights

- **OS Virtual Memory Mapping (`MmapStorageManager.java`)**: Maps database files directly to OS kernel virtual memory pages via `MappedByteBuffer`, eliminating JVM garbage collection pauses.
- **Round-Robin Multi-Reactor (`RoundRobinWorkerGroup.java`)**: Non-blocking Java NIO socket server distributing TCP channels across worker threads with dual-mode OWP binary and JSON framing.
- **Durability & Crash Recovery (`WriteAheadLog.java`)**: Append-only WAL transaction logging guaranteeing ACID compliance.
- **Onyx Wire Protocol (`OnyxWireProtocol.java`)**: High-performance 9-byte binary header socket protocol.

---

## Documentation Suite

Additional specifications and guides are located in [`docs/`](./docs):
- [Project Folder Structure](docs/structure.md)
- [File Index and Component Catalog](docs/file_index.md)
- [Master Architecture Roadmap](docs/roadmap.md)
- [System Status & Capabilities](docs/status.md)
- [Master Query Guide](docs/query_guide.md)
- [OQS Protocol Reference](docs/protocol.md)
- [Version History](docs/version_history.md)
- [Product Architecture Pitch & Database Comparison](docs/onyxdb_architecture_pitch.md)
