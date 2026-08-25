export const forgeSubsystems = [
  {
    id: "storage",
    label: "01 / MMAP STORAGE",
    shortName: "Storage Engine",
    headline: "Intelligence\nDesigned To Evolve",
    subhead: "Build applications that reason, adapt and collaborate using a modular AI platform designed for production.",
    indicators: [
      "● MMAP VIRTUAL MEMORY",
      "● B+ TREE INDEXING",
      "● WAL DURABILITY",
      "● LRU BUFFER POOL"
    ],
    stats: [
      { iconGlyph: "<", target: 120, suffix: "ms", decimals: 0, label: "Inference Time" },
      { iconGlyph: "%", target: 99.99, suffix: "%", decimals: 2, label: "Platform Uptime" },
      { iconGlyph: "*", target: 24, suffix: "/7", decimals: 0, label: "Autonomous Runtime" },
      { iconGlyph: "#", target: 2.4, suffix: "M", decimals: 1, label: "Context Windows" }
    ]
  },
  {
    id: "vector",
    label: "02 / AI HNSW VECTOR",
    shortName: "HNSW Vector Engine",
    headline: "Native AI Vector\nSearch Engine",
    subhead: "Combines HNSW vector similarity search with relational metadata filters in a single execution path for Cosine KNN search.",
    indicators: [
      "● HNSW KNN GRAPH",
      "● COSINE SIMILARITY",
      "● HYBRID SEARCH ENGINE",
      "● EMBEDDING INDEX"
    ],
    stats: [
      { iconGlyph: "<", target: 15, suffix: "ms", decimals: 0, label: "KNN Vector Latency" },
      { iconGlyph: "%", target: 99.95, suffix: "%", decimals: 2, label: "Cosine Recall Accuracy" },
      { iconGlyph: "*", target: 24, suffix: "/7", decimals: 0, label: "Hybrid Search Runtime" },
      { iconGlyph: "#", target: 1.5, suffix: "M", decimals: 1, label: "Vector Embeddings" }
    ]
  },
  {
    id: "owp",
    label: "03 / MULTI-REACTOR TCP",
    shortName: "NIO Socket Server",
    headline: "Binary Protocol &\nNIO Sockets",
    subhead: "High-throughput Multi-Reactor TCP server on port 8081 featuring Forge Wire Protocol (OWP) 9-byte binary header framing.",
    indicators: [
      "● OWP BINARY HEADER",
      "● PORT 8081 NIO",
      "● MULTI-REACTOR WORKER",
      "● RBAC JWT GUARD"
    ],
    stats: [
      { iconGlyph: "<", target: 8081, suffix: "TCP", decimals: 0, label: "Multi-Reactor Port" },
      { iconGlyph: "%", target: 99.99, suffix: "%", decimals: 2, label: "Wire Protocol Efficiency" },
      { iconGlyph: "*", target: 24, suffix: "/7", decimals: 0, label: "Non-Blocking Reactor" },
      { iconGlyph: "#", target: 9, suffix: "BYTE", decimals: 0, label: "OWP Header Overhead" }
    ]
  },
  {
    id: "optimizer",
    label: "04 / FQL & EXPLAIN",
    shortName: "Query Optimizer",
    headline: "Cost-Based Query\nOptimizer Engine",
    subhead: "Declarative Forge Query Syntax (FQL) with Cost-Based Optimizer (CBO) EXPLAIN execution profiler for I/O cost estimation.",
    indicators: [
      "● FQL SYNTAX PARSER",
      "● EXPLAIN CBO PROFILER",
      "● SECONDARY B+ TREES",
      "● FOREIGN KEYS"
    ],
    stats: [
      { iconGlyph: "<", target: 1, suffix: "ms", decimals: 0, label: "Point Lookup Time" },
      { iconGlyph: "%", target: 99.99, suffix: "%", decimals: 2, label: "Secondary Index Sync" },
      { iconGlyph: "*", target: 24, suffix: "/7", decimals: 0, label: "AST Execution Engine" },
      { iconGlyph: "#", target: 8, suffix: "KB", decimals: 0, label: "Slotted Page Block" }
    ]
  },
  {
    id: "tooling",
    label: "05 / SDK & CLI",
    shortName: "Developer Tooling",
    headline: "Universal Multi-Language\nDistribution",
    subhead: "Zero-dependency distribution across PyPI (pip install forgeql), NPM (npx forgeql), Java Maven, and embedded standalone Uber-JAR.",
    indicators: [
      "● PIP INSTALL FORGEQL",
      "● NPX FORGEQL",
      "● JAVA MAVEN STARTER",
      "● TERMINAL REPL CLI"
    ],
    stats: [
      { iconGlyph: "<", target: 3, suffix: "SDKs", decimals: 0, label: "Python, Node & Java" },
      { iconGlyph: "%", target: 100, suffix: "%", decimals: 0, label: "Zero Setup Dependency" },
      { iconGlyph: "*", target: 24, suffix: "/7", decimals: 0, label: "CLI REPL Shell" },
      { iconGlyph: "#", target: 1, suffix: "JAR", decimals: 0, label: "Embedded Standalone" }
    ]
  }
];

export const defaultHeroData = {
  titleLine1: "Intelligence",
  titleLine2: "Designed To Evolve",
  subhead: "Build applications that reason, adapt and collaborate using a modular AI platform designed for production.",
};
