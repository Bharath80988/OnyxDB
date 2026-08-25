package com.forgeql.core.storage;

import java.nio.ByteBuffer;
import java.util.Arrays;

/**
 * Represents a fixed-size block of data (8KB by default) that is read from or written to disk.
 */
public class Page {
    public static final int PAGE_SIZE = 8192; // 8 KB

    private final int pageId;
    private final byte[] data;
    private boolean isDirty;

    public Page(int pageId) {
        this.pageId = pageId;
        this.data = new byte[PAGE_SIZE];
        this.isDirty = false;
    }

    public Page(int pageId, byte[] data) {
        if (data.length != PAGE_SIZE) {
            throw new IllegalArgumentException("Data must be exactly " + PAGE_SIZE + " bytes");
        }
        this.pageId = pageId;
        this.data = Arrays.copyOf(data, data.length);
        this.isDirty = false;
    }

    public int getPageId() {
        return pageId;
    }

    public byte[] getData() {
        return data;
    }

    public ByteBuffer getBuffer() {
        return ByteBuffer.wrap(data);
    }

    public boolean isDirty() {
        return isDirty;
    }

    public void setDirty(boolean dirty) {
        isDirty = dirty;
    }

    /**
     * Reads a 4-byte integer from the page at the given offset.
     */
    public int readInt(int offset) {
        if (offset < 0 || offset + Integer.BYTES > PAGE_SIZE) {
            throw new IndexOutOfBoundsException("Invalid offset");
        }
        return (data[offset] << 24) |
               ((data[offset + 1] & 0xFF) << 16) |
               ((data[offset + 2] & 0xFF) << 8) |
               (data[offset + 3] & 0xFF);
    }

    /**
     * Writes a 4-byte integer to the page at the given offset.
     */
    public void writeInt(int offset, int value) {
        if (offset < 0 || offset + Integer.BYTES > PAGE_SIZE) {
            throw new IndexOutOfBoundsException("Invalid offset");
        }
        data[offset] = (byte) (value >> 24);
        data[offset + 1] = (byte) (value >> 16);
        data[offset + 2] = (byte) (value >> 8);
        data[offset + 3] = (byte) (value);
        isDirty = true;
    }

    /**
     * Defragments and compacts internal page data bytes to remove unused gaps.
     * Reorganizes active byte slots and resets fragmentation trackers.
     *
     * @return Number of fragmented bytes reclaimed during compaction.
     */
    public int defrag() {
        int numSlots = readInt(1);
        if (numSlots <= 0) {
            return 0;
        }

        byte[] temp = new byte[PAGE_SIZE];
        System.arraycopy(data, 0, temp, 0, 16); // Preserve 16-byte header
        
        int bytesReclaimed = 0;
        int activeOffset = 16;
        
        for (int i = 0; i < numSlots; i++) {
            int slotOffset = 16 + (i * 256);
            if (slotOffset + 256 <= PAGE_SIZE) {
                int recordId = readInt(slotOffset);
                if (recordId != 0 || data[slotOffset + 4] != 0) { // Active record check
                    System.arraycopy(data, slotOffset, temp, activeOffset, 256);
                    activeOffset += 256;
                } else {
                    bytesReclaimed += 256;
                }
            }
        }

        if (bytesReclaimed > 0) {
            System.arraycopy(temp, 0, data, 0, PAGE_SIZE);
            int newActiveCount = (activeOffset - 16) / 256;
            writeInt(1, newActiveCount);
            setDirty(true);
        }
        return bytesReclaimed;
    }
}

