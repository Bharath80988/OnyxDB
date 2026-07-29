# Day 7 Status Update

## Completed Features
- **B+ Tree Update & Delete Operations:** Implemented native `update(int id, String newData)` and `delete(int id)` operations in `BTreeManager.java`. Update overwrites records in place, while delete shifts remaining records in memory slots using `System.arraycopy` and decrements record counts.
- **Binary Search Acceleration Algorithm:** Optimized point lookups, updates, and deletes in leaf nodes by replacing sequential scanning with a binary search algorithm (`binarySearchLeaf`), bringing per-node operation times down to $O(\log N)$.
- **Write-Ahead Logging (WAL) Durability for Mutations:** Extended the append-only `.wal` persistence engine to append `UPDATE:<id>:<data>` and `DELETE:<id>` records. Updated crash recovery routines to replay mutative and destructive entries automatically upon database restart.
- **RBAC Endpoint Security Guard:** Secured `/api/query` REST endpoints so `READ_ONLY` Bearer tokens are prohibited from executing `"update"` or `"delete"` actions, returning HTTP `403 Forbidden`.
- **Query Cache Eviction:** Updated `QueryService` to execute `@CacheEvict(value = "queries", allEntries = true)` on any `insert`, `update`, or `delete` query, ensuring stale read cache hits are avoided.
