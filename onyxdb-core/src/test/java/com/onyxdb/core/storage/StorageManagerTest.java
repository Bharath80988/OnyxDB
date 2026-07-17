package com.onyxdb.core.storage;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class StorageManagerTest {
    private Path tempFile;
    private StorageManager storageManager;

    @BeforeEach
    void setUp() throws IOException {
        tempFile = Files.createTempFile("onyxdb_test", ".db");
        storageManager = new StorageManager(tempFile);
    }

    @AfterEach
    void tearDown() throws IOException {
        storageManager.close();
        Files.deleteIfExists(tempFile);
    }

    @Test
    void testAllocateAndReadPage() throws IOException {
        Page page = storageManager.allocatePage();
        assertThat(page.getPageId()).isEqualTo(0);
        assertThat(storageManager.getNumPages()).isEqualTo(1);

        page.writeInt(0, 42);
        storageManager.writePage(page);

        Page readPage = storageManager.readPage(0);
        assertThat(readPage.readInt(0)).isEqualTo(42);
    }
}
