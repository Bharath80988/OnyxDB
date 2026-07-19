# OnyxDB

> **A local-first, embeddable relational database with a modern developer experience.**

OnyxDB is a lightweight, high-performance relational database engine written in Java 21, wrapped in a Spring Boot API, and bundled with a beautiful React visualization dashboard.
Unlike traditional RDBMS systems that require heavy installations, background services, and complex configurations, OnyxDB runs entirely on your local machine with zero configuration. It is designed to be completely transparent—giving developers full visibility into the storage engine, memory buffers, and transaction logs.

## Why OnyxDB? (vs. MySQL & PostgreSQL)

MySQL and PostgreSQL are mature, battle-tested databases for production web servers. **OnyxDB is built for the developer experience.**
You should use OnyxDB when:
- **You need embeddability:** You want a database that runs inside your application process or locally without spinning up Docker containers or managing background services.
- **You want visual transparency:** OnyxDB comes with an out-of-the-box Dashboard that visually shows you exactly what the B+ Tree, Buffer Pool, and Write-Ahead Log are doing in real-time.
- **You want zero configuration:** Click, start, and query. No pg_hba.conf, no user creation scripts, no socket configuration.
- **You need an educational or testing environment:** OnyxDB's predictable internal architecture makes it perfect for understanding how databases actually work under the hood.

## Features

- Java NIO Storage Engine: Direct disk I/O using 8KB fixed-size pages.
- LRU Buffer Pool: Memory-efficient page caching to prevent unnecessary disk reads.
- Write-Ahead Log (WAL): ACID-compliant durability for crash recovery.
- JSON Structured Query API: Query your database via REST instead of strictly writing SQL strings.
- Onyx Dashboard: A built-in Vite + React visualization layer.

## Getting Started (Run Standalone)

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
   *The core engine will automatically initialize a local onyx.db file in your home directory.*

3. **Start the OnyxDB Dashboard (Frontend):**
   Open a new terminal window:
   ```bash
   cd onyxdb-dashboard
   npm install
   npm run dev
   ```

4. **Access the Dashboard:**
   Open http://localhost:5173 in your browser. You will see the server status, memory pool stats, and the query console.

## Embedding OnyxDB (Use in Your Own Java Project)

OnyxDB is designed to be an embeddable database, meaning you can run it entirely inside your own Java application without running it as a standalone server. 

You can pull the pure Java engine (`onyxdb-core`) directly from GitHub into your project using **JitPack**.

**1. Add the JitPack repository to your `pom.xml`:**
```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>
```

**2. Add the OnyxDB Core dependency:**
```xml
<dependency>
    <groupId>com.github.Bharath80988.OnyxDB</groupId>
    <artifactId>onyxdb-core</artifactId>
    <version>main-SNAPSHOT</version>
</dependency>
```

**3. Use it in your code:**
```java
import com.onyxdb.core.storage.StorageManager;
import com.onyxdb.core.index.BTreeManager;
import java.nio.file.Path;

public class MyApp {
    public static void main(String[] args) throws Exception {
        StorageManager storage = new StorageManager(Path.of("my-database.db"));
        BTreeManager db = new BTreeManager(storage);
        
        db.insert(1, "{\"name\": \"Satoshi\"}");
        System.out.println(db.search(1));
    }
}
```

## Query Syntax

OnyxDB uses a strict JSON structure for querying data via the API. You can execute these queries directly in the OnyxDB Dashboard Query Console.

### Insert Data
To insert a new record, specify the action as "insert" and provide the data payload. The data must include a unique integer "id".
```json
{
  "action": "insert",
  "data": {
    "id": 1,
    "name": "Satoshi Nakamoto",
    "role": "Admin"
  }
}
```

### Select Data
To retrieve a record, specify the action as "select" and provide the target "id".
```json
{
  "action": "select",
  "id": 1
}
```

## Architecture

OnyxDB operates across three isolated modules:
- onyxdb-core: The pure Java 21 storage and execution engine. Contains the Page Manager, B+ Tree logic, and WAL.
- onyxdb-api: The Spring Boot management layer that exposes the REST API.
- onyxdb-dashboard: The React/Tailwind frontend for observability.

## Roadmap (Upcoming Features)

OnyxDB is actively being developed. The following features are on the immediate roadmap:

- **Omni-Channel Queries:** We are building a visual node-based query builder (like n8n/React Flow) for the UI, and a Terminal CLI for executing raw SQL strings, running in parallel with the existing JSON API.
- **High-Performance Caching:** Integration with **Redis** to cache hot queries and bypass disk I/O.
- **Distributed Workers:** Utilizing **Python/Celery** background workers to process heavy analytical tasks asynchronously.
- **Containerization & CI/CD:** Packaging the ecosystem into a unified Docker image and securing deployments via **GitHub Actions**.
- **Client SDKs:** Official lightweight client libraries for `npm` (Node.js) and `pip` (Python) to make integration effortless.
