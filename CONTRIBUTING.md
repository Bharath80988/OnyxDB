# Contributing to OnyxDB

Thank you for your interest in contributing to **OnyxDB**! We welcome bug reports, feature requests, documentation improvements, and code contributions.

---

## 🚀 Quick Start for Development

### Prerequisites
* **Java Development Kit (JDK 17+)**
* **Apache Maven 3.8+**
* **Node.js (v20+ or v22+)**
* **Git**

### Clone & Build
```bash
# 1. Clone the repository
git clone https://github.com/Bharath80988/OnyxDB.git
cd OnyxDB

# 2. Build the Java backend and React dashboard
mvn clean package -DskipTests

# 3. Run the standalone server (REST :8080 & OWP :8081)
java -jar onyxdb-api/target/onyxdb-api-0.2.0.jar
```

---

## 🛠 How to Contribute

### 1. Good First Issues
If you are new to the codebase, check out issues labeled `good first issue` or `help wanted`.

Examples of great contributions:
* Adding new code examples in `examples/`
* Improving client SDK documentation
* Writing benchmarks in `benchmarks/`
* Adding automated unit tests in `onyxdb-core` or `onyxdb-api`

### 2. Pull Request Guidelines
1. **Fork the repo** and create a feature branch (`git checkout -b feature/my-feature`).
2. **Write clear commit messages**.
3. **Ensure all builds pass**:
   ```bash
   mvn clean test
   ```
4. **Submit a Pull Request** describing your changes and link any related issues.

---

## 🏛 Code Architecture Overview

* **`onyxdb-core/`**: Core Java storage engine (`MmapStorageManager`, `BTreeManager`, `HnswIndex`, `WriteAheadLog`).
* **`onyxdb-api/`**: Spring Boot REST API (`QueryController`), TCP socket server (`OnyxNativeSocketServer`), and JWT auth (`JwtTokenProvider`).
* **`onyxdb-dashboard/`**: React + Tailwind + Vite glassmorphism Web Studio IDE (`/studio`).

---

## 📜 Code Style

* **Java**: Standard Google Java Format.
* **JavaScript / React**: ES6+, clean component functions, 2-space indentation.
* **No hardcoded secrets or credentials** in source code.

Thank you for building the future of database infrastructure with OnyxDB!
