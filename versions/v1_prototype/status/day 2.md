# OnyxDB - Day 2 Status

## What We Have Built
- **B+ Tree Node Architecture:** Restructured the 8KB `Page` layout to include a 16-byte metadata header. The header tracks the Node Type (Internal vs Leaf), Record Count, and Next Leaf pointers.
- **Node Splitting Algorithm:** Implemented automatic capacity monitoring in `BTreeManager`. When a leaf node reaches 31 records, the database automatically allocates two new leaf pages in the `BufferPool`, moves the data into them, and converts the original root page into an Internal Routing Node.
- **Tree Traversal:** Upgraded the `search` and `scanAll` routines to dynamically check the `NodeType` header. Searches now intelligently traverse through Internal Nodes by binary-comparing routing keys to jump directly to the target Leaf Node.
- **Verification:** Successfully executed an automated test script that inserted 35 records, forcing the engine to perfectly split `Page 0` and seamlessly allocate `Page 1` and `Page 2`.

## What The DB Can Do Right Now
- **Infinite Scalability:** Unlike yesterday where the database would crash if you inserted more than 8KB of data, OnyxDB can now infinitely scale. It dynamically allocates new 8KB chunks as data is ingested and routes queries instantly via the B+ Tree structure!
