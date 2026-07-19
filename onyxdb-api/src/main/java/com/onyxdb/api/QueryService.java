package com.onyxdb.api;

import com.onyxdb.core.execution.ExecutionEngine;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class QueryService {

    private final ExecutionEngine executionEngine;

    public QueryService(ExecutionEngine executionEngine) {
        this.executionEngine = executionEngine;
    }

    // Cache the results of a SELECT query using the query string representation as a key
    @Cacheable(value = "queries", key = "#query.toString()", condition = "#query.get('action').equals('select')")
    public List<String> executeSelect(Map<String, Object> query) throws Exception {
        return executionEngine.execute(query);
    }

    // Clear the cache whenever an INSERT query is executed, as the table data changes
    @CacheEvict(value = "queries", allEntries = true)
    public List<String> executeInsert(Map<String, Object> query) throws Exception {
        return executionEngine.execute(query);
    }

    public List<String> executeQuery(Map<String, Object> query) throws Exception {
        String action = (String) query.get("action");
        if ("select".equalsIgnoreCase(action)) {
            return executeSelect(query);
        } else if ("insert".equalsIgnoreCase(action)) {
            return executeInsert(query);
        } else {
            return executionEngine.execute(query);
        }
    }
}
