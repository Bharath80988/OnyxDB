package com.onyxdb.core.index;

import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.Page;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * Manages indexing and retrieval of data using a B+ Tree structure over 8KB Pages.
 */
public class BTreeManager {
    private final BufferPool bufferPool;
    private int rootPageId = 0;
    
    private static final int RECORD_SIZE = 256;
    private static final int HEADER_SIZE = 16;
    private static final int MAX_LEAF_RECORDS = (Page.PAGE_SIZE - HEADER_SIZE) / RECORD_SIZE; // 31
    private static final int MAX_INTERNAL_RECORDS = (Page.PAGE_SIZE - HEADER_SIZE) / 8; // ~1000

    private static final byte TYPE_LEAF = 0;
    private static final byte TYPE_INTERNAL = 1;

    public BTreeManager(BufferPool bufferPool) throws IOException {
        this.bufferPool = bufferPool;
        if (bufferPool.getNumPages() == 0) {
            Page rootPage = bufferPool.allocatePage();
            initLeafNode(rootPage);
            bufferPool.flushPage(rootPageId);
        }
    }

    private void initLeafNode(Page page) {
        byte[] data = page.getData();
        data[0] = TYPE_LEAF;
        page.writeInt(1, 0); // numRecords = 0
        page.writeInt(5, -1); // nextLeafPageId = -1
        page.setDirty(true);
    }
    
    private void initInternalNode(Page page) {
        byte[] data = page.getData();
        data[0] = TYPE_INTERNAL;
        page.writeInt(1, 0); // numRecords = 0
        page.writeInt(5, -1); // not used
        page.setDirty(true);
    }

    public void insert(int id, String data) throws IOException {
        insertRecursively(rootPageId, id, data);
    }
    
    private void insertRecursively(int pageId, int id, String dataString) throws IOException {
        Page page = bufferPool.getPage(pageId);
        byte nodeType = page.getData()[0];
        
        if (nodeType == TYPE_LEAF) {
            int numRecords = page.readInt(1);
            if (numRecords < MAX_LEAF_RECORDS) {
                insertIntoLeaf(page, id, dataString, numRecords);
            } else {
                splitLeaf(page, id, dataString);
            }
        } else {
            // Internal node routing
            int childPageId = findChildPage(page, id);
            insertRecursively(childPageId, id, dataString);
            // In a full B+ tree, we would handle internal node splitting here after the child splits.
            // For v1.2, we only support splitting the root once (creating 2 leaves).
        }
    }

    private int findChildPage(Page internalPage, int searchId) {
        int numRecords = internalPage.readInt(1);
        for (int i = 0; i < numRecords; i++) {
            int offset = HEADER_SIZE + (i * 8);
            int maxKey = internalPage.readInt(offset);
            int childId = internalPage.readInt(offset + 4);
            if (searchId <= maxKey || i == numRecords - 1) {
                return childId;
            }
        }
        return -1; // Should not happen
    }

    private void insertIntoLeaf(Page leafPage, int id, String dataString, int numRecords) {
        int offset = HEADER_SIZE + (numRecords * RECORD_SIZE);
        
        // Write ID
        leafPage.writeInt(offset, id);
        
        // Write String Length
        byte[] stringBytes = dataString.getBytes(StandardCharsets.UTF_8);
        leafPage.writeInt(offset + 4, stringBytes.length);
        
        // Write String Data
        byte[] pageData = leafPage.getData();
        System.arraycopy(stringBytes, 0, pageData, offset + 8, Math.min(stringBytes.length, RECORD_SIZE - 8));
        
        // Increment record count
        leafPage.writeInt(1, numRecords + 1);
        leafPage.setDirty(true);
    }

