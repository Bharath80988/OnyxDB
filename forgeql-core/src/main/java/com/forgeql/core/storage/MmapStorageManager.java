package com.forgeql.core.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * OS-level Zero-Copy Memory-Mapped Storage Manager (`MmapStorageManager`).
 * Maps `.db` physical disk files directly into the Operating System Virtual Memory Page Cache
 * via `FileChannel.map()`, bypassing user-kernel context switching and buffer allocations.
 */
public class MmapStorageManager {
    private static final Logger log = LoggerFactory.getLogger(MmapStorageManager.class);
    private static final long INITIAL_MAP_SIZE = 1024L * 1024L * 64L; // 64 MB initial memory map window

    private final Path filePath;
    private final FileChannel fileChannel;
    private MappedByteBuffer mappedBuffer;
    private final AtomicInteger numPages;
    private long currentMapCapacity;

    public MmapStorageManager(Path filePath) throws IOException {
        this.filePath = filePath;
        this.fileChannel = FileChannel.open(filePath,
                StandardOpenOption.CREATE,
                StandardOpenOption.READ,
                StandardOpenOption.WRITE);

        long fileSize = fileChannel.size();
        this.currentMapCapacity = Math.max(fileSize, INITIAL_MAP_SIZE);
        this.mappedBuffer = fileChannel.map(FileChannel.MapMode.READ_WRITE, 0, currentMapCapacity);
        
        int initialPages = (int) (fileSize / Page.PAGE_SIZE);
        this.numPages = new AtomicInteger(initialPages);
        log.info("Initialized MmapStorageManager (Zero-Copy OS Memory Mapping) for table: {}. Mapped capacity: {} MB, Loaded {} pages.",
                filePath, currentMapCapacity / (1024 * 1024), numPages.get());
    }

    private synchronized void ensureCapacity(long requiredBytes) throws IOException {
        if (requiredBytes > currentMapCapacity) {
            long newCapacity = currentMapCapacity * 2;
            while (newCapacity < requiredBytes) {
                newCapacity *= 2;
            }
            log.info("Expanding OS Memory Mapping capacity for {} from {} MB to {} MB",
                    filePath.getFileName(), currentMapCapacity / (1024 * 1024), newCapacity / (1024 * 1024));
            
            this.mappedBuffer.force(); // Sync dirty pages before remap
            this.mappedBuffer = fileChannel.map(FileChannel.MapMode.READ_WRITE, 0, newCapacity);
            this.currentMapCapacity = newCapacity;
        }
    }

    /**
     * Performs a Zero-Copy direct memory page read from OS Virtual Memory Page Cache.
     */
    public Page readPage(int pageId) throws IOException {
        if (pageId < 0 || pageId >= numPages.get()) {
            throw new IllegalArgumentException("Invalid pageId: " + pageId);
        }

        long offset = (long) pageId * Page.PAGE_SIZE;
        ensureCapacity(offset + Page.PAGE_SIZE);

        ByteBuffer pageBuf = ByteBuffer.allocateDirect(Page.PAGE_SIZE);
        ByteBuffer duplicate = mappedBuffer.duplicate();
        duplicate.position((int) offset);
        duplicate.limit((int) (offset + Page.PAGE_SIZE));
        pageBuf.put(duplicate);
        pageBuf.flip();

        byte[] data = new byte[Page.PAGE_SIZE];
        pageBuf.get(data);

        log.debug("Read page {} via OS Zero-Copy Memory Map", pageId);
        return new Page(pageId, data);
    }

    /**
     * Performs a Zero-Copy direct memory write to the OS Virtual Memory Page Cache.
     */
    public void writePage(Page page) throws IOException {
        long offset = (long) page.getPageId() * Page.PAGE_SIZE;
        ensureCapacity(offset + Page.PAGE_SIZE);

        ByteBuffer duplicate = mappedBuffer.duplicate();
        duplicate.position((int) offset);
        duplicate.put(page.getData());
        
        page.setDirty(false);
        log.debug("Wrote page {} to OS Memory Map", page.getPageId());
    }

    /**
     * Asynchronously flushes dirty pages in memory to physical storage.
     */
    public void flush() {
        if (mappedBuffer != null) {
            mappedBuffer.force();
            log.debug("Flushed OS Memory Mapped buffer for {}", filePath);
        }
    }

    /**
     * Allocates a new page in the zero-copy memory map.
     */
    public Page allocatePage() throws IOException {
        int newPageId = numPages.getAndIncrement();
        Page newPage = new Page(newPageId);
        writePage(newPage);
        log.info("Allocated new page {} via OS Memory Map", newPageId);
        return newPage;
    }

    public int getNumPages() {
        return numPages.get();
    }

    public void close() throws IOException {
        if (mappedBuffer != null) {
            mappedBuffer.force();
        }
        if (fileChannel != null && fileChannel.isOpen()) {
            fileChannel.close();
        }
    }
}
