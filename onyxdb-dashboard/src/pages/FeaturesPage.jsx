import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import FeatureDetailModal from '../components/FeatureDetailModal';
import { Database, Network, Cpu, ShieldCheck, Zap, Layers, Search, Lock, GitBranch, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  {
    id: "mmap",
    icon: Database,
    title: "OS Zero-Copy Memory Mapping (mmap)",
    desc: "MmapStorageManager maps database storage files directly into OS virtual memory page cache using FileChannel.map.",
    longDesc: "By leveraging Operating System virtual memory page mapping (FileChannel.map), OnyxDB bypasses Java garbage collector pauses and user-space buffer copying during heavy write operations.",
    tag: "STORAGE CORE",
    file: "MmapStorageManager.java",
    specs: [
      { label: "Memory Model", value: "FileChannel.map MappedByteBuffer" },
      { label: "Buffer Allocation", value: "Off-Heap Direct Allocation" },
      { label: "Page Size", value: "8KB Slotted Blocks" },
      { label: "GC Impact", value: "Zero Heap Garbage" }
    ],
    codeExample: `// MmapStorageManager.java
FileChannel channel = FileChannel.open(path, StandardOpenOption.READ, StandardOpenOption.WRITE);
MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, fileSize);
// Direct page slot lookup in off-heap virtual memory`,
    examplePayload: { action: "select", table: "users" }
  },
  {
    id: "btree",
    icon: Cpu,
    title: "8KB Slotted Page B+ Tree Indexing",
    desc: "Primary key lookups, inserts, leaf node splits, and deletes operate in logarithmic O(log N) time with 256-byte slotted binary search inside 8KB storage pages.",
    longDesc: "Primary keys are indexed using slotted B+ Trees. Each 8KB storage page contains a 256-byte slot array at the page header. Leaf nodes maintain doubly-linked pointers for range scans.",
    tag: "INDEXING",
    file: "BTreeManager.java",
    specs: [
      { label: "Lookup Time", value: "O(log N) Binary Slot Search" },
      { label: "Page Block", value: "8192 Bytes (8KB)" },
      { label: "Header Capacity", value: "256 Slot Pointers" },
      { label: "Split Strategy", value: "50/50 Equal Page Split" }
    ],
    codeExample: `// OQS Primary Key Lookup
{
  "oqs": "GET users 101"
}`,
    examplePayload: { oqs: "GET users 101" }
  },
  {
    id: "hnsw",
    icon: Network,
    title: "Native HNSW Vector Search Engine",
    desc: "HnswIndex builds Hierarchical Navigable Small World graphs for high-dimensional vector embeddings, computing Cosine Similarity distance metrics natively.",
    longDesc: "HNSW indexes floating-point vector arrays across multi-layer graph structures. Intercepts relational filters during KNN traversal for fast hybrid search.",
    tag: "AI & VECTOR",
    file: "HnswIndex.java",
    specs: [
      { label: "Vector Metric", value: "Cosine Similarity (Java Single-Pass)" },
      { label: "Index Graph", value: "Hierarchical Navigable Small World" },
      { label: "Recall Accuracy", value: "99.95% KNN Accuracy" },
      { label: "Hybrid Search", value: "Relational Filter Intercept" }
    ],
    codeExample: `// Hybrid Vector Search Query
{
  "action": "vector_search",
  "table": "embeddings",
  "vector": [0.12, 0.85, 0.43, -0.21],
  "k": 5
}`,
    examplePayload: {
      action: "vector_search",
      table: "embeddings",
      vector: [0.12, 0.85, 0.43, -0.21],
      k: 5
    }
  },
  {
    id: "owp",
    icon: Zap,
    title: "Onyx Wire Protocol (OWP)",
    desc: "High-throughput binary socket protocol on TCP port 8081 with a compact 9-byte header framing structure (0x4F4E5958 magic header).",
    longDesc: "Provides non-blocking socket communication over port 8081. Acceptor thread routes incoming client TCP sockets across CPU worker threads using Round-Robin load balancing.",
    tag: "NETWORKING",
    file: "OnyxWireProtocol.java",
    specs: [
      { label: "Magic Header", value: "0x4F4E5958 ('ONYX')" },
      { label: "Header Overhead", value: "9 Bytes Binary" },
      { label: "Socket Port", value: "8081 (NIO SocketChannel)" },
      { label: "Load Balancer", value: "RoundRobinWorkerGroup" }
    ],
    codeExample: `// Raw Binary TCP Packet Layout
[0x4F, 0x4E, 0x59, 0x58] -> 4-Byte Magic Header
[0x01]                   -> 1-Byte Message Type
[0x00, 0x00, 0x00, 0x2A] -> 4-Byte Length Payload`,
    examplePayload: { oqs: "GET telemetry 9901" }
  },
  {
    id: "relational",
    icon: GitBranch,
    title: "Relational Foreign Keys (RESTRICT / CASCADE)",
    desc: "SchemaManager enforces cross-table relational integrity with persistent .schema files, guaranteeing RESTRICT parent guards and CASCADE child purges.",
    longDesc: "When records are mutated or deleted, SchemaManager checks schema rules. If ON_DELETE = CASCADE, it recursively deletes matching B+ Tree child slots.",
    tag: "RELATIONAL",
    file: "SchemaManager.java",
    specs: [
      { label: "Cascade Rules", value: "RESTRICT & CASCADE" },
      { label: "Schema Metadata", value: "Persistent .schema JSON" },
      { label: "Integrity Check", value: "Primary Key Parent Guard" },
      { label: "Recursion Depth", value: "Multi-Table Cascading" }
    ],
    codeExample: `// Create Foreign Key Payload
{
  "action": "create_foreign_key",
  "table": "orders",
  "field": "user_id",
  "parent_table": "users",
  "parent_field": "id",
  "on_delete": "CASCADE"
}`,
    examplePayload: {
      action: "create_foreign_key",
      table: "orders",
      field: "user_id",
      parent_table: "users",
      parent_field: "id",
      on_delete: "CASCADE"
    }
  },
  {
    id: "cbo",
    icon: Search,
    title: "Cost-Based Query Optimizer (CBO)",
    desc: "EXPLAIN profiler inspects query paths, index selectivity statistics, and estimates page block I/O costs to choose optimal execution plans.",
    longDesc: "Evaluates selectivity stats from TableStats histograms to determine whether to execute a POINT_LOOKUP, SECONDARY_INDEX_SCAN, or FULL_TABLE_SCAN.",
    tag: "OPTIMIZER",
    file: "QueryOptimizer.java",
    specs: [
      { label: "Cost Model", value: "Page Block I/O Estimator" },
      { label: "Scan Types", value: "POINT_LOOKUP, INDEX_SCAN, FULL_SCAN" },
      { label: "Profiler Command", value: "EXPLAIN FIND <query>" },
      { label: "Histogram Engine", value: "TableStats.java" }
    ],
    codeExample: `// EXPLAIN Query Payload
{
  "oqs": "EXPLAIN FIND orders WHERE amount > 500"
}`,
    examplePayload: { oqs: "EXPLAIN FIND orders WHERE amount > 500" }
  },
  {
    id: "wal",
    icon: Layers,
    title: "Write-Ahead Logging (WAL) Durability",
    desc: "Append-only .wal transaction logs guarantee ACID durability by replaying mutations on startup following unexpected system crashes.",
    longDesc: "Every insert, update, or delete transaction is committed to the append-only WAL log with CRC checksums before page buffers are modified.",
    tag: "DURABILITY",
    file: "WriteAheadLog.java",
    specs: [
      { label: "Log Format", value: "Append-Only Binary Log (.wal)" },
      { label: "Crash Recovery", value: "Startup Replay Engine" },
      { label: "Checksum", value: "CRC32 Mutation Verification" },
      { label: "ACID Mode", value: "FULL_SYNC & ASYNC_COMMIT" }
    ],
    codeExample: `// WAL Mutation Record
{
  "action": "insert",
  "table": "wal_demo",
  "data": { "id": 101, "tx_status": "COMMITTED" }
}`,
    examplePayload: { action: "insert", table: "wal_demo", data: { id: 101, tx_status: "COMMITTED" } }
  },
  {
    id: "rbac",
    icon: Lock,
    title: "Role-Based Access Control (RBAC)",
    desc: "JWT HMAC-SHA256 authentication differentiating ADMIN (read/write/update/delete/index) and READ_ONLY authorization roles.",
    tag: "SECURITY",
    file: "QueryController.java",
    specs: [
      { label: "Token Format", value: "JWT HMAC-SHA256 Bearer" },
      { label: "Roles", value: "ADMIN & READ_ONLY" },
      { label: "Read Guard", value: "SELECT & FIND Allowed for READ_ONLY" },
      { label: "Write Guard", value: "INSERT/UPDATE/DELETE Blocked for READ_ONLY" }
    ],
    codeExample: `// Authorization Header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
    examplePayload: { action: "select", table: "users" }
  }
];

export default function FeaturesPage() {
  const [selectedFeature, setSelectedFeature] = useState(null);

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
            <Zap className="w-3.5 h-3.5" /> OnyxDB Capabilities &amp; Specifications
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            Engineered for <span className="text-white/60">Performance &amp; Control</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Click any feature card to open the technical specification modal with Java source references, cost models, and code samples.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 + 0.1 }}
              onClick={() => setSelectedFeature(feat)}
              className="bg-[#121214] border border-white/10 hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-white/20 group-hover:text-emerald-400 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-400/10 transition-colors">
                    <feat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-white/40 tracking-wider">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  {feat.desc}
                </p>
              </div>

              <div className="pt-4 mt-6 border-t border-white/5 text-xs font-mono text-emerald-400/80 flex items-center justify-between">
                <span>{feat.file}</span>
                <span className="font-bold group-hover:underline">Inspect Specs &rarr;</span>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Detail Modal */}
      <FeatureDetailModal
        feature={selectedFeature}
        isOpen={Boolean(selectedFeature)}
        onClose={() => setSelectedFeature(null)}
      />

      <Footer />
    </div>
  );
}