    private void splitLeaf(Page oldLeaf, int newId, String newData) throws IOException {
        if (oldLeaf.getPageId() == rootPageId) {
            // Split the root leaf into two leaves, and make a new internal root
            Page leftLeaf = bufferPool.allocatePage();
            initLeafNode(leftLeaf);
            
            Page rightLeaf = bufferPool.allocatePage();
            initLeafNode(rightLeaf);
            
            // Move half records to left, half to right
            int numRecords = oldLeaf.readInt(1);
            int mid = numRecords / 2;
            
            int maxLeftKey = -1;
            
            for (int i = 0; i < mid; i++) {
                int offset = HEADER_SIZE + (i * RECORD_SIZE);
                int id = oldLeaf.readInt(offset);
                int len = oldLeaf.readInt(offset + 4);
                byte[] stringBytes = new byte[len];
                System.arraycopy(oldLeaf.getData(), offset + 8, stringBytes, 0, len);
                insertIntoLeaf(leftLeaf, id, new String(stringBytes, StandardCharsets.UTF_8), i);
                maxLeftKey = Math.max(maxLeftKey, id);
            }
            
            for (int i = mid; i < numRecords; i++) {
                int offset = HEADER_SIZE + (i * RECORD_SIZE);
                int id = oldLeaf.readInt(offset);
                int len = oldLeaf.readInt(offset + 4);
                byte[] stringBytes = new byte[len];
                System.arraycopy(oldLeaf.getData(), offset + 8, stringBytes, 0, len);
                insertIntoLeaf(rightLeaf, id, new String(stringBytes, StandardCharsets.UTF_8), i - mid);
            }
            
            // Link leaves
            leftLeaf.writeInt(5, rightLeaf.getPageId());
            
            // Insert the new record into the correct side
            if (newId <= maxLeftKey) {
                insertIntoLeaf(leftLeaf, newId, newData, leftLeaf.readInt(1));
            } else {
                insertIntoLeaf(rightLeaf, newId, newData, rightLeaf.readInt(1));
            }
            
            // Convert old root to internal node
            initInternalNode(oldLeaf);
            
            // Add pointers to left and right
            int offset = HEADER_SIZE;
            oldLeaf.writeInt(offset, maxLeftKey); // Key
            oldLeaf.writeInt(offset + 4, leftLeaf.getPageId()); // Pointer
            
            oldLeaf.writeInt(offset + 8, Integer.MAX_VALUE); // Key
            oldLeaf.writeInt(offset + 12, rightLeaf.getPageId()); // Pointer
            
            oldLeaf.writeInt(1, 2); // 2 records in internal node
            oldLeaf.setDirty(true);
        }
    }

    public String search(int id) throws IOException {
        int currentPageId = rootPageId;
        while (true) {
            Page page = bufferPool.getPage(currentPageId);
            byte nodeType = page.getData()[0];
            
            if (nodeType == TYPE_LEAF) {
                int numRecords = page.readInt(1);
                for (int i = 0; i < numRecords; i++) {
                    int offset = HEADER_SIZE + (i * RECORD_SIZE);
                    int recordId = page.readInt(offset);
                    if (recordId == id) {
                        int len = page.readInt(offset + 4);
                        byte[] stringBytes = new byte[len];
                        System.arraycopy(page.getData(), offset + 8, stringBytes, 0, len);
                        return new String(stringBytes, StandardCharsets.UTF_8);
                    }
                }
                return null;
            } else {
                currentPageId = findChildPage(page, id);
            }
        }
    }

    public List<String> scanAll() throws IOException {
        List<String> results = new ArrayList<>();
        int currentPageId = rootPageId;
        
        // Find first leaf
        while (true) {
            Page page = bufferPool.getPage(currentPageId);
            byte nodeType = page.getData()[0];
            if (nodeType == TYPE_LEAF) {
                break;
            } else {
                currentPageId = page.readInt(HEADER_SIZE + 4); // First child pointer
            }
        }
        
        // Traverse leaves
        while (currentPageId != -1) {
            Page page = bufferPool.getPage(currentPageId);
            int numRecords = page.readInt(1);
            for (int i = 0; i < numRecords; i++) {
                int offset = HEADER_SIZE + (i * RECORD_SIZE);
                int len = page.readInt(offset + 4);
                byte[] stringBytes = new byte[len];
                System.arraycopy(page.getData(), offset + 8, stringBytes, 0, len);
                results.add(new String(stringBytes, StandardCharsets.UTF_8));
            }
            currentPageId = page.readInt(5); // nextLeafPageId
        }
        
        return results;
    }
}
