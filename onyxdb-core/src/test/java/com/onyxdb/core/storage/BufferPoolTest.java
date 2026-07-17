package com.onyxdb.core.storage;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class BufferPoolTest {
    private Path tempFile;
    private StorageManager storageManager;
    private BufferPool bufferPool;

    @BeforeEach
    void setUp() throws IOException {
        tempFile = Files.createTempFile("onyxdb_test", ".db");
        storageManager = new StorageManager(tempFile);
        
        // Allocate 3 pages on disk
        storageManager.allocatePage();
        storageManager.allocatePage();
        storageManager.allocatePage();
        
        // BufferPool with capacity of 2
        bufferPool = new BufferPool(2, storageManager);
    }

    @AfterEach
    void tearDown() throws IOException {
        storageManager.close();
        Files.deleteIfExists(tempFile);
    }

    @Test
    void testLruEviction() throws IOException {
        Page p0 = bufferPool.getPage(0);
        p0.writeInt(0, 100);
        p0.setDirty(true);
        
        bufferPool.getPage(1); // p0 and p1 are in cache
        
        // This should evict p0 (LRU), which will write it to disk since it's dirty
        bufferPool.getPage(2); 
        
        // Verify p0 was written
        Page readBack0 = storageManager.readPage(0);
        assertThat(readBack0.readInt(0)).isEqualTo(100);
    }
}
