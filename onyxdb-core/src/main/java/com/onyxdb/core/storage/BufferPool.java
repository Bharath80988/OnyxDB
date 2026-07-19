package com.onyxdb.core.storage;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Manages caching Pages in memory using an LRU eviction policy.
 */
public class BufferPool {
    private static final Logger log = LoggerFactory.getLogger(BufferPool.class);
    private final int capacity;
    private final StorageManager storageManager;
    private final Map<Integer, Page> cache;
    private final ReentrantLock lock = new ReentrantLock();

    public BufferPool(int capacity, StorageManager storageManager) {
        this.capacity = capacity;
        this.storageManager = storageManager;
        
        // true for access-order (LRU)
        this.cache = new LinkedHashMap<>(capacity, 0.75f, true) {
            @Override
            protected boolean removeEldestEntry(Map.Entry<Integer, Page> eldest) {
                if (size() > capacity) {
                    try {
                        evict(eldest.getValue());
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to evict page", e);
                    }
                    return true;
                }
                return false;
            }
        };
    }

    public Page getPage(int pageId) throws IOException {
        lock.lock();
        try {
            Page page = cache.get(pageId);
            if (page == null) {
                log.debug("BufferPool MISS for page {}", pageId);
                page = storageManager.readPage(pageId);
                cache.put(pageId, page);
            } else {
                log.debug("BufferPool HIT for page {}", pageId);
            }
            return page;
        } finally {
            lock.unlock();
        }
    }

    public void flushPage(int pageId) throws IOException {
        lock.lock();
        try {
            Page page = cache.get(pageId);
            if (page != null && page.isDirty()) {
                storageManager.writePage(page);
                page.setDirty(false);
            }
        } finally {
            lock.unlock();
        }
    }

    public Page allocatePage() throws IOException {
        lock.lock();
        try {
            Page page = storageManager.allocatePage();
            cache.put(page.getPageId(), page);
            return page;
        } finally {
            lock.unlock();
        }
    }

    public int getNumPages() {
        return storageManager.getNumPages();
    }

    public void flushAll() throws IOException {
        lock.lock();
        try {
            for (Page page : cache.values()) {
                if (page.isDirty()) {
                    storageManager.writePage(page);
                    page.setDirty(false);
                }
            }
        } finally {
            lock.unlock();
        }
    }

    private void evict(Page page) throws IOException {
        if (page.isDirty()) {
            log.debug("Evicting dirty page {} from BufferPool", page.getPageId());
            storageManager.writePage(page);
            page.setDirty(false);
        } else {
            log.debug("Evicting clean page {} from BufferPool", page.getPageId());
        }
    }
}
