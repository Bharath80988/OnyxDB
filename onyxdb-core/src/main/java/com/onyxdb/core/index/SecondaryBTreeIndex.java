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
 * Secondary index mapping non-primary-key field values to sets of primary record IDs.
 *
 * <p>Algorithm: ConcurrentHashMap (field value → primary ID set) backed by
 * {@link ConcurrentSkipListSet} per value bucket. ConcurrentSkipListSet provides
 * O(log n) insertion, deletion, and lookup with lock-free concurrent access,
 * and returns IDs in naturally sorted order for deterministic scan results.</p>
 *
 * <p>Mutation operations (insert / update / delete) are automatically synchronized
 * with the primary B+ Tree by {@code ExecutionEngine} after every write.</p>
 */
public class SecondaryBTreeIndex {
    private static final Logger log = LoggerFactory.getLogger(SecondaryBTreeIndex.class);

    /** The indexed field name (e.g. "status", "email", "role"). */
    private final String fieldName;

    // Thread-safe index map: field value string → sorted set of primary key IDs
    // Algorithm: ConcurrentHashMap outer + ConcurrentSkipListSet inner = lock-free O(log n) per bucket
    private final ConcurrentHashMap<String, Set<Integer>> indexMap = new ConcurrentHashMap<>();

    /**
     * Constructs a secondary index for the given field name.
     *
     * @param fieldName The name of the indexed record field.
     */
    public SecondaryBTreeIndex(String fieldName) {
        this.fieldName = fieldName;
        log.info("Initialized SecondaryBTreeIndex for field '{}'", fieldName);
    }

    /** Returns the name of the indexed field. */
    public String getFieldName() {
        return fieldName;
    }

    /**
     * Inserts a mapping from field value to primary key ID into the secondary index.
     * Algorithm: computeIfAbsent creates a new ConcurrentSkipListSet bucket on first occurrence.
     *
     * @param fieldValue The indexed field's string value.
     * @param primaryId  The primary key ID of the record.
     */
    public void insert(String fieldValue, int primaryId) {
        if (fieldValue == null) return;

        // Thread-safe bucket creation and insertion
        indexMap.computeIfAbsent(fieldValue, k -> new ConcurrentSkipListSet<>()).add(primaryId);
        log.debug("Secondary index [{}] insert: '{}' → primaryId {}", fieldName, fieldValue, primaryId);
    }

    /**
     * Removes a primary key ID from a field value bucket.
     * Removes the entire bucket from the map if it becomes empty after deletion.
     *
     * @param fieldValue The indexed field's string value.
     * @param primaryId  The primary key ID to remove.
     */
    public void remove(String fieldValue, int primaryId) {
        if (fieldValue == null) return;

        Set<Integer> ids = indexMap.get(fieldValue);
        if (ids != null) {
            ids.remove(primaryId);
            // Remove empty bucket to prevent memory leak
            if (ids.isEmpty()) {
                indexMap.remove(fieldValue);
            }
            log.debug("Secondary index [{}] remove: '{}' → primaryId {}", fieldName, fieldValue, primaryId);
        }
    }

    /**
     * Updates the secondary index when a record's indexed field value changes.
     * Atomically removes the old mapping and inserts the new mapping.
     *
     * @param oldFieldValue Previous field value (may be null if field was unset).
     * @param newFieldValue New field value (may be null to clear the mapping).
     * @param primaryId     The primary record ID being updated.
     */
    public void update(String oldFieldValue, String newFieldValue, int primaryId) {
        // Remove stale index entry if the value has actually changed
        if (oldFieldValue != null && !oldFieldValue.equals(newFieldValue)) {
            remove(oldFieldValue, primaryId);
        }
        // Insert new index entry
        if (newFieldValue != null) {
            insert(newFieldValue, primaryId);
        }
    }

    /**
     * Returns all primary key IDs matching the given field value.
     * Algorithm: O(1) hash lookup + O(n) copy of the matching ID set.
     *
     * @param fieldValue The field value to look up.
     * @return Sorted list of matching primary key IDs, or empty list if none found.
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
     * Clears all entries in the secondary index.
     * Used before rebuilding the index from scratch via {@code create_index}.
     */
    public void clear() {
        indexMap.clear();
    }

    /** Returns the number of distinct indexed field values. */
    public int size() {
        return indexMap.size();
    }
}
