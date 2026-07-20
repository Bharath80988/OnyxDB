# Day 3 Status Update

## Completed Features
- **Visual Node Builder:** Integrated `reactflow` into the dashboard to allow non-technical users to build visual query pipelines.
- **Python SDK / Terminal CLI:** Created a Python SDK (`sdks/python/onyxdb.py`) to execute queries natively from the terminal.
- **Redis Caching:** Integrated Spring Boot Data Redis into the `QueryService` to cache frequent SELECT queries and bypass disk reads.
- **Dockerization:** Wrote a multi-stage `Dockerfile` to compile both the Node.js React dashboard and the Java 21 Spring Boot API into a single deployable container.
- **Orchestration:** Created `docker-compose.yml` to run OnyxDB alongside a Redis cache container and a Celery worker template.
- **CI/CD Automation:** Set up a GitHub Actions pipeline (`.github/workflows/ci.yml`) to automatically build and test the codebase on every push.
- **JitPack Documentation:** Added instructions in the `README.md` for Java developers to embed the pure `onyxdb-core` B+ Tree engine into their own applications.

## Next Steps
- Implement Python Celery workers for heavy asynchronous background jobs.
- Expand the Visual Node Builder with more complex node types (e.g., Joins, Aggregations).
- Optimize concurrent read/write locking using `ReentrantReadWriteLock` in the B+ Tree.
