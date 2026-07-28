package com.onyxdb.core.index;

import com.onyxdb.core.execution.ExecutionEngine;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SecondaryIndexTest {
    private Path tempDir;
    private ExecutionEngine engine;

    @BeforeEach
    void setUp() throws IOException {
        tempDir = Files.createTempDirectory("onyxdb_sec_index_test");
        engine = new ExecutionEngine(tempDir);
    }

    @AfterEach
    void tearDown() throws IOException {
        Files.walk(tempDir)
                .sorted(Comparator.reverseOrder())
                .map(Path::toFile)
                .forEach(File::delete);
    }

    @Test
    void testSecondaryIndexLifecycle() throws Exception {
        // 1. Insert records into 'users' table
        Map<String, Object> u1Data = new HashMap<>();
        u1Data.put("id", 1);
        u1Data.put("name", "Alice");
        u1Data.put("email", "alice@onyx.db");
        u1Data.put("role", "admin");
        
        Map<String, Object> insert1 = new HashMap<>();
        insert1.put("action", "insert");
        insert1.put("table", "users");
        insert1.put("data", u1Data);
        engine.execute(insert1);

        Map<String, Object> u2Data = new HashMap<>();
        u2Data.put("id", 2);
        u2Data.put("name", "Bob");
        u2Data.put("email", "bob@onyx.db");
        u2Data.put("role", "user");
        
        Map<String, Object> insert2 = new HashMap<>();
        insert2.put("action", "insert");
        insert2.put("table", "users");
        insert2.put("data", u2Data);
        engine.execute(insert2);

        // 2. Create Secondary Index on 'email'
        Map<String, Object> createIndex = new HashMap<>();
        createIndex.put("action", "create_index");
        createIndex.put("table", "users");
        createIndex.put("field", "email");
        List<String> indexRes = engine.execute(createIndex);
        assertThat(indexRes.get(0)).contains("Created secondary index");

        // 3. Query via Secondary Index Scan
        Map<String, Object> whereMap = new HashMap<>();
        whereMap.put("email", "alice@onyx.db");

        Map<String, Object> selectQuery = new HashMap<>();
        selectQuery.put("action", "select");
        selectQuery.put("table", "users");
        selectQuery.put("where", whereMap);

        List<String> selectRes = engine.execute(selectQuery);
        assertThat(selectRes).hasSize(1);
        assertThat(selectRes.get(0)).contains("Alice");

        // 4. Insert u3 with auto secondary index maintenance
        Map<String, Object> u3Data = new HashMap<>();
        u3Data.put("id", 3);
        u3Data.put("name", "Charlie");
        u3Data.put("email", "charlie@onyx.db");
        u3Data.put("role", "user");
        
        Map<String, Object> insert3 = new HashMap<>();
        insert3.put("action", "insert");
        insert3.put("table", "users");
        insert3.put("data", u3Data);
        engine.execute(insert3);

        Map<String, Object> whereCharlie = new HashMap<>();
        whereCharlie.put("email", "charlie@onyx.db");
        selectQuery.put("where", whereCharlie);
        List<String> charlieRes = engine.execute(selectQuery);
        assertThat(charlieRes).hasSize(1);
        assertThat(charlieRes.get(0)).contains("Charlie");

        // 5. Update u2 email and verify index update
        Map<String, Object> u2UpdateData = new HashMap<>();
        u2UpdateData.put("id", 2);
        u2UpdateData.put("name", "Bob");
        u2UpdateData.put("email", "bob_new@onyx.db");
        u2UpdateData.put("role", "user");

        Map<String, Object> updateQuery = new HashMap<>();
        updateQuery.put("action", "update");
        updateQuery.put("table", "users");
        updateQuery.put("data", u2UpdateData);
        engine.execute(updateQuery);

        Map<String, Object> whereBobNew = new HashMap<>();
        whereBobNew.put("email", "bob_new@onyx.db");
        selectQuery.put("where", whereBobNew);
        List<String> bobNewRes = engine.execute(selectQuery);
        assertThat(bobNewRes).hasSize(1);
        assertThat(bobNewRes.get(0)).contains("bob_new@onyx.db");

        // 6. Delete u1 and verify secondary index entry removal
        Map<String, Object> deleteQuery = new HashMap<>();
        deleteQuery.put("action", "delete");
        deleteQuery.put("table", "users");
        deleteQuery.put("id", 1);
        engine.execute(deleteQuery);

        selectQuery.put("where", whereMap);
        List<String> deletedRes = engine.execute(selectQuery);
        assertThat(deletedRes).isEmpty();
    }
}
