package com.onyxdb.core.execution;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Cost-Based Query Optimizer (CBO) for selecting the lowest-cost execution plan.
 *
 * <p>Algorithm: Rule-based cost evaluation with I/O cost model:
 * <ol>
 *   <li>Primary Key Point Lookup: O(log N) — always cheapest when ID is available.</li>
 *   <li>Secondary Index Scan: O(log N) + selectivity * N — preferred over full scan when index is selective.</li>
 *   <li>Full Table Scan: O(N) — fallback when no applicable index exists.</li>
 * </ol>
 * </p>
 */
public class QueryOptimizer {
    private static final Logger log = LoggerFactory.getLogger(QueryOptimizer.class);

    /**
     * The type of execution plan chosen by the optimizer.
     */
    public enum PlanType {
        /** O(log N) primary key B+ Tree lookup. */
        POINT_LOOKUP,
        /** O(log N + selectivity * N) secondary index scan. */
        SECONDARY_INDEX_SCAN,
        /** O(N) sequential leaf page scan. */
        FULL_TABLE_SCAN
    }

    /**
     * Represents the selected execution plan with its cost estimate.
     */
    public static class ExecutionPlan {
        private final PlanType planType;
        private final String targetField;
        private final double estimatedCost;

        public ExecutionPlan(PlanType planType, String targetField, double estimatedCost) {
            this.planType = planType;
            this.targetField = targetField;
            this.estimatedCost = estimatedCost;
        }

        public PlanType getPlanType() { return planType; }
        public String getTargetField() { return targetField; }
        public double getEstimatedCost() { return estimatedCost; }

        @Override
        public String toString() {
            return "ExecutionPlan{planType=" + planType
                + ", targetField='" + targetField + '\''
                + ", estimatedCost=" + String.format("%.2f", estimatedCost) + '}';
        }
    }

    /**
     * Selects the optimal execution plan for a query.
     *
     * <p>Decision order:
     * <ol>
     *   <li>If primary key available → POINT_LOOKUP (always optimal).</li>
     *   <li>If secondary index available AND index cost less than scan cost → SECONDARY_INDEX_SCAN.</li>
     *   <li>Otherwise → FULL_TABLE_SCAN.</li>
     * </ol>
     * </p>
     *
     * @param stats             Live table statistics for cost estimation.
     * @param hasPrimaryKey     Whether the query specifies a primary key ID.
     * @param hasSecondaryIndex Whether a secondary index exists for the query field.
     * @param indexField        The secondary index field name (nullable).
     * @return The lowest-cost {@link ExecutionPlan}.
     */
    public ExecutionPlan chooseBestPlan(TableStats stats, boolean hasPrimaryKey,
                                        boolean hasSecondaryIndex, String indexField) {
        // Rule 1: Primary key point lookup — always O(log N), cheapest possible
        if (hasPrimaryKey) {
            double cost = Math.log(Math.max(1, stats.getTotalRows())) / Math.log(2);
            log.debug("CBO: POINT_LOOKUP selected (Cost: {:.2f})", cost);
            return new ExecutionPlan(PlanType.POINT_LOOKUP, "id", cost);
        }

        // Rule 2: Secondary index scan — compare against full table scan cost
        if (hasSecondaryIndex && indexField != null) {
            double indexCost = stats.estimateCost(true, indexField);
            double scanCost  = stats.estimateCost(false, indexField);

            if (indexCost < scanCost) {
                log.debug("CBO: SECONDARY_INDEX_SCAN on '{}' selected (IndexCost: {:.2f} < ScanCost: {:.2f})",
                    indexField, indexCost, scanCost);
                return new ExecutionPlan(PlanType.SECONDARY_INDEX_SCAN, indexField, indexCost);
            }
        }

        // Rule 3: Fallback to sequential full table scan
        double scanCost = stats.estimateCost(false, null);
        log.debug("CBO: FULL_TABLE_SCAN selected (Cost: {:.2f})", scanCost);
        return new ExecutionPlan(PlanType.FULL_TABLE_SCAN, null, scanCost);
    }
}
