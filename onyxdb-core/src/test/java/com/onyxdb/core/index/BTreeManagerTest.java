package com.onyxdb.core.index;

import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.StorageManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class BTreeManagerTest {
    private Path tempDbFile;
    private StorageManager storage;
    private BufferPool bufferPool;
    private BTreeManager btree;

    @BeforeEach
    void setUp() throws IOException {
        tempDbFile = Files.createTempFile("test_btree", ".db");
        storage = new StorageManager(tempDbFile);
        bufferPool = new BufferPool(10, storage);
        btree = new BTreeManager(bufferPool);
    }

    @AfterEach
    void tearDown() throws IOException {
        storage.close();
        Files.deleteIfExists(tempDbFile);
    }

    @Test
    void testInsertSearchUpdateDelete() throws IOException {
        // Insert
        btree.insert(1, "{\"name\":\"Alice\"}");
        btree.insert(2, "{\"name\":\"Bob\"}");
        btree.insert(3, "{\"name\":\"Charlie\"}");

        // Search
        assertThat(btree.search(1)).isEqualTo("{\"name\":\"Alice\"}");
        assertThat(btree.search(2)).isEqualTo("{\"name\":\"Bob\"}");
        assertThat(btree.search(3)).isEqualTo("{\"name\":\"Charlie\"}");

        // Update
        boolean updated = btree.update(2, "{\"name\":\"Robert\"}");
        assertThat(updated).isTrue();
        assertThat(btree.search(2)).isEqualTo("{\"name\":\"Robert\"}");

        // Delete
        boolean deleted = btree.delete(2);
        assertThat(deleted).isTrue();
        assertThat(btree.search(2)).isNull();

        // Remaining records intact
        assertThat(btree.search(1)).isEqualTo("{\"name\":\"Alice\"}");
        assertThat(btree.search(3)).isEqualTo("{\"name\":\"Charlie\"}");
        assertThat(btree.scanAll()).hasSize(2);
    }
}
