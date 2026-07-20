# Implemented Functionalities

OnyxDB has achieved a massive feature set for its v0.2.0 release. Below is a comprehensive list of all implemented functionalities that are currently live and ready for production use.

## Core Storage Engine
- **B+ Tree Indexing**: The foundational data structure ensuring O(log n) lookups, inserts, and deletes.
- **Disk-Backed Paging**: Data is persisted to disk in 8KB pages to maximize OS-level cache hits.
- **Buffer Pool Manager (LRU)**: An intelligent in-memory cache that evicts least-recently-used pages to prevent out-of-memory errors on massive datasets.
- **Slotted Pages**: Dynamic record sizing within a single page, preventing internal fragmentation.

## API & Networking
- **Native JSON over HTTP**: No proprietary protocols or thick SDKs. If you can make a cURL request, you can use OnyxDB.
- **Spring Boot Embedded Tomcat**: Highly concurrent HTTP handling for multi-threaded queries.
- **Multi-Table Dynamic Routing**: The engine intercepts the `"table": "users"` field in JSON payloads and dynamically loads or creates `users.db`.

## Operations
- **Insert / Upsert**: Automatically handles duplicate keys by overwriting existing records.
- **Select by ID**: O(1) to O(log n) lookups using primary keys.
- **Full Table Scans**: Sequential iteration over leaf nodes for unindexed queries.

## Frontend Dashboard
- **React + Vite Architecture**: Lightning-fast hot reloading and production builds.
- **10 Dynamic Themes**: Implemented via DaisyUI and Tailwind CSS (Light, Dark, Synthwave, Aqua, Forest, Sunset, Valentine, Night, Coffee, Emerald).
- **Visual Query Builder**: A React Flow node-based interface for drag-and-drop pipeline construction.
- **Lenis Smooth Scrolling**: A buttery-smooth scrolling experience across all documentation pages.
- **Open Source Activity Visualization**: Chart.js implementation tracking commits, PRs, and community engagement in real-time.
