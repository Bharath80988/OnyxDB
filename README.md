# OnyxDB (v0.2.0)

> **The Multi-Table Omni-Channel Database built on B+ Trees.**

OnyxDB is a high-performance, local-first database engine featuring B+ Tree page indexing, zero-copy OS virtual memory mapping (`mmap`), non-blocking NIO socket channels, and native AI KNN vector search. It includes an embedded database visualizer (**Onyx Studio**) served directly from its standalone binary engine.

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
    console.log(activeUsers);

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

##### 3. Foreign Key Constraint Creation
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
- **Round-Robin Multi-Reactor (`RoundRobinWorkerGroup.java`)**: Non-blocking Java NIO socket server distributing TCP channels across worker threads.
- **Durability & Crash Recovery (`WriteAheadLog.java`)**: Append-only WAL transaction logging guaranteeing ACID compliance.

---

## Documentation Suite

Additional specifications and guides are located in [`docs/`](./docs):
- [Project Folder Structure](docs/structure.md)
- [File Index and Component Catalog](docs/file_index.md)
- [Master Architecture Roadmap](docs/roadmap.md)
- [System Status & Capabilities](docs/status.md)
- [Master Query Guide](docs/query_guide.md)
- [Product Architecture Pitch & Database Comparison](docs/onyxdb_architecture_pitch.md)
