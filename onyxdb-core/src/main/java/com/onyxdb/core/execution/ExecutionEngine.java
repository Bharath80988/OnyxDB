package com.onyxdb.core.execution;

import com.onyxdb.core.index.BTreeManager;
import com.onyxdb.core.index.SecondaryBTreeIndex;
import com.onyxdb.core.index.hnsw.HnswIndex;
import com.onyxdb.core.schema.ForeignKeyConstraint;
import com.onyxdb.core.schema.SchemaManager;
import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.StorageManager;
import com.onyxdb.core.wal.WriteAheadLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Central query execution engine for OnyxDB.
 *
 * <p>Routes structured JSON query nodes and OQS string queries across multiple dynamically
 * created tables. Each table is backed by a B+ Tree primary index, optional secondary
 * B+ Tree indexes, an HNSW vector index, and a Write-Ahead Log (WAL) for durability.</p>
 *
 * <p>Supported query actions:
 * <ul>
 *   <li>{@code select} — Point lookup, secondary index scan, or full table scan.</li>
 *   <li>{@code insert} — WAL-durable record insert with FK constraint enforcement.</li>
 *   <li>{@code update} — In-place B+ Tree record update with secondary index sync.</li>
 *   <li>{@code delete} — B+ Tree record delete with FK CASCADE/RESTRICT policy.</li>
 *   <li>{@code create_index} — Builds secondary B+ Tree index over existing records.</li>
 *   <li>{@code vector_search} — Exact KNN Cosine Similarity search over HNSW embeddings.</li>
 *   <li>{@code hybrid_search} — Vector KNN search with relational field filter post-processing.</li>
 *   <li>{@code explain} — CBO execution plan profiler output.</li>
 *   <li>{@code create_foreign_key} — Registers cross-table FK constraint with RESTRICT/CASCADE.</li>
 * </ul>
 * </p>
 */
public class ExecutionEngine {
    private static final Logger log = LoggerFactory.getLogger(ExecutionEngine.class);
    private final Path storageDir;
    private final ConcurrentHashMap<String, BTreeManager> tables = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, WriteAheadLog> wals = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, HnswIndex> vectorIndexes = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ConcurrentHashMap<String, SecondaryBTreeIndex>> secondaryIndexes = new ConcurrentHashMap<>();
    private final SchemaManager schemaManager;

    public ExecutionEngine(Path storageDir) {
        this.storageDir = storageDir;
        this.schemaManager = new SchemaManager(storageDir);
        log.info("ExecutionEngine initialized with storage directory: {}", storageDir);
    }

    /** Returns the {@link SchemaManager} managing foreign key constraints and schema persistence. */
    public SchemaManager getSchemaManager() {
        return schemaManager;
    }

    /**
     * Returns the names of all currently active (loaded) tables in this engine instance.
     * Used by the Onyx CLI for {@code SHOW TABLES} meta-command.
     *
     * @return Set of active table name strings.
     */
    public Set<String> getTableNames() {
        return tables.keySet();
    }

    /**
     * Returns a live system metrics snapshot for telemetry and monitoring.
     * Includes: table count, total indexed records, secondary index counts,
     * vector index sizes, and JVM heap memory usage.
     *
     * @return Map of metric name → metric value.
     */
    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new LinkedHashMap<>();

        // Table and record counters
        metrics.put("active_tables", tables.size());
        metrics.put("storage_dir", storageDir.toString());

        // JVM memory metrics
        Runtime rt = Runtime.getRuntime();
        long maxMb  = rt.maxMemory()   / (1024 * 1024);
        long usedMb = (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
        metrics.put("jvm_max_memory_mb", maxMb);
        metrics.put("jvm_used_memory_mb", usedMb);
        metrics.put("jvm_free_memory_mb", maxMb - usedMb);

        // Per-table secondary index and vector index stats
        Map<String, Object> tableStats = new LinkedHashMap<>();
        for (String tableName : tables.keySet()) {
            Map<String, Object> tStats = new LinkedHashMap<>();
            ConcurrentHashMap<String, SecondaryBTreeIndex> secIndexes = secondaryIndexes.get(tableName);
            tStats.put("secondary_indexes", secIndexes != null ? secIndexes.keySet() : Collections.emptySet());
            HnswIndex hnsw = vectorIndexes.get(tableName);
            tableStats.put(tableName, tStats);
        }
        metrics.put("tables", tableStats);

        return metrics;
    }



