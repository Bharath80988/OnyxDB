package com.onyxdb.core.execution;

import com.onyxdb.core.index.BTreeManager;
import com.onyxdb.core.index.hnsw.HnswIndex;
import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.StorageManager;
import com.onyxdb.core.wal.WriteAheadLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Parses and executes structured JSON queries across multiple tables.
 */
public class ExecutionEngine {
    private static final Logger log = LoggerFactory.getLogger(ExecutionEngine.class);
    private final Path storageDir;
    private final ConcurrentHashMap<String, BTreeManager> tables = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, WriteAheadLog> wals = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, HnswIndex> vectorIndexes = new ConcurrentHashMap<>();

    public ExecutionEngine(Path storageDir) {
        this.storageDir = storageDir;
        log.info("ExecutionEngine initialized with storage directory: {}", storageDir);
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
                
                // Perform Crash Recovery
                List<byte[]> logs = wal.readAllLogs();
                if (!logs.isEmpty()) {
                    log.info("Recovering {} entries from WAL for table '{}'", logs.size(), name);
                    for (byte[] logEntry : logs) {
                        String entry = new String(logEntry, StandardCharsets.UTF_8);
                        String[] parts = entry.split(":", 2);
                        if (parts.length == 2) {
                            try {
                                int id = Integer.parseInt(parts[0]);
                                btree.insert(id, parts[1]);
                                
                                // Recover vector if it existed (simplistic string parse)
                                if (parts[1].contains("vector=")) {
                                    // Complex JSON parsing skipped for brevity in recovery
                                    log.debug("Skipped vector recovery for id {}", id);
                                }
                            } catch (Exception e) {
                                log.error("Failed to recover WAL entry: {}", entry, e);
                            }
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
            case "select":
                return executeSelect(db, queryNode);
            case "vector_search":
                return executeVectorSearch(table, db, queryNode);
            default:
                throw new UnsupportedOperationException("Action '" + action + "' is not supported.");
        }
    }

    private List<String> executeInsert(String tableName, BTreeManager db, Map<String, Object> queryNode) throws IOException {
        Map<String, Object> data = (Map<String, Object>) queryNode.get("data");
        if (data == null || !data.containsKey("id")) {
            throw new IllegalArgumentException("Insert data must contain an 'id'");
        }
        
        int id = (Integer) data.get("id");
        String value = data.toString(); // Serialize the rest of the map as a string
        
        // Write to WAL first for durability
        WriteAheadLog wal = wals.get(tableName);
        if (wal != null) {
            String walEntry = id + ":" + value;
            wal.append(walEntry.getBytes(StandardCharsets.UTF_8));
        }
        
        db.insert(id, value);
        
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
        
        log.info("Inserted record id {} successfully", id);
        return Collections.singletonList("Inserted 1 row.");
    }

    private List<String> executeSelect(BTreeManager db, Map<String, Object> queryNode) throws IOException {
        if (queryNode.containsKey("id")) {
            // Point lookup
            int id = (Integer) queryNode.get("id");
            String result = db.search(id);
            log.debug("Select point lookup for id {} returned {}", id, result != null ? "result" : "null");
            return result != null ? Collections.singletonList(result) : Collections.emptyList();
        } else {
            // Full table scan
            log.debug("Executing full table scan");
            return db.scanAll();
        }
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
}
