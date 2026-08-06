package com.onyxdb.core.execution;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Live table statistics for the Cost-Based Query Optimizer (CBO).
 *
 * <p>Tracks total row count and per-field distinct value counts (cardinality).
 * These statistics are used to estimate query execution costs and choose optimal plans.</p>
 *
 * <p>Selectivity Formula: selectivity(field) = 1 / distinct_values(field)
 * Lower selectivity (more distinct values) → index scan is more selective → lower cost.
 * Higher selectivity (fewer distinct values) → full scan may be cheaper.</p>
 */
public class TableStats {

    /** The table name these statistics relate to. */
    private final String tableName;

    /** Total number of rows currently in the table. */
    private long totalRows;

    // Map of field name → number of distinct field values (cardinality)
    // Algorithm: ConcurrentHashMap for thread-safe concurrent stat updates
    private final Map<String, Long> distinctValuesCount = new ConcurrentHashMap<>();

    /**
     * Constructs a new {@code TableStats} for the given table.
     *
     * @param tableName The name of the table being tracked.
     */
    public TableStats(String tableName) {
        this.tableName = tableName;
        this.totalRows = 0;
    }

    /** Returns the table name. */
    public String getTableName() { return tableName; }

    /** Returns the current total row count. */
    public long getTotalRows() { return totalRows; }

    /**
     * Updates the total row count.
     * Enforces a minimum of 0 (row counts cannot be negative).
     *
     * @param totalRows New row count.
     */
    public void setTotalRows(long totalRows) {
        this.totalRows = Math.max(0, totalRows);
    }

    /**
     * Records the number of distinct values observed for a specific field.
     * Used by the CBO to estimate field selectivity.
     *
     * @param field         The field name.
     * @param distinctCount Number of distinct values observed (minimum 1).
     */
    public void recordDistinctValues(String field, long distinctCount) {
        distinctValuesCount.put(field, Math.max(1, distinctCount));
    }

    /**
     * Estimates selectivity for a field as the fraction of matching rows per query value.
     * Algorithm: selectivity = 1 / distinct_values (uniform distribution assumption).
     * Returns 0.5 if no cardinality data is available (conservative default).
     *
     * @param field The field name to estimate selectivity for.
     * @return Selectivity fraction in range (0, 1].
     */
    public double estimateSelectivity(String field) {
        if (totalRows == 0) return 1.0;
        Long distinct = distinctValuesCount.get(field);
        if (distinct == null || distinct == 0) {
            return 0.5; // Default: assume 50% selectivity when stats unavailable
        }
        return Math.min(1.0, 1.0 / distinct);
    }

    /**
     * Estimates the I/O cost of executing a query using either an index or a full table scan.
     *
     * <p>Cost model:
     * <ul>
     *   <li>Index scan cost = O(log N) tree traversal + selectivity * N result fetches.</li>
     *   <li>Full scan cost = O(N) sequential leaf page reads.</li>
     * </ul>
     * </p>
     *
     * @param useIndex Whether to estimate index scan cost (true) or full scan cost (false).
     * @param field    The index field name (used for selectivity estimation, nullable for full scan).
     * @return Estimated cost in abstract I/O units.
     */
    public double estimateCost(boolean useIndex, String field) {
        if (totalRows == 0) return 0.0;

        if (useIndex) {
            // Index scan: O(log N) B+ Tree traversal + matching rows retrieval
            double logN = Math.log(totalRows) / Math.log(2);
            double selectivity = estimateSelectivity(field);
            return logN + (selectivity * totalRows);
        } else {
            // Full table scan: O(N) sequential page reads
            return totalRows;
        }
    }
}
