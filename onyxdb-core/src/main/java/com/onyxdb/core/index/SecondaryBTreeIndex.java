package com.onyxdb.core.index;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentSkipListSet;

/**
 * Secondary Index structure mapping secondary attribute string values to primary key record IDs.
 */
public class SecondaryBTreeIndex {
    private static final Logger log = LoggerFactory.getLogger(SecondaryBTreeIndex.class);

    private final String fieldName;
    private final ConcurrentHashMap<String, Set<Integer>> indexMap = new ConcurrentHashMap<>();

    public SecondaryBTreeIndex(String fieldName) {
        this.fieldName = fieldName;
        log.info("Initialized SecondaryBTreeIndex for field '{}'", fieldName);
    }

    public String getFieldName() {
        return fieldName;
    }

    /**
     * Inserts an entry into the secondary index.
     */
    public void insert(String fieldValue, int primaryId) {
        if (fieldValue == null) return;
        indexMap.computeIfAbsent(fieldValue, k -> new ConcurrentSkipListSet<>()).add(primaryId);
        log.debug("Secondary index [{}] inserted: {} -> primaryId {}", fieldName, fieldValue, primaryId);
    }

    /**
     * Removes an entry from the secondary index.
     */
    public void remove(String fieldValue, int primaryId) {
        if (fieldValue == null) return;
        Set<Integer> ids = indexMap.get(fieldValue);
        if (ids != null) {
            ids.remove(primaryId);
            if (ids.isEmpty()) {
                indexMap.remove(fieldValue);
            }
            log.debug("Secondary index [{}] removed: {} -> primaryId {}", fieldName, fieldValue, primaryId);
        }
    }

    /**
     * Updates an entry in the secondary index when a record field changes.
     */
    public void update(String oldFieldValue, String newFieldValue, int primaryId) {
        if (oldFieldValue != null && !oldFieldValue.equals(newFieldValue)) {
            remove(oldFieldValue, primaryId);
        }
        if (newFieldValue != null) {
            insert(newFieldValue, primaryId);
        }
    }

    /**
     * Searches the secondary index for matching primary key IDs.
     */
    public List<Integer> search(String fieldValue) {
        if (fieldValue == null) return Collections.emptyList();
        Set<Integer> ids = indexMap.get(fieldValue);
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        return new ArrayList<>(ids);
    }

    /**
     * Clears all secondary index entries.
     */
    public void clear() {
        indexMap.clear();
    }

    public int size() {
        return indexMap.size();
    }
}
