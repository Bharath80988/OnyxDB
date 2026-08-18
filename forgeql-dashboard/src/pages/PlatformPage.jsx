import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/Footer';
import FeatureDetailModal from '../components/FeatureDetailModal';
import { Terminal, Copy, Check, Server, Zap, Cpu, ShieldCheck, Code, Layers, ArrowUpRight, FileCode } from 'lucide-react';
import { motion } from 'framer-motion';

const PLATFORM_ITEMS = [
  {
    id: "npm",
    title: "Node.js NPM & npx Runner",
    tag: "NODE.JS PACKAGE",
    desc: "Bootstrap an embedded ForgeQL server directly via npx or import as a dependency into Express & Next.js backends.",
    longDesc: "The NPM wrapper ('npx forgeql' or 'npm install forgeql') contains the embedded ForgeQL standalone JAR and Node.js process manager. It listens on HTTP port 8080 and TCP socket port 8081.",
    file: "index.js / package.json",
    specs: [
      { label: "NPM Package Name", value: "forgeql" },
      { label: "Binary Entrypoint", value: "npx forgeql" },
      { label: "HTTP Port", value: "8080" },
      { label: "TCP Port", value: "8081" }
    ],
    codeExample: `// Node.js Client Example
const axios = require('axios');

const DB_URL = 'http://localhost:8080';
const res = await axios.post(\`\${DB_URL}/api/query\`, {
  action: "insert",
  table: "users",
  data: { id: 101, name: "Alice", role: "ADMIN" }
}, {
  headers: { Authorization: "Bearer admin-secret-key" }
});

console.log(res.data);`
  },
  {
    id: "pypi",
    title: "Python PyPI Distribution",
    tag: "PYTHON PACKAGE",
    desc: "Python wheel package providing terminal REPL client, vector distance helpers, and FastAPI / Django drivers.",
    longDesc: "The Python package ('pip install forgeql') includes an interactive terminal shell (forgeql start) and native Python bindings for non-blocking HTTP and TCP socket querying.",
    file: "pip-wrapper/setup.py",
    specs: [
      { label: "PyPI Package", value: "pip install forgeql" },
      { label: "CLI Launcher", value: "forgeql start" },
      { label: "Python Version", value: ">= 3.6" },
      { label: "Async Support", value: "httpx & asyncio" }
    ],
    codeExample: `# Python Client Example
import requests

DB_URL = "http://localhost:8080"

response = requests.post(f"{DB_URL}/api/query", json={
    "fql": "GET users 101"
}, headers={
    "Authorization": "Bearer admin-secret-key"
})

print(response.json())`
  },
  {
    id: "maven",
    title: "Java Standalone & Spring Boot",
    tag: "JAVA MAVEN",
    desc: "Standalone Spring Boot application executable bundling storage core, REST API, TCP NIO server, and React UI.",
    longDesc: "ForgeQL is compiled as an independent Java JAR (forgeql-api-0.2.0.jar) using Maven. It embeds Tomcat on port 8080 and a Round-Robin Multi-Reactor TCP server on port 8081.",
    file: "forgeql-api/pom.xml",
    specs: [
      { label: "Artifact ID", value: "com.forgeql:forgeql-api" },
      { label: "Java JDK", value: "Java 17+" },
      { label: "Execution Engine", value: "ExecutionEngine.java" },
      { label: "Storage Core", value: "MmapStorageManager.java" }
    ],
    codeExample: `<!-- pom.xml -->
<dependency>
    <groupId>com.forgeql</groupId>
    <artifactId>forgeql-core</artifactId>
    <version>0.2.0</version>
</dependency>`
  },
  {
    id: "mmap",
    title: "OS Zero-Copy Memory Paging (mmap)",
    tag: "STORAGE CORE",
    desc: "MmapStorageManager maps database files directly into OS virtual memory page cache using FileChannel.map.",
    longDesc: "By leveraging Operating System virtual memory page mapping, ForgeQL bypasses Java garbage collector pauses and user-space buffer copying during heavy write operations.",
    file: "MmapStorageManager.java",
    specs: [
      { label: "Memory Model", value: "FileChannel.map MappedByteBuffer" },
      { label: "Buffer Allocation", value: "Off-Heap Direct Allocation" },
      { label: "Page Size", value: "8KB Slotted Blocks" },
      { label: "GC Impact", value: "Zero Heap Garbage" }
    ],
    codeExample: `// MmapStorageManager.java Snippet
FileChannel channel = FileChannel.open(path, StandardOpenOption.READ, StandardOpenOption.WRITE);
MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, fileSize);
// Direct page slot lookup in off-heap virtual memory`
  },
  {
    id: "owp",
    title: "Forge Wire Protocol (OWP) Binary TCP",
    tag: "NETWORKING",
    desc: "High-throughput binary socket protocol on TCP port 8081 with a 9-byte header framing structure (0x4F4E5958).",
    longDesc: "Forge Wire Protocol (OWP) provides raw TCP binary socket communication, eliminating HTTP header parsing overhead. Features a 4-byte magic header, 1-byte message type, and 4-byte payload length.",
    file: "ForgeWireProtocol.java",
    specs: [
      { label: "Magic Header", value: "0x4F4E5958 ('FORGE')" },
      { label: "Header Overhead", value: "9 Bytes" },
      { label: "TCP Reactor Port", value: "8081" },
      { label: "Worker Pool", value: "Round-Robin Selector" }
    ],
    codeExample: `[ 0x4F 0x4E 0x59 0x58 ] -> 4-Byte Magic Header
[ 0x01 ]             -> 1-Byte Message Type (MSG_QUERY)
[ 0x00 0x00 0x00 0x2A ] -> 4-Byte Payload Length (42 Bytes)
[ JSON Payload Payload Bytes... ]`
  },
  {
    id: "cbo",
    title: "Cost-Based Query Optimizer (CBO)",
    tag: "QUERY ENGINE",
    desc: "EXPLAIN profiler evaluates index selectivity histograms and page block reads to select optimal query execution paths.",
    longDesc: "When executing FQL queries, QueryOptimizer evaluates selectivity metrics for primary B+ Trees vs secondary indexes, outputting detailed CBO cost estimates.",
    file: "QueryOptimizer.java",
    specs: [
      { label: "Optimizer Type", value: "Cost-Based Optimizer (CBO)" },
      { label: "Scan Types", value: "POINT_LOOKUP, INDEX_SCAN, FULL_SCAN" },
      { label: "Profiler Command", value: "EXPLAIN FIND <table|query>" },
      { label: "Selectivity Model", value: "TableStats Histograms" }
    ],
    codeExample: `// Query Execution Payload
{
  "fql": "EXPLAIN FIND orders WHERE status = 'COMPLETED'"
}`
  }
];

export default function PlatformPage() {
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [copiedCmd, setCopiedCmd] = useState(null);

  const copyToClipboard = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-orange-400 text-xs font-mono mb-4 border border-white/10">
            <Server className="w-3.5 h-3.5" /> ForgeQL Multi-Language Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
            Zero-Dependency <span className="text-white/60">Distribution</span>
          </h1>
          <p className="text-lg text-white/60 leading-relaxed">
            Click any package or architecture component to view deep technical specs, source code files, and execution benchmarks.
          </p>
        </motion.div>

        {/* Interactive Platform Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {PLATFORM_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 + 0.1 }}
              onClick={() => setSelectedFeature(item)}
              className="bg-[#121214] border border-white/10 hover:border-orange-500/40 rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-white/20 group-hover:text-orange-400 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-orange-400 uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-orange-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-white/40">{item.file}</span>
                <span className="text-orange-400 font-bold group-hover:underline">View Specs &rarr;</span>
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
