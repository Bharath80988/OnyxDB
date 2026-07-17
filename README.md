# OnyxDB

> **A local-first, embeddable relational database with a modern developer experience.**

OnyxDB is a lightweight, high-performance relational database engine written in Java 21, wrapped in a Spring Boot API, and bundled with a beautiful React visualization dashboard. 

Unlike traditional RDBMS systems that require heavy installations, background services, and complex configurations, OnyxDB runs entirely on your local machine with zero configuration. It is designed to be completely transparent—giving developers full visibility into the storage engine, memory buffers, and transaction logs.

---

## Why OnyxDB? (vs. MySQL & PostgreSQL)

MySQL and PostgreSQL are mature, battle-tested databases for production web servers. **OnyxDB is built for the developer experience.** 

You should use OnyxDB when:
- **You need embeddability:** You want a database that runs inside your application process or locally without spinning up Docker containers or managing background services.
- **You want visual transparency:** OnyxDB comes with an out-of-the-box Dashboard that visually shows you exactly what the B+ Tree, Buffer Pool, and Write-Ahead Log are doing in real-time.
- **You want zero configuration:** Click, start, and query. No `pg_hba.conf`, no user creation scripts, no socket configuration.
- **You need an educational or testing environment:** OnyxDB's predictable internal architecture makes it perfect for understanding how databases actually work under the hood.

---

## Features

- ⚡ **Java NIO Storage Engine**: Direct disk I/O using 8KB fixed-size pages.
- 🧠 **LRU Buffer Pool**: Memory-efficient page caching to prevent unnecessary disk reads.
- 🛡️ **Write-Ahead Log (WAL)**: ACID-compliant durability for crash recovery.
- 🔌 **JSON Structured Query API**: Query your database via REST instead of strictly writing SQL strings.
- 📊 **Onyx Dashboard**: A built-in Vite + React visualization layer.

---

## Getting Started

### Prerequisites
- **Java 21**
- **Maven**
- **Node.js 18+**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Bharath80988/OnyxDB.git
   cd OnyxDB
   ```

2. **Start the OnyxDB Engine (API):**
   ```bash
   cd onyxdb-api
   mvn spring-boot:run
   ```
   *The core engine will automatically initialize a local `onyx.db` file in your home directory.*

3. **Start the OnyxDB Dashboard (Frontend):**
   Open a new terminal window:
   ```bash
   cd onyxdb-dashboard
   npm install
   npm run dev
   ```

4. **Access the Dashboard:**
   Open `http://localhost:5173` in your browser. You will see the server status, memory pool stats, and the query console.

---

## Architecture

OnyxDB operates across three isolated modules:
- `onyxdb-core`: The pure Java 21 storage and execution engine. Contains the Page Manager, B+ Tree logic, and WAL.
- `onyxdb-api`: The Spring Boot management layer that exposes the REST API.
- `onyxdb-dashboard`: The React/Tailwind frontend for observability.
