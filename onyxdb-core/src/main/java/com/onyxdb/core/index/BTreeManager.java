package com.onyxdb.core.index;

import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.Page;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Manages indexing and retrieval of data using a B+ Tree structure over 8KB Pages.
 */
public class BTreeManager {
    private static final Logger log = LoggerFactory.getLogger(BTreeManager.class);
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
        log.debug("Inserted record id {} into page {}", id, leafPage.getPageId());
    }

    private void splitLeaf(Page oldLeaf, int newId, String newData) throws IOException {
        if (oldLeaf.getPageId() == rootPageId) {
            log.info("Splitting root leaf node {} due to reaching max capacity ({})", rootPageId, MAX_LEAF_RECORDS);
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

    /**
     * Binary search algorithm to rapidly locate a key index within a B+ Tree leaf node in O(log N) time.
     * @return index of record if found, or -(insertion point) - 1 if not found.
     */
    private int binarySearchLeaf(Page leafPage, int numRecords, int targetId) {
        int low = 0;
        int high = numRecords - 1;

        while (low <= high) {
            int mid = (low + high) >>> 1;
            int offset = HEADER_SIZE + (mid * RECORD_SIZE);
            int midKey = leafPage.readInt(offset);

            if (midKey < targetId) {
                low = mid + 1;
            } else if (midKey > targetId) {
                high = mid - 1;
            } else {
                return mid; // Key found
            }
        }
        return -(low + 1); // Key not found
    }

    public String search(int id) throws IOException {
        int currentPageId = rootPageId;
        while (true) {
            Page page = bufferPool.getPage(currentPageId);
            byte nodeType = page.getData()[0];
            
            if (nodeType == TYPE_LEAF) {
                int numRecords = page.readInt(1);
                int idx = binarySearchLeaf(page, numRecords, id);
                if (idx >= 0) {
                    int offset = HEADER_SIZE + (idx * RECORD_SIZE);
                    int len = page.readInt(offset + 4);
                    byte[] stringBytes = new byte[len];
                    System.arraycopy(page.getData(), offset + 8, stringBytes, 0, len);
                    return new String(stringBytes, StandardCharsets.UTF_8);
                }
                return null;
            } else {
                currentPageId = findChildPage(page, id);
            }
        }
    }

    public boolean update(int id, String newData) throws IOException {
        int currentPageId = rootPageId;
        while (true) {
            Page page = bufferPool.getPage(currentPageId);
            byte nodeType = page.getData()[0];
            
            if (nodeType == TYPE_LEAF) {
                int numRecords = page.readInt(1);
                int idx = binarySearchLeaf(page, numRecords, id);
                if (idx >= 0) {
                    int offset = HEADER_SIZE + (idx * RECORD_SIZE);
                    byte[] stringBytes = newData.getBytes(StandardCharsets.UTF_8);
                    page.writeInt(offset + 4, stringBytes.length);
                    byte[] pageData = page.getData();
                    // Clear previous buffer region
                    for (int k = 8; k < RECORD_SIZE; k++) {
                        pageData[offset + k] = 0;
                    }
                    System.arraycopy(stringBytes, 0, pageData, offset + 8, Math.min(stringBytes.length, RECORD_SIZE - 8));
                    page.setDirty(true);
                    log.info("Updated record id {} in leaf page {}", id, currentPageId);
                    return true;
                } else {
                    log.warn("Update failed: Record id {} not found in leaf page {}", id, currentPageId);
                    return false;
                }
            } else {
                currentPageId = findChildPage(page, id);
            }
        }
    }

    public boolean delete(int id) throws IOException {
        int currentPageId = rootPageId;
        while (true) {
            Page page = bufferPool.getPage(currentPageId);
            byte nodeType = page.getData()[0];
            
            if (nodeType == TYPE_LEAF) {
                int numRecords = page.readInt(1);
                int idx = binarySearchLeaf(page, numRecords, id);
                if (idx >= 0) {
                    byte[] pageData = page.getData();
                    // Shift subsequent records left by 1 record slot (256 bytes)
                    int bytesToShift = (numRecords - 1 - idx) * RECORD_SIZE;
                    if (bytesToShift > 0) {
                        int srcPos = HEADER_SIZE + ((idx + 1) * RECORD_SIZE);
                        int destPos = HEADER_SIZE + (idx * RECORD_SIZE);
                        System.arraycopy(pageData, srcPos, pageData, destPos, bytesToShift);
                    }
                    // Clear the last record slot
                    int lastRecordOffset = HEADER_SIZE + ((numRecords - 1) * RECORD_SIZE);
                    for (int k = 0; k < RECORD_SIZE; k++) {
                        pageData[lastRecordOffset + k] = 0;
                    }
                    // Decrement record count
                    page.writeInt(1, numRecords - 1);
                    page.setDirty(true);
                    log.info("Deleted record id {} from leaf page {}. Remaining records: {}", id, currentPageId, numRecords - 1);
                    return true;
                } else {
                    log.warn("Delete failed: Record id {} not found in leaf page {}", id, currentPageId);
                    return false;
                }
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
