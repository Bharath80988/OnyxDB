package com.onyxdb.core.storage;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.atomic.AtomicInteger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Manages reading and writing Pages to the underlying data file using Java NIO.
 */
public class StorageManager {
    private static final Logger log = LoggerFactory.getLogger(StorageManager.class);
    private final Path filePath;
    private FileChannel fileChannel;
    private final AtomicInteger numPages;

    public StorageManager(Path filePath) throws IOException {
        this.filePath = filePath;
        this.fileChannel = FileChannel.open(filePath, 
            StandardOpenOption.CREATE, 
            StandardOpenOption.READ, 
            StandardOpenOption.WRITE);
        
        long fileSize = fileChannel.size();
        this.numPages = new AtomicInteger((int) (fileSize / Page.PAGE_SIZE));
        log.info("Initialized StorageManager for table file: {}. Loaded {} pages.", filePath, this.numPages.get());
    }

    /**
     * Reads a page from disk by its pageId.
     */
    public Page readPage(int pageId) throws IOException {
        if (pageId < 0 || pageId >= numPages.get()) {
            throw new IllegalArgumentException("Invalid pageId: " + pageId);
        }

        ByteBuffer buffer = ByteBuffer.allocate(Page.PAGE_SIZE);
        long offset = (long) pageId * Page.PAGE_SIZE;
        
        int bytesRead = fileChannel.read(buffer, offset);
        if (bytesRead < Page.PAGE_SIZE && bytesRead != -1) {
            throw new IOException("Incomplete read of page " + pageId);
        }

        log.debug("Read page {} from disk", pageId);
        return new Page(pageId, buffer.array());
    }

    /**
     * Writes a page to disk.
     */
    public void writePage(Page page) throws IOException {
        ByteBuffer buffer = ByteBuffer.wrap(page.getData());
        long offset = (long) page.getPageId() * Page.PAGE_SIZE;
        
        fileChannel.write(buffer, offset);
        fileChannel.force(false); // fsync
        page.setDirty(false);
        log.debug("Wrote page {} to disk ({} bytes)", page.getPageId(), Page.PAGE_SIZE);
    }

    /**
     * Allocates a new, empty page at the end of the file.
     */
    public Page allocatePage() throws IOException {
        int newPageId = numPages.getAndIncrement();
        Page newPage = new Page(newPageId);
        writePage(newPage);
        log.info("Allocated new page {}", newPageId);
        return newPage;
    }

    public int getNumPages() {
        return numPages.get();
    }

    public void close() throws IOException {
        if (fileChannel != null && fileChannel.isOpen()) {
            fileChannel.close();
        }
    }
}