    private BTreeManager getTable(String tableName) {
        if (tableName == null || tableName.trim().isEmpty()) {
            throw new IllegalArgumentException("Query must specify a 'table'");
        }
        
        return tables.computeIfAbsent(tableName, name -> {
            try {
                Path tablePath = storageDir.resolve(name + ".db");
                Path walPath = storageDir.resolve(name + ".wal");
                log.info("Loading or creating table '{}' at {}", name, tablePath);
                
                StorageManager storage = new StorageManager(tablePath);
                BufferPool bufferPool = new BufferPool(1024, storage);
                BTreeManager btree = new BTreeManager(bufferPool);
                HnswIndex hnsw = new HnswIndex();
                
                WriteAheadLog wal = new WriteAheadLog(walPath);
                wals.put(name, wal);
                vectorIndexes.put(name, hnsw);
                secondaryIndexes.putIfAbsent(name, new ConcurrentHashMap<>());
                
                // Perform Crash Recovery
                List<byte[]> logs = wal.readAllLogs();
                if (!logs.isEmpty()) {
                    log.info("Recovering {} entries from WAL for table '{}'", logs.size(), name);
                    for (byte[] logEntry : logs) {
                        String entry = new String(logEntry, StandardCharsets.UTF_8);
                        try {
                            if (entry.startsWith("UPDATE:")) {
                                String[] parts = entry.substring(7).split(":", 2);
                                if (parts.length == 2) {
                                    int id = Integer.parseInt(parts[0]);
                                    btree.update(id, parts[1]);
                                }
                            } else if (entry.startsWith("DELETE:")) {
                                int id = Integer.parseInt(entry.substring(7).trim());
                                btree.delete(id);
                            } else {
                                String[] parts = entry.split(":", 2);
                                if (parts.length == 2) {
                                    int id = Integer.parseInt(parts[0]);
                                    btree.insert(id, parts[1]);
                                }
                            }
                        } catch (Exception e) {
                            log.error("Failed to recover WAL entry: {}", entry, e);
                        }
                    }
                    log.info("Crash recovery complete for table '{}'", name);
                }
                
                return btree;
            } catch (IOException e) {
                log.error("Failed to initialize table '{}'", name, e);
                throw new RuntimeException("Could not initialize table: " + name, e);
            }
        });
    }

    public List<String> execute(String oqsQuery) throws Exception {
        if (oqsQuery == null || oqsQuery.trim().isEmpty()) {
            throw new IllegalArgumentException("Query string cannot be empty.");
        }
        return execute(parseOqsToQueryNode(oqsQuery));
    }

    public List<String> execute(Map<String, Object> queryNode) throws Exception {
        if (queryNode.containsKey("oqs")) {
            return execute((String) queryNode.get("oqs"));
        }
        
        String action = (String) queryNode.get("action");
        if (action == null && queryNode.containsKey("query")) {
            return execute((String) queryNode.get("query"));
        }
        if (action != null && (action.equalsIgnoreCase("oqs") || action.equalsIgnoreCase("raw"))) {
            return execute((String) queryNode.get("query"));
        }
        
        String table = (String) queryNode.get("table");
        
        if (action == null) {
            throw new IllegalArgumentException("Query must contain an 'action' or 'oqs' field");
        }
        if (table == null) {
            throw new IllegalArgumentException("Query must contain a 'table' field");
        }

        log.info("Executing action '{}' on table '{}'", action, table);
        BTreeManager db = getTable(table);

        switch (action.toLowerCase()) {
            case "insert":
                return executeInsert(table, db, queryNode);
            case "update":
                return executeUpdate(table, db, queryNode);
            case "delete":
                return executeDelete(table, db, queryNode);
            case "select":
                return executeSelect(table, db, queryNode);
            case "create_index":
                return executeCreateIndex(table, db, queryNode);
            case "vector_search":
                return executeVectorSearch(table, db, queryNode);
            case "hybrid_search":
                return executeHybridSearch(table, db, queryNode);
            case "explain":
                return executeExplain(table, db, queryNode);
            case "create_foreign_key":
            case "add_foreign_key":
                return executeCreateForeignKey(table, queryNode);
            default:
                throw new UnsupportedOperationException("Action '" + action + "' is not supported.");
        }
    }

