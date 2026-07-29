package com.onyxdb.core.storage;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

public class MmapStorageManagerTest {

    @TempDir
    Path tempDir;

    @Test
    void testMmapReadWriteAllocate() throws Exception {
        Path tablePath = tempDir.resolve("mmap_test.db");
        MmapStorageManager mmapStorage = new MmapStorageManager(tablePath);

        // Allocate and write page 0
        Page page0 = mmapStorage.allocatePage();
        assertEquals(0, page0.getPageId());

        page0.writeInt(0, 42);
        page0.writeInt(100, 99);
        mmapStorage.writePage(page0);
        mmapStorage.flush();

        // Read page 0 back
        Page readBack = mmapStorage.readPage(0);
        assertEquals(42, readBack.readInt(0));
        assertEquals(99, readBack.readInt(100));

        mmapStorage.close();
    }
}
