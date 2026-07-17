package com.onyxdb.core.index;

import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.Page;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Manages indexing and retrieval of data on pages.
 * Currently implemented as a single-node (root-only) B-Tree for v1.1.
 */
public class BTreeManager {
    private final BufferPool bufferPool;
    private final int rootPageId = 0; // Hardcoded root for simplicity in v1.1
    private static final int RECORD_SIZE = 256;

    public BTreeManager(BufferPool bufferPool) throws IOException {
        this.bufferPool = bufferPool;
    }

    /**
     * Inserts a record.
     */
    public void insert(int id, String data) throws IOException {
        Page page = bufferPool.getPage(rootPageId);
        int numRecords = page.readInt(0); // Offset 0 stores the number of records
        
        int offset = 4 + (numRecords * RECORD_SIZE);
        
        // Write ID
        page.writeInt(offset, id);
        
        // Write String Length
        byte[] stringBytes = data.getBytes(StandardCharsets.UTF_8);
        page.writeInt(offset + 4, stringBytes.length);
        
        // Write String Data
        byte[] pageData = page.getData();
        System.arraycopy(stringBytes, 0, pageData, offset + 8, Math.min(stringBytes.length, RECORD_SIZE - 8));
        
        // Increment record count
        page.writeInt(0, numRecords + 1);
        page.setDirty(true);
    }

    /**
     * Searches for a record by ID.
     */
    public String search(int id) throws IOException {
        Page page = bufferPool.getPage(rootPageId);
        int numRecords = page.readInt(0);
        
        for (int i = 0; i < numRecords; i++) {
            int offset = 4 + (i * RECORD_SIZE);
            int recordId = page.readInt(offset);
            
            if (recordId == id) {
                int len = page.readInt(offset + 4);
                byte[] stringBytes = new byte[len];
                System.arraycopy(page.getData(), offset + 8, stringBytes, 0, len);
                return new String(stringBytes, StandardCharsets.UTF_8);
            }
        }
        return null;
    }

    /**
     * Returns all records (Full Table Scan).
     */
    public List<String> scanAll() throws IOException {
        List<String> results = new ArrayList<>();
        Page page = bufferPool.getPage(rootPageId);
        int numRecords = page.readInt(0);
        
        for (int i = 0; i < numRecords; i++) {
            int offset = 4 + (i * RECORD_SIZE);
            int len = page.readInt(offset + 4);
            byte[] stringBytes = new byte[len];
            System.arraycopy(page.getData(), offset + 8, stringBytes, 0, len);
            results.add(new String(stringBytes, StandardCharsets.UTF_8));
        }
        return results;
    }
}
