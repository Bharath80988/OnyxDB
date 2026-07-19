package com.onyxdb.core.execution;

import com.onyxdb.core.index.BTreeManager;
import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.StorageManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.Path;
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
                log.info("Loading or creating table '{}' at {}", name, tablePath);
                StorageManager storage = new StorageManager(tablePath);
                BufferPool bufferPool = new BufferPool(1024, storage);
                return new BTreeManager(bufferPool);
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
                return executeInsert(db, queryNode);
            case "select":
                return executeSelect(db, queryNode);
            default:
                throw new UnsupportedOperationException("Action '" + action + "' is not supported.");
        }
    }

    private List<String> executeInsert(BTreeManager db, Map<String, Object> queryNode) throws IOException {
        Map<String, Object> data = (Map<String, Object>) queryNode.get("data");
        if (data == null || !data.containsKey("id")) {
            throw new IllegalArgumentException("Insert data must contain an 'id'");
        }
        
        int id = (Integer) data.get("id");
        String value = data.toString(); // Serialize the rest of the map as a string
        
        db.insert(id, value);
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
}
