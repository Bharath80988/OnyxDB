package com.onyxdb.core.schema;

import com.onyxdb.core.execution.ExecutionEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ForeignKeyTest {

    @TempDir
    Path tempDir;

    private ExecutionEngine engine;

    @BeforeEach
    void setUp() {
        engine = new ExecutionEngine(tempDir);
    }

    @Test
    void testForeignKeyInsertSuccess() throws Exception {
        // 1. Insert parent user
        Map<String, Object> parentInsert = new HashMap<>();
        parentInsert.put("action", "insert");
        parentInsert.put("table", "users");
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", 1);
        userData.put("name", "Satoshi");
        parentInsert.put("data", userData);
        engine.execute(parentInsert);

        // 2. Define FK constraint: orders.user_id -> users.id (RESTRICT)
        Map<String, Object> fkQuery = new HashMap<>();
        fkQuery.put("action", "create_foreign_key");
        fkQuery.put("table", "orders");
        fkQuery.put("field", "user_id");
        fkQuery.put("parent_table", "users");
        fkQuery.put("parent_field", "id");
        fkQuery.put("on_delete", "RESTRICT");
        engine.execute(fkQuery);

        // 3. Insert child order referencing user 1
        Map<String, Object> childInsert = new HashMap<>();
        childInsert.put("action", "insert");
        childInsert.put("table", "orders");
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", 500);
        orderData.put("user_id", 1);
        orderData.put("amount", 99.99);
        childInsert.put("data", orderData);

        List<String> res = engine.execute(childInsert);
        assertEquals(1, res.size());
        assertTrue(res.get(0).contains("Inserted 1 row."));
    }

    @Test
    void testForeignKeyInsertViolation() throws Exception {
        // Define FK constraint: orders.user_id -> users.id
        Map<String, Object> fkQuery = new HashMap<>();
        fkQuery.put("action", "create_foreign_key");
        fkQuery.put("table", "orders");
        fkQuery.put("field", "user_id");
        fkQuery.put("parent_table", "users");
        fkQuery.put("parent_field", "id");
        engine.execute(fkQuery);

        // Try inserting child order referencing non-existent user 999
        Map<String, Object> childInsert = new HashMap<>();
        childInsert.put("action", "insert");
        childInsert.put("table", "orders");
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", 501);
        orderData.put("user_id", 999);
        childInsert.put("data", orderData);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> engine.execute(childInsert));
        assertTrue(ex.getMessage().contains("Foreign Key constraint violation"));
    }

    @Test
    void testForeignKeyDeleteRestrict() throws Exception {
        // Insert parent user (id=10)
        Map<String, Object> parentInsert = new HashMap<>();
        parentInsert.put("action", "insert");
        parentInsert.put("table", "users");
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", 10);
        userData.put("name", "Alice");
        parentInsert.put("data", userData);
        engine.execute(parentInsert);

        // Add FK with RESTRICT
        Map<String, Object> fkQuery = new HashMap<>();
        fkQuery.put("action", "create_foreign_key");
        fkQuery.put("table", "orders");
        fkQuery.put("field", "user_id");
        fkQuery.put("parent_table", "users");
        fkQuery.put("on_delete", "RESTRICT");
        engine.execute(fkQuery);

        // Insert child order referencing user 10
        Map<String, Object> childInsert = new HashMap<>();
        childInsert.put("action", "insert");
        childInsert.put("table", "orders");
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", 700);
        orderData.put("user_id", 10);
        childInsert.put("data", orderData);
        engine.execute(childInsert);

        // Try deleting parent user 10 -> Should be blocked by RESTRICT
        Map<String, Object> deleteUser = new HashMap<>();
        deleteUser.put("action", "delete");
        deleteUser.put("table", "users");
        deleteUser.put("id", 10);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> engine.execute(deleteUser));
        assertTrue(ex.getMessage().contains("Cannot delete record id 10"));
    }

    @Test
    void testForeignKeyDeleteCascade() throws Exception {
        // Insert parent user (id=20)
        Map<String, Object> parentInsert = new HashMap<>();
        parentInsert.put("action", "insert");
        parentInsert.put("table", "users");
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", 20);
        userData.put("name", "Bob");
        parentInsert.put("data", userData);
        engine.execute(parentInsert);

        // Add FK with CASCADE
        Map<String, Object> fkQuery = new HashMap<>();
        fkQuery.put("action", "create_foreign_key");
        fkQuery.put("table", "orders");
        fkQuery.put("field", "user_id");
        fkQuery.put("parent_table", "users");
        fkQuery.put("on_delete", "CASCADE");
        engine.execute(fkQuery);

        // Insert child order (id=800) referencing user 20
        Map<String, Object> childInsert = new HashMap<>();
        childInsert.put("action", "insert");
        childInsert.put("table", "orders");
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", 800);
        orderData.put("user_id", 20);
        childInsert.put("data", orderData);
        engine.execute(childInsert);

        // Delete parent user 20 -> Should automatically CASCADE delete order 800
        Map<String, Object> deleteUser = new HashMap<>();
        deleteUser.put("action", "delete");
        deleteUser.put("table", "users");
        deleteUser.put("id", 20);
        engine.execute(deleteUser);

        // Verify order 800 is deleted
        Map<String, Object> selectOrder = new HashMap<>();
        selectOrder.put("action", "select");
        selectOrder.put("table", "orders");
        selectOrder.put("id", 800);

        List<String> orderRes = engine.execute(selectOrder);
        assertTrue(orderRes.isEmpty(), "Referencing order should have been CASCADE deleted.");
    }

    @Test
    void testSchemaPersistence() throws Exception {
        // 1. Setup FK constraint on initial engine instance
        Map<String, Object> fkQuery = new HashMap<>();
        fkQuery.put("action", "create_foreign_key");
        fkQuery.put("table", "items");
        fkQuery.put("field", "category_id");
        fkQuery.put("parent_table", "categories");
        fkQuery.put("on_delete", "RESTRICT");
        engine.execute(fkQuery);

        // 2. Create new engine instance loading from the same directory
        ExecutionEngine newEngine = new ExecutionEngine(tempDir);

        // 3. Attempt invalid insert on new engine instance
        Map<String, Object> itemInsert = new HashMap<>();
        itemInsert.put("action", "insert");
        itemInsert.put("table", "items");
        Map<String, Object> itemData = new HashMap<>();
        itemData.put("id", 1);
        itemData.put("category_id", 404);
        itemInsert.put("data", itemData);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> newEngine.execute(itemInsert));
        assertTrue(ex.getMessage().contains("Foreign Key constraint violation"));
    }
}
