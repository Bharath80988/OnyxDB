package com.onyxdb.core.execution;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Maintains table statistics (row counts, column cardinality, selectivity estimates)
 * used by the Cost-Based Query Optimizer (CBO).
 */
public class TableStats {
    private final String tableName;
    private long totalRows;
    private final Map<String, Long> distinctValuesCount = new ConcurrentHashMap<>();

    public TableStats(String tableName) {
        this.tableName = tableName;
        this.totalRows = 0;
    }

    public String getTableName() {
        return tableName;
    }

    public long getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(long totalRows) {
        this.totalRows = Math.max(0, totalRows);
    }

    public void recordDistinctValues(String field, long distinctCount) {
        distinctValuesCount.put(field, Math.max(1, distinctCount));
    }

    public double estimateSelectivity(String field) {
        if (totalRows == 0) return 1.0;
        Long distinct = distinctValuesCount.get(field);
        if (distinct == null || distinct == 0) {
            return 0.5; // Default selectivity estimate
        }
        return Math.min(1.0, 1.0 / distinct);
    }

    public double estimateCost(boolean useIndex, String field) {
        if (totalRows == 0) return 0.0;
        if (useIndex) {
            // Index lookup cost: O(log N) + selectivity * totalRows
            double logN = Math.log(totalRows) / Math.log(2);
            double selectivity = estimateSelectivity(field);
            return logN + (selectivity * totalRows);
        } else {
            // Full table scan cost: totalRows
            return totalRows;
        }
    }
}
