package com.onyxdb.core.execution;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Cost-Based Query Optimizer (CBO) evaluating execution plan costs between
 * Primary B+ Tree point lookups, Secondary Index scans, and Sequential Table scans.
 */
public class QueryOptimizer {
    private static final Logger log = LoggerFactory.getLogger(QueryOptimizer.class);

    public static enum PlanType {
        POINT_LOOKUP,
        SECONDARY_INDEX_SCAN,
        FULL_TABLE_SCAN
    }

    public static class ExecutionPlan {
        private final PlanType planType;
        private final String targetField;
        private final double estimatedCost;

        public ExecutionPlan(PlanType planType, String targetField, double estimatedCost) {
            this.planType = planType;
            this.targetField = targetField;
            this.estimatedCost = estimatedCost;
        }

        public PlanType getPlanType() {
            return planType;
        }

        public String getTargetField() {
            return targetField;
        }

        public double getEstimatedCost() {
            return estimatedCost;
        }

        @Override
        public String toString() {
            return "ExecutionPlan{" +
                    "planType=" + planType +
                    ", targetField='" + targetField + '\'' +
                    ", estimatedCost=" + estimatedCost +
                    '}';
        }
    }

    public ExecutionPlan chooseBestPlan(TableStats stats, boolean hasPrimaryKey, boolean hasSecondaryIndex, String indexField) {
        if (hasPrimaryKey) {
            double cost = Math.log(Math.max(1, stats.getTotalRows())) / Math.log(2);
            log.debug("CBO selected POINT_LOOKUP plan (Cost: {})", cost);
            return new ExecutionPlan(PlanType.POINT_LOOKUP, "id", cost);
        }

        if (hasSecondaryIndex && indexField != null) {
            double indexCost = stats.estimateCost(true, indexField);
            double scanCost = stats.estimateCost(false, indexField);

            if (indexCost < scanCost) {
                log.debug("CBO selected SECONDARY_INDEX_SCAN plan on field '{}' (Cost: {} vs Scan: {})", indexField, indexCost, scanCost);
                return new ExecutionPlan(PlanType.SECONDARY_INDEX_SCAN, indexField, indexCost);
            }
        }

        double scanCost = stats.estimateCost(false, null);
        log.debug("CBO selected FULL_TABLE_SCAN plan (Cost: {})", scanCost);
        return new ExecutionPlan(PlanType.FULL_TABLE_SCAN, null, scanCost);
    }
}