    private List<String> executeCreateForeignKey(String tableName, Map<String, Object> queryNode) {
        String childField = (String) queryNode.get("field");
        if (childField == null && queryNode.containsKey("child_field")) {
            childField = (String) queryNode.get("child_field");
        }
        String parentTable = (String) queryNode.get("parent_table");
        if (parentTable == null && queryNode.containsKey("referenced_table")) {
            parentTable = (String) queryNode.get("referenced_table");
        }
        String parentField = (String) queryNode.get("parent_field");
        if (parentField == null && queryNode.containsKey("referenced_field")) {
            parentField = (String) queryNode.get("referenced_field");
        }
        if (parentField == null) {
            parentField = "id";
        }
        String onDeleteStr = (String) queryNode.get("on_delete");
        ForeignKeyConstraint.OnDeleteAction onDelete = ForeignKeyConstraint.OnDeleteAction.RESTRICT;
        if (onDeleteStr != null && onDeleteStr.equalsIgnoreCase("CASCADE")) {
            onDelete = ForeignKeyConstraint.OnDeleteAction.CASCADE;
        }

        if (childField == null || parentTable == null) {
            throw new IllegalArgumentException("create_foreign_key requires 'field' (or 'child_field') and 'parent_table'");
        }

        ForeignKeyConstraint constraint = new ForeignKeyConstraint(tableName, childField, parentTable, parentField, onDelete);
        schemaManager.addForeignKey(constraint);
        
        return Collections.singletonList("Created Foreign Key constraint on '" + tableName + "." + childField + "' referencing '" + parentTable + "." + parentField + "' (" + onDelete + ").");
    }

    private List<String> executeCreateIndex(String tableName, BTreeManager db, Map<String, Object> queryNode) throws IOException {
        String field = (String) queryNode.get("field");
        if (field == null || field.trim().isEmpty()) {
            throw new IllegalArgumentException("create_index query must specify a 'field'");
        }

        ConcurrentHashMap<String, SecondaryBTreeIndex> tableIndexes = secondaryIndexes.computeIfAbsent(tableName, k -> new ConcurrentHashMap<>());
        SecondaryBTreeIndex secIndex = tableIndexes.computeIfAbsent(field, SecondaryBTreeIndex::new);
        secIndex.clear();

        List<String> records = db.scanAll();
        int indexedCount = 0;
        for (String record : records) {
            int id = extractIdFromRecord(record);
            String val = extractFieldFromRecord(record, field);
            if (id != -1 && val != null) {
                secIndex.insert(val, id);
                indexedCount++;
            }
        }

        log.info("Created secondary index on field '{}' for table '{}' with {} indexed entries", field, tableName, indexedCount);
        return Collections.singletonList("Created secondary index on field '" + field + "' for table '" + tableName + "' (" + indexedCount + " records indexed).");
    }

