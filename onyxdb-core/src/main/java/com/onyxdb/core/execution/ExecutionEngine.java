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
 * Parses and executes structured JSON queries across multiple tables with support for
 * Primary B+ Trees, Secondary Indexing, AI Vector Search, and Foreign Key Schema Normalization.
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

    public SchemaManager getSchemaManager() {
        return schemaManager;
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

    public List<String> execute(Map<String, Object> queryNode) throws Exception {
        String action = (String) queryNode.get("action");
        String table = (String) queryNode.get("table");
        
        if (action == null) {
            throw new IllegalArgumentException("Query must contain an 'action' field");
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
}
