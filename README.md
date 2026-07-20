# OnyxDB (v2.1.0)

> **The Multi-Table Omni-Channel Database built on B+ Trees.**

OnyxDB is a lightning-fast, local-first database built from the ground up for the modern developer experience. Fully offline capable, natively concurrent, and hyper-visual by design.

Unlike traditional RDBMS systems that require heavy installations, background services, and complex configurations, OnyxDB runs entirely as an embedded JAR or standalone server. It speaks pure JSON over HTTP natively, allowing seamless integration with any modern backend framework.

## Why OnyxDB?

- **Embeddability & Offline-First:** Runs inside your Java process or locally without spinning up Docker containers or managing background services. Perfect for local dev environments.
- **Visual Transparency:** The out-of-the-box Dashboard visually shows you exactly what the B+ Tree, Buffer Pool, and Write-Ahead Log are doing in real-time.
- **Zero Configuration:** Click, start, and query. No `pg_hba.conf`, no user creation scripts, no socket configuration.
- **Multi-Table Dynamic Routing:** Automatically routes JSON payloads to independent B+ Trees on the fly.

## v0.2.0 Frontend Overhaul

The OnyxDB Dashboard has been completely rebuilt to provide a state-of-the-art developer experience:
- **10 Dynamic Themes:** Toggle between Light, Dark, Purple, Ocean, Forest, Sunset, Rose, Midnight, Coffee, and Mint instantly via DaisyUI CSS variables.
- **Visual Query Builder:** A React Flow node-based interface for drag-and-drop pipeline construction.
- **MongoDB-Style Scrollspy Docs:** Extensive documentation for 10 backend frameworks, all on a single scrollable page powered by **Lenis** smooth scrolling and **GSAP/Framer Motion** animations.
- **Open Source Transparency:** A dedicated `/status` page utilizing **Chart.js** to visualize GitHub commits, PRs, and community engagement.

## v2.1.0: Security, Durability, and AI Vector Search

- **Role-Based Access Control (RBAC)**: Secure your endpoints with API keys. OnyxDB now enforces `Authorization: Bearer <key>` headers to differentiate `ADMIN` and `READ_ONLY` access.
- **Write-Ahead Logging (WAL)**: Total data durability. Every insertion is immediately persisted to a robust append-only `.wal` log, ensuring 100% crash recovery and ACID-compliant durability for the B+ Tree.
- **HNSW Vector Search**: Native, zero-dependency AI embeddings storage. OnyxDB now natively performs Cosine Similarity comparisons to rapidly serve exact K-Nearest Neighbor (KNN) vector queries.

### How to use RBAC and Vector Search

**1. Secure Queries (RBAC):**
Pass a bearer token in your HTTP headers.
- **Admin** (Read/Write): `Authorization: Bearer admin-secret-key`
- **Read-Only** (Selects only, rejects Inserts): `Authorization: Bearer readonly-secret-key`

**2. Vector Search (AI Embeddings):**
Insert your AI-generated vectors as arrays in the `vector` payload key, and query them seamlessly using `action: "vector_search"` and providing a matching query vector to return the top `k` most mathematically similar items.

## Getting Started

You can run OnyxDB instantly from your terminal without downloading any source code!

### 1. Node.js (NPM)
If you have Node.js installed, you can launch the database globally:
```bash
npx onyxdb
```

### 2. Python (Pip)
If you are a Python developer, install it via Pip:
```bash
pip install onyxdb
onyxdb
```

### 3. Java (JitPack)
You can pull the pure Java engine (`onyxdb-core`) or the full API directly from GitHub into your project using **JitPack**.

**1. Add the JitPack repository to your `pom.xml`:**
```xml
<repositories>
    <repository>
        <id>jitpack.io</id>
        <url>https://jitpack.io</url>
    </repository>
</repositories>
```

**2. Add the OnyxDB dependency:**
```xml
<dependency>
    <groupId>com.github.Bharath80988</groupId>
    <artifactId>OnyxDB</artifactId>
    <version>v0.1.3</version>
</dependency>
```

### 4. Build from Source
If you want to modify the database:
```bash
git clone https://github.com/Bharath80988/OnyxDB.git
cd OnyxDB
mvn clean package -DskipTests
java -jar onyxdb-api/target/onyxdb-api-0.1.3.jar
```
*Note: OnyxDB now statically bundles the React dashboard directly inside the Java `.jar` file!*

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

## Architecture

OnyxDB operates across three isolated modules:
- `onyxdb-core`: The pure Java 21 storage and execution engine. Contains the Page Manager, B+ Tree logic, and WAL.
- `onyxdb-api`: The Spring Boot management layer that exposes the REST API.
- `onyxdb-dashboard`: The React/Tailwind frontend for observability, featuring a Visual Query Builder and 10 dynamic themes.

## Status & Roadmap

To view our comprehensive implemented features list and upcoming roadmap items, navigate to the `/status` page in the OnyxDB Dashboard or view the raw markdown files in `status/functionalities/`.

Upcoming Roadmap goals include fully ACID-compliant multi-table operations, `update`/`delete` actions, schema normalizations, and distributed Raft Consensus.
