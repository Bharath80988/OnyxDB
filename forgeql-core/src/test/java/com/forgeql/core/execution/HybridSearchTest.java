package com.forgeql.core.execution;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;

public class HybridSearchTest {

    @TempDir
    Path tempDir;

    private ExecutionEngine engine;

    @BeforeEach
    void setUp() {
        engine = new ExecutionEngine(tempDir);
    }

    @Test
    void testHybridSearchExecution() throws Exception {
        // Insert record 1 (vector + status ACTIVE)
        Map<String, Object> insert1 = new HashMap<>();
        insert1.put("action", "insert");
        insert1.put("table", "docs");
        Map<String, Object> data1 = new HashMap<>();
        data1.put("id", 101);
        data1.put("status", "ACTIVE");
        data1.put("vector", Arrays.asList(0.1, 0.2, 0.3, 0.4));
        insert1.put("data", data1);
        engine.execute(insert1);

        // Insert record 2 (vector + status INACTIVE)
        Map<String, Object> insert2 = new HashMap<>();
        insert2.put("action", "insert");
        insert2.put("table", "docs");
        Map<String, Object> data2 = new HashMap<>();
        data2.put("id", 102);
        data2.put("status", "INACTIVE");
        data2.put("vector", Arrays.asList(0.12, 0.22, 0.32, 0.42));
        insert2.put("data", data2);
        engine.execute(insert2);

        // Execute Hybrid Search with vector + filter
        Map<String, Object> hybridQuery = new HashMap<>();
        hybridQuery.put("action", "hybrid_search");
        hybridQuery.put("table", "docs");
        hybridQuery.put("vector", Arrays.asList(0.11, 0.21, 0.31, 0.41));
        hybridQuery.put("k", 5);
        Map<String, Object> whereMap = new HashMap<>();
        whereMap.put("status", "ACTIVE");
        hybridQuery.put("where", whereMap);

        List<String> results = engine.execute(hybridQuery);
        assertThat(results).hasSize(1);
        assertThat(results.get(0)).contains("101");
        assertThat(results.get(0)).contains("ACTIVE");
    }
}
