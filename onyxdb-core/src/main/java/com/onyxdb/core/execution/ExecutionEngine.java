package com.onyxdb.core.execution;

import com.onyxdb.core.index.BTreeManager;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Collections;

/**
 * Parses and executes structured JSON queries.
 */
public class ExecutionEngine {
    private final BTreeManager bTreeManager;

    public ExecutionEngine(BTreeManager bTreeManager) {
        this.bTreeManager = bTreeManager;
    }

    public List<String> execute(Map<String, Object> queryNode) throws Exception {
        String action = (String) queryNode.get("action");
        if (action == null) {
            throw new IllegalArgumentException("Query must contain an 'action' field");
        }

        switch (action.toLowerCase()) {
            case "insert":
                return executeInsert(queryNode);
            case "select":
                return executeSelect(queryNode);
            default:
                throw new UnsupportedOperationException("Action '" + action + "' is not supported.");
        }
    }

    private List<String> executeInsert(Map<String, Object> queryNode) throws IOException {
        Map<String, Object> data = (Map<String, Object>) queryNode.get("data");
        if (data == null || !data.containsKey("id")) {
            throw new IllegalArgumentException("Insert data must contain an 'id'");
        }
        
        int id = (Integer) data.get("id");
        String value = data.toString(); // Serialize the rest of the map as a string
        
        bTreeManager.insert(id, value);
        return Collections.singletonList("Inserted 1 row.");
    }

    private List<String> executeSelect(Map<String, Object> queryNode) throws IOException {
        if (queryNode.containsKey("id")) {
            // Point lookup
            int id = (Integer) queryNode.get("id");
            String result = bTreeManager.search(id);
            return result != null ? Collections.singletonList(result) : Collections.emptyList();
        } else {
            // Full table scan
            return bTreeManager.scanAll();
        }
    }
}
