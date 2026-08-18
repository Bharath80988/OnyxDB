package com.forgeql.core.index.hnsw;

/**
 * Utility class for vector distance computations used in similarity search.
 *
 * <p>Implements Cosine Similarity for comparing high-dimensional vector embeddings.
 * Cosine Similarity measures the cosine of the angle between two vectors, ignoring magnitude.
 * Range: 1.0 (identical direction) → 0.0 (orthogonal) → -1.0 (opposite).</p>
 */
public class VectorMath {

    private VectorMath() {
        // Utility class — no instantiation
    }

    /**
     * Algorithm: Fused 4-way unrolled Cosine Similarity.
     * Computes dot product, L2 norm of A, and L2 norm of B in unrolled loops
     * to maximize instruction-level parallelism and CPU register pipeline utilization.
     *
     * @param a First vector embedding (float array).
     * @param b Second vector embedding (float array, must equal length of a).
     * @return Cosine similarity score in range [-1.0, 1.0].
     * @throws IllegalArgumentException if vector lengths differ.
     */
    public static double cosineSimilarity(float[] a, float[] b) {
        if (a.length != b.length) {
            throw new IllegalArgumentException("Vectors must be of equal dimension: " + a.length + " != " + b.length);
        }

        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        int len = a.length;
        int i = 0;
        // 4-way loop unrolling for SIMD vector instruction pipeline optimization
        for (; i <= len - 4; i += 4) {
            double a0 = a[i], b0 = b[i];
            double a1 = a[i + 1], b1 = b[i + 1];
            double a2 = a[i + 2], b2 = b[i + 2];
            double a3 = a[i + 3], b3 = b[i + 3];

            dot   += a0 * b0 + a1 * b1 + a2 * b2 + a3 * b3;
            normA += a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3;
            normB += b0 * b0 + b1 * b1 + b2 * b2 + b3 * b3;
        }

        // Tail loop for remaining elements
        for (; i < len; i++) {
            double ai = a[i];
            double bi = b[i];
            dot   += ai * bi;
            normA += ai * ai;
            normB += bi * bi;
        }

        // Guard against zero-length vectors (undefined angle)
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        // Cosine Similarity = dot(A, B) / (||A|| * ||B||)
        return dot / Math.sqrt(normA * normB);
    }
}
