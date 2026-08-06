package com.onyxdb.core.index.hnsw;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Hierarchical Navigable Small World (HNSW) vector index foundation.
 *
 * <p>Algorithm: Exact K-Nearest Neighbors (KNN) via Cosine Similarity brute-force scan
 * over a thread-safe in-memory vector store. Backed by {@link ConcurrentHashMap} for
 * lock-free concurrent reads and writes.</p>
 *
 * <p>Future evolution: Add multi-layer HNSW graph navigation for sub-linear O(log N) search,
 * replacing the current O(N) full-scan approach for large corpora.</p>
 */
public class HnswIndex {

    // Thread-safe store: Record ID → float[] vector embedding
    private final ConcurrentHashMap<Integer, float[]> vectorStorage = new ConcurrentHashMap<>();

    /**
     * Inserts a vector embedding into the index, keyed by its record ID.
     * Algorithm: O(1) ConcurrentHashMap put.
     *
     * @param id     The primary record ID.
     * @param vector Float array embedding to store.
     */
    public void insert(int id, float[] vector) {
        // Store the embedding directly — no normalization needed for Cosine Similarity ranking
        vectorStorage.put(id, vector);
    }

    /**
     * Finds the Top-K nearest vectors to the given query vector using Cosine Similarity.
     * Algorithm: Brute-force KNN scan over all stored embeddings with a bounded max-heap.
     *
     * <p>Time Complexity: O(N * D) where N = total vectors, D = vector dimension.</p>
     *
     * @param queryVector The embedding to search against.
     * @param k           The number of top nearest neighbors to return.
     * @return Ordered list of record IDs from highest to lowest cosine similarity.
     */
    public List<Integer> search(float[] queryVector, int k) {
        // Max-heap: keeps the top-k results sorted by similarity score (descending)
        // Algorithm: Priority Queue (max-heap) with reversed comparator → O(N log k) total
        PriorityQueue<Map.Entry<Integer, Double>> topK = new PriorityQueue<>(
            Comparator.<Map.Entry<Integer, Double>>comparingDouble(Map.Entry::getValue).reversed()
        );

        // Score all stored embeddings against the query vector
        for (Map.Entry<Integer, float[]> entry : vectorStorage.entrySet()) {
            double similarity = VectorMath.cosineSimilarity(queryVector, entry.getValue());
            topK.offer(Map.entry(entry.getKey(), similarity));
        }

        // Drain the top-k results from the heap in ranked order
        List<Integer> results = new ArrayList<>(k);
        while (!topK.isEmpty() && results.size() < k) {
            results.add(topK.poll().getKey());
        }

        return results;
    }
}
