# OnyxDB (v0.2.0)

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
   *The core engine will automatically initialize a local `onyx.db` structure in your home directory.*

3. **Start the OnyxDB Dashboard (Frontend):**
   Open a new terminal window:
   ```bash
   cd onyxdb-dashboard
   npm install
   npm run dev
   ```

4. **Access the Dashboard:**
   Open `http://localhost:5173` in your browser. 

## Supported Frameworks

OnyxDB natively supports standard JSON REST payloads, meaning it can be called from absolutely anywhere without heavy SDKs. The documentation includes drop-in templates for:
- **Java Spring Boot**
- **Python Django**
- **Python Flask**
- **Python FastAPI**
- **Node Express**
- **PHP**
- **Go (Fiber)**
- **Ruby on Rails**
- **ASP.NET Core**
- **Rust (Actix)**

## Embedding OnyxDB (Use in Your Own Java Project)

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

## Architecture

OnyxDB operates across three isolated modules:
- `onyxdb-core`: The pure Java 21 storage and execution engine. Contains the Page Manager, B+ Tree logic, and WAL.
- `onyxdb-api`: The Spring Boot management layer that exposes the REST API.
- `onyxdb-dashboard`: The React/Tailwind frontend for observability, featuring a Visual Query Builder and 10 dynamic themes.

## Status & Roadmap

To view our comprehensive implemented features list and upcoming roadmap items (like Write-Ahead Logging, Vector Search, and Raft Consensus), navigate to the `/status` page in the OnyxDB Dashboard or view the raw markdown files in `status/functionalities/`.
