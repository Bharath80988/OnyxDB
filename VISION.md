# OnyxDB - Future Vision & Architecture

OnyxDB is evolving from a simple local storage engine into a highly scalable, enterprise-grade, omni-channel database.

## 1. Omni-Channel Query Support (Unmatched Versatility)
Developers should be able to interact with OnyxDB however they feel most comfortable. We will support three parallel interfaces:
- **Terminal CLI (SQL):** A lightweight terminal client that accepts standard SQL strings (e.g., `SELECT * FROM users`), parses them into an AST, and executes them instantly.
- **Visual Node Builder (UI):** A React Flow/n8n style drag-and-drop interface in the dashboard. Non-technical users can drag functional nodes to visually construct query pipelines.
- **REST API (JSON):** The existing high-speed JSON payload interface for programmatic, machine-to-machine backend communication.

## 2. High-Performance Caching & Distributed Workers
- **Redis Integration:** Hot data and frequent queries will be automatically cached in a Redis layer, bypassing the B+ Tree disk reads entirely for maximum throughput.
- **Celery / Python Workers:** Heavy analytical queries, bulk imports, and background jobs will be offloaded to an asynchronous Python worker tier via Celery, freeing up the Java API to process incoming requests.

## 3. Deployment & CI/CD
- **Dockerization:** The Java engine, Spring API, and React Dashboard will be containerized into a single portable image.
- **GitHub Actions:** A secure CI/CD pipeline will automatically run tests, build the Docker images, and publish them to a container registry upon every merge to `main`.
- **SDKs:** Official `npm` and `pip` packages will be published to allow seamless integration into Node.js and Python projects.
