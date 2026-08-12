import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import FeatureDetailModal from '../components/FeatureDetailModal';
import { Layers, Server, Cpu, Database, Network, ShieldCheck, FileText, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ARCH_COMPONENTS = {
  core: [
    {
      id: "execution_engine",
      title: "ExecutionEngine.java",
      tag: "QUERY PROCESSING",
      desc: "Translates JSON nodes and OQS query strings into database operations across multi-table storage files.",
      longDesc: "ExecutionEngine is the core query coordinator. It receives query payloads from REST/TCP handlers, parses JSON action nodes, coordinates B+ Tree leaf lookups, and invokes HnswIndex for vector similarity searches.",
      file: "com.onyxdb.core.execution.ExecutionEngine",
      specs: [
        { label: "Role", value: "Query Execution & Route Coordinator" },
        { label: "Query Parsers", value: "JSON AST & Onyx Query Syntax (OQS)" },
        { label: "Metrics Telemetry", value: "getSystemMetrics() Delegate" },
        { label: "Multi-Table Router", value: "Per-Table File Mapping (.db)" }
      ],
      codeExample: `// ExecutionEngine.java
public List<String> executeQuery(Map<String, Object> query) {
    String action = (String) query.get("action");
    if ("select".equalsIgnoreCase(action)) {
        return handleSelect(query);
    } else if ("vector_search".equalsIgnoreCase(action)) {
        return handleVectorSearch(query);
    }
    // ...
}`
    },
    {
      id: "mmap_storage",
      title: "MmapStorageManager.java",
      tag: "VIRTUAL MEMORY",
      desc: "Maps database binary files directly into Operating System Virtual Memory page cache.",
      longDesc: "MmapStorageManager maps 8KB slotted page blocks using FileChannel.map into MappedByteBuffer objects. Bypasses Java heap GC pauses during heavy read/write database traffic.",
      file: "com.onyxdb.core.storage.MmapStorageManager",
      specs: [
        { label: "OS Interface", value: "FileChannel.map MappedByteBuffer" },
        { label: "Memory Allocation", value: "Off-Heap Direct Memory" },
        { label: "Page Alignment", value: "8192 Bytes (8KB Slotted)" },
        { label: "Sync Flush", value: "msync Force Page Commit" }
      ],
      codeExample: `// Off-heap memory mapped page lookup
MappedByteBuffer mmap = channel.map(FileChannel.MapMode.READ_WRITE, 0, fileSize);
byte[] slotData = new byte[slotLength];
mmap.position(slotOffset);
mmap.get(slotData);`
    },
    {
      id: "btree_manager",
      title: "BTreeManager.java",
      tag: "INDEX ENGINE",
      desc: "Primary key logarithmic search over 8KB slotted B+ Tree storage page blocks.",
      longDesc: "BTreeManager maintains primary key B+ Trees with 256-byte header slots in 8KB slotted page leaves. Guarantees O(log N) lookup, insert, and split times.",
      file: "com.onyxdb.core.index.BTreeManager",
      specs: [
        { label: "Lookup Complexity", value: "O(log N) Binary Slot Search" },
        { label: "Block Capacity", value: "8KB Slotted Page" },
        { label: "Node Splitting", value: "Balanced 50/50 Leaf Split" },
        { label: "Slot Directory", value: "256 Slot Offset Pointers" }
      ],
      codeExample: `// Logarithmic primary key lookup
int slot = binarySearchSlots(pageBuffer, targetId);
if (slot >= 0) {
    return readRecordAtSlot(pageBuffer, slot);
}`
    },
    {
      id: "hnsw_index",
      title: "HnswIndex.java",
      tag: "AI VECTOR ENGINE",
      desc: "Hierarchical Navigable Small World graph for fast AI embedding vector similarity searches.",
      longDesc: "HnswIndex builds multi-layered proximity graphs for floating-point embedding vectors. Computes Cosine Distance metrics natively in Java for RAG workflows.",
      file: "com.onyxdb.core.index.hnsw.HnswIndex",
      specs: [
        { label: "Vector Distance", value: "Cosine Similarity Metric" },
        { label: "Index Graph", value: "Hierarchical Navigable Small World" },
        { label: "KNN Search", value: "Max-Heap Nearest Neighbor Search" },
        { label: "Recall", value: "99.95% Cosine Precision" }
      ],
      codeExample: `// HnswIndex KNN Cosine Search
List<NodeResult> neighbors = hnswGraph.searchKnn(queryVector, k);
return formatVectorResults(neighbors);`
    },
    {
      id: "schema_manager",
      title: "SchemaManager.java",
      tag: "RELATIONAL RULES",
      desc: "Enforces cross-table relational foreign key constraints (RESTRICT & CASCADE rules).",
      longDesc: "SchemaManager persists relational constraints to .schema JSON files. Intercepts record deletions to enforce RESTRICT guards or trigger recursive CASCADE child slot deletions.",
      file: "com.onyxdb.core.schema.SchemaManager",
      specs: [
        { label: "Rules", value: "RESTRICT & CASCADE Policies" },
        { label: "Persistence", value: "Persistent .schema Files" },
        { label: "Validation", value: "Primary Key Existence Check" },
        { label: "Recursion", value: "Cascading Child Slot Deletes" }
      ],
      codeExample: `// Foreign Key Constraint Check
if ("RESTRICT".equals(policy) && hasChildRecords(childTable, parentId)) {
    throw new SQLException("Forbidden: RESTRICT parent deletion rule");
}`
    },
    {
      id: "wal_log",
      title: "WriteAheadLog.java",
      tag: "ACID DURABILITY",
      desc: "Append-only transaction log maintaining durability checksums for startup crash recovery.",
      longDesc: "WriteAheadLog records all insert, update, and delete mutations to disk prior to buffer page modification. Replays transactions on startup after unexpected power loss.",
      file: "com.onyxdb.core.wal.WriteAheadLog",
      specs: [
        { label: "Log Storage", value: "Append-Only Binary (.wal)" },
        { label: "Crash Recovery", value: "Automatic Startup Replay" },
        { label: "Integrity", value: "CRC32 Mutation Verification" },
        { label: "Durability", value: "ACID Transaction Guarantees" }
      ],
      codeExample: `// Append mutation to WAL log
walChannel.write(serializeTransaction(txId, action, table, recordData));
walChannel.force(false); // msync flush`
    }
  ],
  api: [
    {
      id: "socket_server",
      title: "OnyxNativeSocketServer.java",
      tag: "TCP NIO SERVER",
      desc: "Non-blocking Java NIO ServerSocketChannel accepting TCP client socket connections on port 8081.",
      longDesc: "Listens for raw TCP binary protocol client connections. Dispatches accepted SocketChannels to RoundRobinWorkerGroup worker threads for processing.",
      file: "com.onyxdb.api.network.OnyxNativeSocketServer",
      specs: [
        { label: "TCP Port", value: "8081 (Native Socket)" },
        { label: "Channel Model", value: "ServerSocketChannel NIO" },
        { label: "Acceptor Thread", value: "Single Acceptor Loop" },
        { label: "Worker Router", value: "Round-Robin Distribution" }
      ],
      codeExample: `ServerSocketChannel serverSocket = ServerSocketChannel.open();
serverSocket.bind(new InetSocketAddress(8081));
// Non-blocking NIO acceptor loop`
    },
    {
      id: "worker_group",
      title: "RoundRobinWorkerGroup.java",
      tag: "THREAD REACTOR",
      desc: "Multi-Reactor CPU worker thread pool distributing incoming TCP socket connections.",
      longDesc: "Implements the Multi-Reactor event loop pattern. Distributes client socket channels across CPU worker threads to maximize concurrent query throughput without lock contention.",
      file: "com.onyxdb.api.network.RoundRobinWorkerGroup",
      specs: [
        { label: "Pattern", value: "Multi-Reactor Event Loop" },
        { label: "Worker Count", value: "Available CPU Processors" },
        { label: "Load Balancer", value: "Atomic Integer Round-Robin" },
        { label: "Protocol Unpacker", value: "OnyxWireProtocol Decoder" }
      ],
      codeExample: `WorkerThread worker = workerPool[counter.getAndIncrement() % workerPool.length];
worker.registerChannel(socketChannel);`
    },
    {
      id: "query_controller",
      title: "QueryController.java",
      tag: "REST API & RBAC",
      desc: "Spring Boot REST controller serving /api/query, /api/stats, and /api/metrics with JWT guards.",
      longDesc: "Handles incoming HTTP REST POST /api/query requests. Validates Bearer tokens via JwtTokenProvider and enforces RBAC authorization rules before executing queries.",
      file: "com.onyxdb.api.QueryController",
      specs: [
        { label: "HTTP Port", value: "8080 (Embedded Tomcat)" },
        { label: "Endpoints", value: "/api/query, /api/stats, /api/metrics" },
        { label: "RBAC Guard", value: "ADMIN vs READ_ONLY Authorization" },
        { label: "CORS", value: "@CrossOrigin(origins = '*')" }
      ],
      codeExample: `@PostMapping("/query")
public ResponseEntity<Map<String, Object>> executeQuery(
    @RequestHeader("Authorization") String authHeader,
    @RequestBody Map<String, Object> query) { ... }`
    }
  ]
};

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState('core');
  const [selectedComponent, setSelectedComponent] = useState(null);

  const components = ARCH_COMPONENTS[activeTab] || ARCH_COMPONENTS.core;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <AppNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-emerald-400 text-xs font-mono mb-4 border border-white/10">
            <Layers className="w-3.5 h-3.5" /> OnyxDB System Architecture
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            Subsystems <span className="text-white/60">&amp; Core Components</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Click any source component to inspect Java class specifications, concurrency models, and code implementations.
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveTab('core')}
            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-md ${
              activeTab === 'core'
                ? 'bg-white text-black scale-105'
                : 'bg-[#121214] text-white/70 hover:text-white border border-white/10'
            }`}
          >
            onyxdb-core Subsystem
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-6 py-3 rounded-full text-sm font-semibold transition-all shadow-md ${
              activeTab === 'api'
                ? 'bg-white text-black scale-105'
                : 'bg-[#121214] text-white/70 hover:text-white border border-white/10'
            }`}
          >
            onyxdb-api Network Subsystem
          </button>
        </div>

        {/* Component Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {components.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 + 0.1 }}
              onClick={() => setSelectedComponent(c)}
              className="bg-[#121214] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-white/20 group-hover:text-emerald-400 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    {c.tag}
                  </span>
                </div>

                <h3 className="text-xl font-mono font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                  {c.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  {c.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40">{c.file.split('.').pop()}.java</span>
                <span className="text-emerald-400 font-bold group-hover:underline">Inspect Class &rarr;</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Component Detail Modal */}
      <FeatureDetailModal
        feature={selectedComponent}
        isOpen={Boolean(selectedComponent)}
        onClose={() => setSelectedComponent(null)}
      />

      <Footer />
    </div>
  );
}