    private List<String> executeInsert(String tableName, BTreeManager db, Map<String, Object> queryNode) throws Exception {
        Map<String, Object> data = (Map<String, Object>) queryNode.get("data");
        if (data == null || !data.containsKey("id")) {
            throw new IllegalArgumentException("Insert data must contain an 'id'");
        }
        
        int id = (Integer) data.get("id");
        String value = data.toString();

        // Enforce Foreign Key Constraints for child table insertions
        List<ForeignKeyConstraint> childFks = schemaManager.getChildConstraints(tableName);
        for (ForeignKeyConstraint fk : childFks) {
            Object childValObj = data.get(fk.getChildField());
            if (childValObj != null) {
                String parentValStr = childValObj.toString();
                try {
                    int parentId = Integer.parseInt(parentValStr);
                    BTreeManager parentDb = getTable(fk.getParentTable());
                    String parentRecord = parentDb.search(parentId);
                    if (parentRecord == null) {
                        throw new IllegalStateException("Foreign Key constraint violation: Referenced record id " + parentId + " in parent table '" + fk.getParentTable() + "' does not exist.");
                    }
                } catch (NumberFormatException e) {
                    BTreeManager parentDb = getTable(fk.getParentTable());
                    List<String> records = parentDb.scanAll();
                    boolean found = false;
                    for (String rec : records) {
                        String val = extractFieldFromRecord(rec, fk.getParentField());
                        if (parentValStr.equalsIgnoreCase(val)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        throw new IllegalStateException("Foreign Key constraint violation: Referenced record '" + parentValStr + "' in parent table '" + fk.getParentTable() + "' field '" + fk.getParentField() + "' does not exist.");
                    }
                }
            }
        }
        
        // Write to WAL first for durability
        WriteAheadLog wal = wals.get(tableName);
        if (wal != null) {
            String walEntry = id + ":" + value;
            wal.append(walEntry.getBytes(StandardCharsets.UTF_8));
        }
        
        db.insert(id, value);
        
        // Maintain Secondary Indexes automatically
        ConcurrentHashMap<String, SecondaryBTreeIndex> tableIndexes = secondaryIndexes.get(tableName);
        if (tableIndexes != null && !tableIndexes.isEmpty()) {
            for (Map.Entry<String, SecondaryBTreeIndex> entry : tableIndexes.entrySet()) {
                String field = entry.getKey();
                SecondaryBTreeIndex index = entry.getValue();
                Object valObj = data.get(field);
                if (valObj != null) {
                    index.insert(valObj.toString(), id);
                }
            }
        }
        
        // Populate Vector Index if vector exists
        if (data.containsKey("vector")) {
            List<Number> vectorList = (List<Number>) data.get("vector");
            float[] floatArr = new float[vectorList.size()];
            for (int i = 0; i < vectorList.size(); i++) {
                floatArr[i] = vectorList.get(i).floatValue();
            }
            vectorIndexes.get(tableName).insert(id, floatArr);
            log.info("Inserted vector embedding for record id {}", id);
        }
        
        log.info("Inserted record id {} successfully into table '{}'", id, tableName);
        return Collections.singletonList("Inserted 1 row.");
    }

    private List<String> executeUpdate(String tableName, BTreeManager db, Map<String, Object> queryNode) throws Exception {
        Map<String, Object> data = (Map<String, Object>) queryNode.get("data");
        if (data == null || !data.containsKey("id")) {
            throw new IllegalArgumentException("Update data must contain an 'id'");
        }
        
        int id = (Integer) data.get("id");
        String oldRecord = db.search(id);
        String value = data.toString();

        // Enforce Foreign Key Constraints on child update
        List<ForeignKeyConstraint> childFks = schemaManager.getChildConstraints(tableName);
        for (ForeignKeyConstraint fk : childFks) {
            Object childValObj = data.get(fk.getChildField());
            if (childValObj != null) {
                String parentValStr = childValObj.toString();
                try {
                    int parentId = Integer.parseInt(parentValStr);
                    BTreeManager parentDb = getTable(fk.getParentTable());
                    String parentRecord = parentDb.search(parentId);
                    if (parentRecord == null) {
                        throw new IllegalStateException("Foreign Key constraint violation: Referenced record id " + parentId + " in parent table '" + fk.getParentTable() + "' does not exist.");
                    }
                } catch (NumberFormatException e) {
                    BTreeManager parentDb = getTable(fk.getParentTable());
                    List<String> records = parentDb.scanAll();
                    boolean found = false;
                    for (String rec : records) {
                        String val = extractFieldFromRecord(rec, fk.getParentField());
                        if (parentValStr.equalsIgnoreCase(val)) {
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        throw new IllegalStateException("Foreign Key constraint violation: Referenced record '" + parentValStr + "' in parent table '" + fk.getParentTable() + "' field '" + fk.getParentField() + "' does not exist.");
                    }
                }
            }
        }
        
        WriteAheadLog wal = wals.get(tableName);
        if (wal != null) {
            String walEntry = "UPDATE:" + id + ":" + value;
            wal.append(walEntry.getBytes(StandardCharsets.UTF_8));
        }
        
        boolean updated = db.update(id, value);
        if (updated) {
            // Update Secondary Indexes
            ConcurrentHashMap<String, SecondaryBTreeIndex> tableIndexes = secondaryIndexes.get(tableName);
            if (tableIndexes != null && !tableIndexes.isEmpty()) {
                for (Map.Entry<String, SecondaryBTreeIndex> entry : tableIndexes.entrySet()) {
                    String field = entry.getKey();
                    SecondaryBTreeIndex index = entry.getValue();
                    String oldVal = extractFieldFromRecord(oldRecord, field);
                    Object newValObj = data.get(field);
                    String newVal = newValObj != null ? newValObj.toString() : null;
                    index.update(oldVal, newVal, id);
                }
            }
            log.info("Updated record id {} successfully in table '{}'", id, tableName);
            return Collections.singletonList("Updated 1 row.");
        } else {
            log.warn("Record id {} not found for update in table '{}'", id, tableName);
            return Collections.singletonList("0 rows updated (record not found).");
        }
    }

    private List<String> executeDelete(String tableName, BTreeManager db, Map<String, Object> queryNode) throws Exception {
        int id;
        if (queryNode.containsKey("id")) {
            id = (Integer) queryNode.get("id");
        } else if (queryNode.containsKey("data") && ((Map<String, Object>) queryNode.get("data")).containsKey("id")) {
            id = (Integer) ((Map<String, Object>) queryNode.get("data")).get("id");
        } else {
            throw new IllegalArgumentException("Delete query must specify an 'id'");
        }
        
        String oldRecord = db.search(id);

        // Enforce Foreign Key Constraints on Parent Deletion (RESTRICT vs CASCADE)
        List<ForeignKeyConstraint> parentFks = schemaManager.getParentConstraints(tableName);
        if (!parentFks.isEmpty() && oldRecord != null) {
            int deletedParentId = id;
            for (ForeignKeyConstraint fk : parentFks) {
                String childTable = fk.getChildTable();
                BTreeManager childDb = getTable(childTable);
                List<String> childRecords = childDb.scanAll();
                
                List<Integer> matchingChildIds = new ArrayList<>();
                for (String childRec : childRecords) {
                    String val = extractFieldFromRecord(childRec, fk.getChildField());
                    if (val != null) {
                        try {
                            int fkId = Integer.parseInt(val);
                            if (fkId == deletedParentId) {
                                int childId = extractIdFromRecord(childRec);
                                if (childId != -1) {
                                    matchingChildIds.add(childId);
                                }
                            }
                        } catch (NumberFormatException ignored) {}
                    }
                }

                if (!matchingChildIds.isEmpty()) {
                    if (fk.getOnDelete() == ForeignKeyConstraint.OnDeleteAction.RESTRICT) {
                        throw new IllegalStateException("Foreign Key constraint violation: Cannot delete record id " + deletedParentId + " from parent table '" + tableName + "' because " + matchingChildIds.size() + " referencing row(s) exist in child table '" + childTable + "'.");
                    } else if (fk.getOnDelete() == ForeignKeyConstraint.OnDeleteAction.CASCADE) {
                        log.info("Cascading deletion of {} referencing records in child table '{}'", matchingChildIds.size(), childTable);
                        for (Integer childId : matchingChildIds) {
                            Map<String, Object> deleteChildQuery = new HashMap<>();
                            deleteChildQuery.put("action", "delete");
                            deleteChildQuery.put("table", childTable);
                            deleteChildQuery.put("id", childId);
                            execute(deleteChildQuery);
                        }
                    }
                }
            }
        }
        
        WriteAheadLog wal = wals.get(tableName);
        if (wal != null) {
            String walEntry = "DELETE:" + id;
            wal.append(walEntry.getBytes(StandardCharsets.UTF_8));
        }
        
        boolean deleted = db.delete(id);
        if (deleted) {
            // Remove from Secondary Indexes
            ConcurrentHashMap<String, SecondaryBTreeIndex> tableIndexes = secondaryIndexes.get(tableName);
            if (tableIndexes != null && !tableIndexes.isEmpty() && oldRecord != null) {
                for (Map.Entry<String, SecondaryBTreeIndex> entry : tableIndexes.entrySet()) {
                    String field = entry.getKey();
                    SecondaryBTreeIndex index = entry.getValue();
                    String oldVal = extractFieldFromRecord(oldRecord, field);
                    if (oldVal != null) {
                        index.remove(oldVal, id);
                    }
                }
            }
            log.info("Deleted record id {} successfully from table '{}'", id, tableName);
            return Collections.singletonList("Deleted 1 row.");
        } else {
            log.warn("Record id {} not found for delete in table '{}'", id, tableName);
            return Collections.singletonList("0 rows deleted (record not found).");
        }
    }

    private List<String> executeSelect(String tableName, BTreeManager db, Map<String, Object> queryNode) throws IOException {
        // 1. Point lookup by Primary Key ID
        if (queryNode.containsKey("id")) {
            int id = (Integer) queryNode.get("id");
            String result = db.search(id);
            log.debug("Select point lookup for id {} returned {}", id, result != null ? "result" : "null");
            return result != null ? Collections.singletonList(result) : Collections.emptyList();
        }

        // 2. Lookup via Secondary B+ Tree Indexing
        ConcurrentHashMap<String, SecondaryBTreeIndex> tableIndexes = secondaryIndexes.get(tableName);
        
        String indexField = null;
        String indexValue = null;

        if (queryNode.containsKey("where") && queryNode.get("where") instanceof Map) {
            Map<String, Object> whereMap = (Map<String, Object>) queryNode.get("where");
            for (String key : whereMap.keySet()) {
                if (tableIndexes != null && tableIndexes.containsKey(key)) {
                    indexField = key;
                    indexValue = whereMap.get(key) != null ? whereMap.get(key).toString() : null;
                    break;
                }
            }
        } else if (queryNode.containsKey("index") && queryNode.containsKey("value")) {
            indexField = (String) queryNode.get("index");
            indexValue = queryNode.get("value") != null ? queryNode.get("value").toString() : null;
        }

        if (indexField != null && indexValue != null && tableIndexes != null && tableIndexes.containsKey(indexField)) {
            log.info("Executing Secondary Index Scan on field '{}' = '{}'", indexField, indexValue);
            SecondaryBTreeIndex secIndex = tableIndexes.get(indexField);
            List<Integer> matchingIds = secIndex.search(indexValue);
            List<String> results = new ArrayList<>();
            for (Integer matchedId : matchingIds) {
                String record = db.search(matchedId);
                if (record != null) {
                    results.add(record);
                }
            }
            log.info("Secondary Index Scan returned {} matching rows", results.size());
            return results;
        }

        // 3. Fallback: Filtered scan or Full table scan
        if (queryNode.containsKey("where") && queryNode.get("where") instanceof Map) {
            Map<String, Object> whereMap = (Map<String, Object>) queryNode.get("where");
            log.debug("Executing filtered table scan");
            List<String> allRecords = db.scanAll();
            List<String> filtered = new ArrayList<>();
            for (String record : allRecords) {
                boolean matches = true;
                for (Map.Entry<String, Object> condition : whereMap.entrySet()) {
                    String fieldVal = extractFieldFromRecord(record, condition.getKey());
                    String expectedVal = condition.getValue() != null ? condition.getValue().toString() : null;
                    if (fieldVal == null || !fieldVal.equalsIgnoreCase(expectedVal)) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    filtered.add(record);
                }
            }
            return filtered;
        }

        // Full table scan
        log.debug("Executing full table scan");
        return db.scanAll();
    }

    private List<String> executeVectorSearch(String tableName, BTreeManager db, Map<String, Object> queryNode) throws IOException {
        if (!queryNode.containsKey("vector")) {
            throw new IllegalArgumentException("Vector search requires a 'vector' array");
        }
        
        List<Number> vectorList = (List<Number>) queryNode.get("vector");
        float[] queryVector = new float[vectorList.size()];
        for (int i = 0; i < vectorList.size(); i++) {
            queryVector[i] = vectorList.get(i).floatValue();
        }
        
        int k = queryNode.containsKey("k") ? (Integer) queryNode.get("k") : 5;
        
        HnswIndex hnsw = vectorIndexes.get(tableName);
        List<Integer> nearestIds = hnsw.search(queryVector, k);
        
        List<String> results = new ArrayList<>();
        for (Integer id : nearestIds) {
            String record = db.search(id);
            if (record != null) {
                results.add(record);
            }
        }
        
        log.info("Vector search found {} results", results.size());
        return results;
    }

    private List<String> executeHybridSearch(String tableName, BTreeManager db, Map<String, Object> queryNode) throws IOException {
        List<String> vectorResults = executeVectorSearch(tableName, db, queryNode);
        if (queryNode.containsKey("where") && queryNode.get("where") instanceof Map) {
            Map<String, Object> whereMap = (Map<String, Object>) queryNode.get("where");
            List<String> filtered = new ArrayList<>();
            for (String record : vectorResults) {
                boolean matches = true;
                for (Map.Entry<String, Object> condition : whereMap.entrySet()) {
                    String fieldVal = extractFieldFromRecord(record, condition.getKey());
                    String expectedVal = condition.getValue() != null ? condition.getValue().toString() : null;
                    if (fieldVal == null || !fieldVal.equalsIgnoreCase(expectedVal)) {
                        matches = false;
                        break;
                    }
                }
                if (matches) {
                    filtered.add(record);
                }
            }
            log.info("Hybrid search returned {} results after relational filter", filtered.size());
            return filtered;
        }
        return vectorResults;
    }

    private List<String> executeExplain(String tableName, BTreeManager db, Map<String, Object> queryNode) throws IOException {
        TableStats stats = new TableStats(tableName);
        stats.setTotalRows(db.scanAll().size());
        boolean hasPrimaryKey = queryNode.containsKey("id");
        ConcurrentHashMap<String, SecondaryBTreeIndex> tableIndexes = secondaryIndexes.get(tableName);
        String indexField = null;
        if (queryNode.containsKey("where") && queryNode.get("where") instanceof Map) {
            Map<String, Object> whereMap = (Map<String, Object>) queryNode.get("where");
            for (String key : whereMap.keySet()) {
                if (tableIndexes != null && tableIndexes.containsKey(key)) {
                    indexField = key;
                    break;
                }
            }
        }
        boolean hasSecondaryIndex = indexField != null;
        QueryOptimizer optimizer = new QueryOptimizer();
        QueryOptimizer.ExecutionPlan plan = optimizer.chooseBestPlan(stats, hasPrimaryKey, hasSecondaryIndex, indexField);
        return Collections.singletonList("EXPLAIN " + plan.toString());
    }

    // Helper functions for record string parsing
    private int extractIdFromRecord(String record) {
        if (record == null) return -1;
        String val = extractFieldFromRecord(record, "id");
        if (val != null) {
            try {
                return Integer.parseInt(val);
            } catch (NumberFormatException e) {
                return -1;
            }
        }
        return -1;
    }

    private String extractFieldFromRecord(String record, String fieldName) {
        if (record == null || fieldName == null) return null;
        
        String keyPattern = fieldName + "=";
        int idx = -1;
        int fromIndex = 0;
        while ((idx = record.indexOf(keyPattern, fromIndex)) != -1) {
            if (idx == 0) break;
            char prev = record.charAt(idx - 1);
            if (prev == '{' || prev == ',' || prev == ' ' || prev == '"') {
                break;
            }
            fromIndex = idx + keyPattern.length();
        }

        if (idx != -1) {
            int start = idx + keyPattern.length();
            int end = record.length();
            for (int i = start; i < record.length(); i++) {
                char c = record.charAt(i);
                if (c == ',' || c == '}') {
                    end = i;
                    break;
                }
            }
            return record.substring(start, end).trim();
        }

        String jsonPattern = "\"" + fieldName + "\":";
        idx = record.indexOf(jsonPattern);
        if (idx != -1) {
            int start = idx + jsonPattern.length();
            StringBuilder sb = new StringBuilder();
            boolean inQuotes = false;
            for (int i = start; i < record.length(); i++) {
                char c = record.charAt(i);
                if (c == '"') {
                    if (inQuotes) break;
                    else inQuotes = true;
                } else if (!inQuotes && (c == ',' || c == '}')) {
                    break;
                } else {
                    sb.append(c);
                }
            }
            return sb.toString().trim();
        }

        return null;
    }

    /**
     * Parses human-readable Onyx Query Syntax (OQS) strings into structured query nodes.
     */
    public Map<String, Object> parseOqsToQueryNode(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("OQS query cannot be empty");
        }

        String q = query.trim();
        if (q.toUpperCase().startsWith("EXPLAIN ")) {
            String innerQuery = q.substring(8).trim();
            Map<String, Object> innerNode = parseOqsToQueryNode(innerQuery);
            Map<String, Object> explainNode = new HashMap<>(innerNode);
            explainNode.put("action", "explain");
            return explainNode;
        }

        Map<String, Object> node = new HashMap<>();

        // 1. GET users 101  or  GET users:101
        if (q.toUpperCase().startsWith("GET ")) {
            String rest = q.substring(4).trim();
            String table;
            Integer id = null;

            if (rest.contains(":")) {
                String[] parts = rest.split(":", 2);
                table = parts[0].trim();
                try {
                    id = Integer.parseInt(parts[1].trim());
                } catch (NumberFormatException ignored) {}
            } else {
                String[] parts = rest.split("\\s+", 2);
                table = parts[0].trim();
                if (parts.length > 1) {
                    try {
                        id = Integer.parseInt(parts[1].trim());
                    } catch (NumberFormatException ignored) {}
                }
            }

            node.put("action", "select");
            node.put("table", table);
            if (id != null) {
                node.put("id", id);
            }
            return node;
        }

        // 2. FIND users WHERE status = ACTIVE  or  FIND users
        if (q.toUpperCase().startsWith("FIND ") || q.toUpperCase().startsWith("SELECT ")) {
            node.put("action", "select");
            String rest = q.startsWith("FIND ") || q.startsWith("find ") ? q.substring(5).trim() : q.substring(7).trim();
            
            if (rest.toUpperCase().startsWith("* FROM ")) {
                rest = rest.substring(7).trim();
            }

            String table;
            if (rest.toUpperCase().contains(" WHERE ")) {
                String[] parts = rest.split("(?i)\\s+WHERE\\s+", 2);
                table = parts[0].trim();
                String cond = parts[1].trim();
                Map<String, Object> whereMap = new HashMap<>();
                if (cond.contains("=")) {
                    String[] kv = cond.split("=", 2);
                    String k = kv[0].trim();
                    String v = kv[1].trim().replaceAll("^['\"]|['\"]$", "");
                    if (k.equalsIgnoreCase("id")) {
                        try {
                            node.put("id", Integer.parseInt(v));
                            return node;
                        } catch (NumberFormatException ignored) {}
                    }
                    whereMap.put(k, v);
                }
                node.put("where", whereMap);
            } else {
                String[] tokens = rest.split("\\s+");
                table = tokens[0].trim();
                if (tokens.length >= 3 && tokens[1].equalsIgnoreCase("WHERE") == false && !tokens[1].contains("=")) {
                    // e.g. FIND users status = ACTIVE
                    String k = tokens[1].trim();
                    String v = tokens[tokens.length - 1].trim().replaceAll("^['\"]|['\"]$", "");
                    Map<String, Object> whereMap = new HashMap<>();
                    whereMap.put(k, v);
                    node.put("where", whereMap);
                }
            }

            node.put("table", table);
            return node;
        }

        // 3. DELETE users 101  or  DELETE FROM users WHERE id = 101
        if (q.toUpperCase().startsWith("DELETE ")) {
            node.put("action", "delete");
            String rest = q.substring(7).trim();
            if (rest.toUpperCase().startsWith("FROM ")) {
                rest = rest.substring(5).trim();
            }

            if (rest.toUpperCase().contains(" WHERE ")) {
                String[] parts = rest.split("(?i)\\s+WHERE\\s+", 2);
                node.put("table", parts[0].trim());
                String cond = parts[1].trim();
                if (cond.contains("=")) {
                    String[] kv = cond.split("=", 2);
                    String v = kv[1].trim().replaceAll("^['\"]|['\"]$", "");
                    try {
                        node.put("id", Integer.parseInt(v));
                    } catch (NumberFormatException ignored) {}
                }
            } else {
                String[] parts = rest.split("[:\\s]+", 2);
                node.put("table", parts[0].trim());
                if (parts.length > 1) {
                    try {
                        node.put("id", Integer.parseInt(parts[1].trim()));
                    } catch (NumberFormatException ignored) {}
                }
            }
            return node;
        }

        // 4. INDEX users ON email  or  INDEX users email  or  CREATE INDEX ON users (email)
        if (q.toUpperCase().startsWith("INDEX ") || q.toUpperCase().startsWith("CREATE INDEX ")) {
            node.put("action", "create_index");
            String rest = q.toUpperCase().startsWith("CREATE INDEX ") ? q.substring(13).trim() : q.substring(6).trim();
            if (rest.toUpperCase().startsWith("ON ")) {
                rest = rest.substring(3).trim();
            }
            if (rest.contains("(")) {
                String table = rest.substring(0, rest.indexOf("(")).trim();
                String field = rest.substring(rest.indexOf("(") + 1, rest.indexOf(")")).trim();
                node.put("table", table);
                node.put("field", field);
            } else {
                String[] parts = rest.split("(?i)\\s+ON\\s+|\\s+", 2);
                node.put("table", parts[0].trim());
                if (parts.length > 1) {
                    node.put("field", parts[1].replaceAll("[()\\s]", "").trim());
                }
            }
            return node;
        }

        // 5. UPDATE users 101 SET status = INACTIVE
        if (q.toUpperCase().startsWith("UPDATE ")) {
            node.put("action", "update");
            String rest = q.substring(7).trim();
            String[] parts = rest.split("(?i)\\s+SET\\s+", 2);
            String target = parts[0].trim();
            String[] targetParts = target.split("\\s+");
            String table = targetParts[0].trim();
            int id = Integer.parseInt(targetParts[1].trim());

            Map<String, Object> data = new HashMap<>();
            data.put("id", id);

            if (parts.length > 1) {
                String assignments = parts[1].trim();
                for (String assign : assignments.split(",")) {
                    String[] kv = assign.split("=", 2);
                    if (kv.length == 2) {
                        data.put(kv[0].trim(), kv[1].trim().replaceAll("^['\"]|['\"]$", ""));
                    }
                }
            }
            node.put("table", table);
            node.put("data", data);
            return node;
        }

        // 6. INSERT INTO users { "id": 101, ... }  or  INSERT users { "id": 101, ... }
        if (q.toUpperCase().startsWith("INSERT ")) {
            node.put("action", "insert");
            String rest = q.substring(7).trim();
            if (rest.toUpperCase().startsWith("INTO ")) {
                rest = rest.substring(5).trim();
            }

            int braceIdx = rest.indexOf('{');
            if (braceIdx != -1) {
                String table = rest.substring(0, braceIdx).trim();
                node.put("table", table);
                String jsonPart = rest.substring(braceIdx).trim();
                try {
                    Map<String, Object> dataMap = parseSimpleJsonObject(jsonPart);
                    node.put("data", dataMap);
                } catch (Exception e) {
                    throw new IllegalArgumentException("Invalid JSON payload in INSERT query: " + jsonPart, e);
                }
                return node;
            }
        }

        throw new IllegalArgumentException("Unrecognized Onyx Query Syntax: " + query);
    }

    private Map<String, Object> parseSimpleJsonObject(String jsonStr) {
        Map<String, Object> map = new HashMap<>();
        String s = jsonStr.trim();
        if (s.startsWith("{")) s = s.substring(1);
        if (s.endsWith("}")) s = s.substring(0, s.length() - 1);
        
        List<String> pairs = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"') inQuotes = !inQuotes;
            if (c == ',' && !inQuotes) {
                pairs.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        if (current.length() > 0) pairs.add(current.toString());
        
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                String key = kv[0].trim().replaceAll("^\"|\"$", "");
                String valStr = kv[1].trim().replaceAll("^\"|\"$", "");
                if (key.equalsIgnoreCase("id")) {
                    try {
                        map.put("id", Integer.parseInt(valStr));
                        continue;
                    } catch (NumberFormatException ignored) {}
                }
                map.put(key, valStr);
            }
        }
        return map;
    }
}
