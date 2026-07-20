# OnyxDB - Day 1 Status

## What We Have Built
- **Project Foundation:** Initialized a multi-module Maven project with `onyxdb-core` (Java 21 Engine), `onyxdb-api` (Spring Boot REST API), and `onyxdb-dashboard` (Vite/React UI).
- **Storage Layer:** Built `StorageManager` which allocates and reads 8KB blocks (Pages) to/from the local `onyx.db` file using Java NIO.
- **Memory Layer:** Built `BufferPool`, an LRU cache that stores recently accessed pages in RAM so the database doesn't have to hit the slow disk for every query.
- **Execution Layer:** Built `BTreeManager` to serialize JSON payloads into raw bytes and pack them into the 8KB Pages. Created `ExecutionEngine` to parse `insert` and `select` commands.
- **Frontend Dashboard:** Built a professional, dark-mode Onyx-themed dashboard using DaisyUI to view server stats, connect to the database, and execute JSON queries.
- **Automated Bootstrapping:** Wrote `start-backend.ps1` to automatically download portable Maven and compile/start the engine without global installations.

## What The DB Can Do Right Now
- **Persist Data:** Start up locally, create an `onyx.db` file, and accept data insertions.
- **Read Data:** Accept a query by ID, jump into the 8KB page on disk/memory, deserialize the raw bytes back into JSON, and return it.
- **Provide Observability:** Expose real-time uptime and query execution endpoints for the dashboard.
