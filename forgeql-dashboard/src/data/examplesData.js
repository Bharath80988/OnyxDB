export const queryExamples = [
  {
    id: "q1",
    title: "1. Hybrid Vector Search with Metadata Filter",
    category: "AI & Vector Search",
    difficulty: "Hard",
    description: "Search high-dimensional vector embeddings using Cosine Similarity while applying strict metadata filters (category = 'hardware' and in_stock = true) in a single execution pass.",
    explanation: "ForgeQL's HNSW vector index intercepts relational metadata filters during graph traversal. It evaluates Cosine distance on candidate nodes matching B+ Tree index slots, avoiding full table post-filtering.",
    payload: {
      action: "vector_search",
      table: "products",
      vector: [0.12, 0.85, 0.43, -0.21, 0.08, 0.91, -0.34, 0.55],
      k: 5,
      where: {
        category: "hardware",
        in_stock: true
      }
    },
    fqlEquivalent: "VECTOR_SEARCH products TOP 5 [0.12, 0.85, 0.43, -0.21] WHERE category = 'hardware'",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'products' } },
      { id: '2', type: 'filterNode', position: { x: 380, y: 150 }, data: { field: 'category = hardware' } },
      { id: '3', type: 'fqlNode', position: { x: 660, y: 150 }, data: { query: 'VECTOR_SEARCH k=5' } }
    ]
  },
  {
    id: "q2",
    title: "2. Relational Foreign Key Cascade Deletion",
    category: "Relational Engine",
    difficulty: "Hard",
    description: "Delete a primary parent record from the 'users' table and automatically trigger cascading deletions across child 'orders' and 'audit_logs' tables.",
    explanation: "When a parent key is deleted, SchemaManager checks `.schema` definitions. If ON_DELETE = CASCADE, it recursively locates child records in orders.db and deletes matching B+ Tree slotted slots.",
    payload: {
      action: "delete",
      table: "users",
      id: 101,
      cascade: true
    },
    fqlEquivalent: "DELETE users 101 CASCADE",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'users (ID: 101)' } },
      { id: '2', type: 'filterNode', position: { x: 380, y: 150 }, data: { field: 'CASCADE -> orders, logs' } }
    ]
  },
  {
    id: "q3",
    title: "3. Cost-Based Optimizer EXPLAIN Plan Analysis",
    category: "Query Optimizer",
    difficulty: "Medium",
    description: "Inspect the Cost-Based Optimizer (CBO) execution plan, index selectivity estimates, and I/O cost comparisons for a multi-field query.",
    explanation: "EXPLAIN evaluates table statistics histograms, index cardinalities, and estimated page block reads. It selects between POINT_LOOKUP, SECONDARY_INDEX_SCAN, or FULL_TABLE_SCAN.",
    payload: {
      fql: "EXPLAIN FIND orders WHERE status = 'COMPLETED' AND amount > 500"
    },
    fqlEquivalent: "EXPLAIN FIND orders WHERE status = 'COMPLETED' AND amount > 500",
    nodes: [
      { id: '1', type: 'fqlNode', position: { x: 200, y: 150 }, data: { query: 'EXPLAIN FIND orders...' } }
    ]
  },
  {
    id: "q4",
    title: "4. Multi-Table Relational Foreign Key Creation",
    category: "Relational Engine",
    difficulty: "Hard",
    description: "Establish a foreign key relationship linking child table 'orders.user_id' to parent table 'users.id' with RESTRICT policy.",
    explanation: "Foreign key metadata is persisted to orders.schema. Subsequent inserts into orders verify parent primary keys in users.db in O(log N) logarithmic time.",
    payload: {
      action: "create_foreign_key",
      table: "orders",
      field: "user_id",
      parent_table: "users",
      parent_field: "id",
      on_delete: "RESTRICT"
    },
    fqlEquivalent: "ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'orders.user_id' } },
      { id: '2', type: 'filterNode', position: { x: 400, y: 150 }, data: { field: 'FK -> users.id (RESTRICT)' } }
    ]
  },
  {
    id: "q5",
    title: "5. B+ Tree Primary Key Upsert Operation",
    category: "Storage Engine",
    difficulty: "Medium",
    description: "Insert a new record or atomically overwrite an existing record in place within 8KB slotted page leaves.",
    explanation: "If primary key 'id' exists in the B+ Tree leaf slot, ExecutionEngine performs in-place memory slot shifting and writes a WAL mutation log.",
    payload: {
      action: "insert",
      table: "inventory",
      data: {
        id: 5001,
        sku: "GPU-H100-80G",
        quantity: 64,
        warehouse: "us-east-1",
        price: 32000.00
      }
    },
    fqlEquivalent: "INSERT INTO inventory {\"id\": 5001, \"sku\": \"GPU-H100-80G\", \"quantity\": 64}",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 150, y: 150 }, data: { table: 'inventory (ID: 5001)' } }
    ]
  },
  {
    id: "q6",
    title: "6. Secondary B+ Tree Index Creation & Auto-Sync",
    category: "Indexing",
    difficulty: "Medium",
    description: "Create a secondary B+ Tree index on non-primary attribute 'email' across user documents.",
    explanation: "Generates users_email.idx B+ Tree. All subsequent insert/update/delete actions automatically synchronize secondary leaf nodes.",
    payload: {
      action: "create_index",
      table: "users",
      field: "email"
    },
    fqlEquivalent: "INDEX users ON email",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'users' } },
      { id: '2', type: 'filterNode', position: { x: 380, y: 150 }, data: { field: 'CREATE B+ INDEX ON email' } }
    ]
  },
  {
    id: "q7",
    title: "7. Secondary Index Scan ($O(\\log N)$ Lookup)",
    category: "Indexing",
    difficulty: "Medium",
    description: "Execute a logarithmic non-primary key lookup on indexed field 'email' without scanning the entire table.",
    explanation: "QueryEngine routes 'email = alice@forge.db' directly to users_email.idx B+ Tree, retrieving primary key pointers in log time.",
    payload: {
      action: "select",
      table: "users",
      where: {
        email: "alice@forge.db"
      }
    },
    fqlEquivalent: "FIND users WHERE email = 'alice@forge.db'",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'users' } },
      { id: '2', type: 'filterNode', position: { x: 380, y: 150 }, data: { field: 'email = alice@forge.db' } }
    ]
  },
  {
    id: "q8",
    title: "8. Forge Wire Protocol (OWP) Binary Framing Query",
    category: "Networking",
    difficulty: "Hard",
    description: "Send zero-copy 9-byte binary header payload (0x4F4E5958 magic, type 0x01) over TCP socket port 8081.",
    explanation: "Bypasses HTTP overhead. Multi-Reactor worker thread unpacks 9-byte header and streams result directly to direct off-heap ByteBuffer.",
    payload: {
      owp_magic: "0x4F4E5958",
      msg_type: "0x01 (MSG_QUERY)",
      payload_len: 42,
      fql: "GET telemetry_events 9901"
    },
    fqlEquivalent: "OWP_SOCKET_QUERY [0x4F4E5958][0x01][LEN] GET telemetry_events 9901",
    nodes: [
      { id: '1', type: 'fqlNode', position: { x: 200, y: 150 }, data: { query: 'OWP TCP 8081 Query' } }
    ]
  },
  {
    id: "q9",
    title: "9. Write-Ahead Log (WAL) Durability Check",
    category: "Storage Engine",
    difficulty: "Hard",
    description: "Verify atomic Write-Ahead Log append operations for crash durability prior to page buffer commit.",
    explanation: "Mutations are serialized into .wal append log with checksums before page buffer modifications are flushed to mmap virtual memory.",
    payload: {
      action: "update",
      table: "wal_test",
      data: {
        id: 701,
        tx_status: "COMMITTED",
        wal_sequence: 149200
      }
    },
    fqlEquivalent: "UPDATE wal_test 701 SET tx_status = 'COMMITTED'",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'wal_test (701)' } },
      { id: '2', type: 'filterNode', position: { x: 380, y: 150 }, data: { field: 'WAL APPEND & CHECKSUM' } }
    ]
  },
  {
    id: "q10",
    title: "10. In-Place Slotted Page Field Update",
    category: "Storage Engine",
    difficulty: "Medium",
    description: "Modify document fields inside an 8KB slotted page leaf node in logarithmic time.",
    explanation: "Replaces target field bytes directly within slotted page offset directory without relocating adjacent records if record length is unchanged.",
    payload: {
      action: "update",
      table: "orders",
      data: {
        id: 5001,
        status: "SHIPPED",
        carrier: "FEDEX_EXPRESS"
      }
    },
    fqlEquivalent: "UPDATE orders 5001 SET status = 'SHIPPED'",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 150, y: 150 }, data: { table: 'orders (5001)' } }
    ]
  },
  {
    id: "q11",
    title: "11. High-Dimensional Embedding Index Insertion",
    category: "AI & Vector Search",
    difficulty: "Hard",
    description: "Store a 1536-dimensional OpenAI text embedding alongside JSON document attributes in ForgeQL.",
    explanation: "Primary B+ Tree stores document metadata while HnswIndex builds Navigable Small World links for real-time vector search.",
    payload: {
      action: "insert",
      table: "ai_documents",
      data: {
        id: 9901,
        title: "Transformer Architecture Deep Dive",
        author: "Vaswani et al.",
        vector: [0.012, -0.045, 0.089, 0.123, -0.098, 0.231, -0.114, 0.056]
      }
    },
    fqlEquivalent: "INSERT INTO ai_documents {\"id\": 9901, \"title\": \"Transformer...\", \"vector\": [...]}",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'ai_documents' } },
      { id: '2', type: 'fqlNode', position: { x: 400, y: 150 }, data: { query: 'INSERT 1536-dim VECTOR' } }
    ]
  },
  {
    id: "q12",
    title: "12. Multi-Field Filtered Table Scan",
    category: "Query Engine",
    difficulty: "Medium",
    description: "Evaluate unindexed multi-attribute conditions sequentially across table pages when secondary index is unavailable.",
    explanation: "Iterates B+ Tree leaf page slots in sequence, testing JSON attributes against matching criteria.",
    payload: {
      action: "select",
      table: "audit_logs",
      where: {
        severity: "CRITICAL",
        resolved: false
      }
    },
    fqlEquivalent: "FIND audit_logs WHERE severity = 'CRITICAL' AND resolved = false",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 100, y: 150 }, data: { table: 'audit_logs' } },
      { id: '2', type: 'filterNode', position: { x: 380, y: 150 }, data: { field: 'severity = CRITICAL' } }
    ]
  },
  {
    id: "q13",
    title: "13. RBAC Admin Authorization Token Guard",
    category: "Security",
    difficulty: "Medium",
    description: "Execute an administrative table mutation with JWT Bearer Token validation.",
    explanation: "QueryController validates HMAC-SHA256 signature in Authorization header. Ensures READ_ONLY users cannot perform mutative actions.",
    payload: {
      auth_header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      action: "delete",
      table: "session_tokens",
      id: 8841
    },
    fqlEquivalent: "DELETE session_tokens 8841 WITH AUTH_BEARER",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 200, y: 150 }, data: { table: 'session_tokens (JWT)' } }
    ]
  },
  {
    id: "q14",
    title: "14. Memory-Mapped Virtual Page Flush",
    category: "Storage Engine",
    difficulty: "Hard",
    description: "Trigger an OS-level virtual memory sync (msync) for dirty pages in MmapStorageManager.",
    explanation: "Bypasses user-space buffer flushes. Maps off-heap direct byte buffers directly to OS disk pages via MappedByteBuffer.force().",
    payload: {
      action: "admin_msync",
      table: "telemetry_events",
      sync_mode: "ASYNC"
    },
    fqlEquivalent: "MSYNC telemetry_events ASYNC",
    nodes: [
      { id: '1', type: 'selectNode', position: { x: 200, y: 150 }, data: { table: 'mmap msync force()' } }
    ]
  },
  {
    id: "q15",
    title: "15. Full System Telemetry & Metrics Inspection",
    category: "Observability",
    difficulty: "Easy",
    description: "Query real-time database metrics including active tables, page cache hit ratios, and JVM memory usage.",
    explanation: "Executes GET /api/metrics, reading internal counters from ExecutionEngine, BTreeManager, and MmapStorageManager.",
    payload: {
      action: "get_metrics"
    },
    fqlEquivalent: "SHOW METRICS",
    nodes: [
      { id: '1', type: 'fqlNode', position: { x: 200, y: 150 }, data: { query: 'SHOW METRICS' } }
    ]
  }
];
