package com.forgeql.api;

import com.forgeql.core.execution.ExecutionEngine;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Spring service layer bridging the REST API controller and the {@link ExecutionEngine}.
 *
 * <p>Applies a two-tier caching strategy:
 * <ul>
 *   <li>SELECT queries are cached by query content (cache key = query JSON string).</li>
 *   <li>INSERT / UPDATE / DELETE operations evict the entire query cache to prevent stale reads.</li>
 * </ul>
 * </p>
 */
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

    // Clear the cache whenever a mutative query (INSERT, UPDATE, DELETE) is executed
    @CacheEvict(value = "queries", allEntries = true)
    public List<String> executeMutative(Map<String, Object> query) throws Exception {
        return executionEngine.execute(query);
    }

    public List<String> executeQuery(Map<String, Object> query) throws Exception {
        String action = (String) query.get("action");
        if ("select".equalsIgnoreCase(action)) {
            // Route to cached SELECT path
            return executeSelect(query);
        } else if ("insert".equalsIgnoreCase(action)
                || "update".equalsIgnoreCase(action)
                || "delete".equalsIgnoreCase(action)) {
            // Route to cache-evicting mutative path
            return executeMutative(query);
        } else {
            // All other actions (vector_search, hybrid_search, explain, create_index, etc.) — no caching
            return executionEngine.execute(query);
        }
    }

    /**
     * Delegates to {@link ExecutionEngine#getSystemMetrics()} for live telemetry.
     * Not cached — always returns fresh JVM and index stats.
     *
     * @return Live system metrics map.
     */
    public Map<String, Object> getSystemMetrics() {
        return executionEngine.getSystemMetrics();
    }
}
