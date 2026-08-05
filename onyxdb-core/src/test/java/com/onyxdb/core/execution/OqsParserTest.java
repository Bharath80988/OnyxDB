package com.onyxdb.core.execution;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

public class OqsParserTest {

    @TempDir
    Path tempDir;

    private ExecutionEngine engine;

    @BeforeEach
    void setUp() {
        engine = new ExecutionEngine(tempDir);
    }

    @Test
    void testParseOqsGet() {
        Map<String, Object> node = engine.parseOqsToQueryNode("GET users 101");
        assertThat(node.get("action")).isEqualTo("select");
        assertThat(node.get("table")).isEqualTo("users");
        assertThat(node.get("id")).isEqualTo(101);

        Map<String, Object> node2 = engine.parseOqsToQueryNode("GET users:202");
        assertThat(node2.get("action")).isEqualTo("select");
        assertThat(node2.get("table")).isEqualTo("users");
        assertThat(node2.get("id")).isEqualTo(202);
    }

    @Test
    void testParseOqsFind() {
        Map<String, Object> node = engine.parseOqsToQueryNode("FIND users WHERE status = ACTIVE");
        assertThat(node.get("action")).isEqualTo("select");
        assertThat(node.get("table")).isEqualTo("users");
        assertThat((Map<String, Object>) node.get("where")).containsEntry("status", "ACTIVE");
    }

    @Test
    void testParseOqsInsertAndUpdate() throws Exception {
        List<String> insertResult = engine.execute("INSERT INTO users {\"id\": 101, \"name\": \"Satoshi\", \"status\": \"ACTIVE\"}");
        assertThat(insertResult).contains("Inserted 1 row.");

        List<String> getResult = engine.execute("GET users 101");
        assertThat(getResult).hasSize(1);
        assertThat(getResult.get(0)).contains("Satoshi");

        List<String> updateResult = engine.execute("UPDATE users 101 SET status = INACTIVE");
        assertThat(updateResult).contains("Updated 1 row.");

        List<String> deleteResult = engine.execute("DELETE users 101");
        assertThat(deleteResult).contains("Deleted 1 row.");
    }
}
