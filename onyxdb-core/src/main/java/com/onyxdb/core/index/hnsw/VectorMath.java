package com.onyxdb.core.index.hnsw;

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
     * Algorithm: Fused single-pass Cosine Similarity.
     * Computes dot product, L2 norm of A, and L2 norm of B in one loop
     * to minimize memory reads and maximize CPU cache efficiency.
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

        // Single-pass fused loop: compute dot product and both L2 norms simultaneously
        double dot = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < a.length; i++) {
            dot   += (double) a[i] * b[i];   // accumulate dot product
            normA += (double) a[i] * a[i];   // accumulate squared norm of A
            normB += (double) b[i] * b[i];   // accumulate squared norm of B
        }

        // Guard against zero-length vectors (undefined angle)
        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        // Cosine Similarity = dot(A, B) / (||A|| * ||B||)
        return dot / Math.sqrt(normA * normB);
    }
}
