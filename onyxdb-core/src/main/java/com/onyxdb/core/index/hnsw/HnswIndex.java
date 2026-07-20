package com.onyxdb.core.index.hnsw;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Foundation for the Hierarchical Navigable Small World (HNSW) graph.
 * Currently implements a flat Exact K-Nearest Neighbors (KNN) search as the base layer.
 * Future iterations will add multi-layer navigable graphs for sub-linear search.
 */
public class HnswIndex {
    
    // Map of Record ID -> Vector Embedding
    private final ConcurrentHashMap<Integer, float[]> vectorStorage = new ConcurrentHashMap<>();

    /**
     * Inserts a vector into the index.
     * @param id The record ID
     * @param vector The float array embedding
     */
    public void insert(int id, float[] vector) {
        vectorStorage.put(id, vector);
    }

    /**
     * Searches for the Top K nearest neighbors to the query vector.
     * @param queryVector The embedding to search for
     * @param k The number of results to return
     * @return List of matching Record IDs, sorted by closest distance
     */
    public List<Integer> search(float[] queryVector, int k) {
        // PriorityQueue to keep track of the top K closest vectors.
        // Sorted by similarity (highest similarity first).
        PriorityQueue<Map.Entry<Integer, Double>> topK = new PriorityQueue<>(
            Comparator.<Map.Entry<Integer, Double>>comparingDouble(Map.Entry::getValue).reversed()
        );

        for (Map.Entry<Integer, float[]> entry : vectorStorage.entrySet()) {
            double similarity = VectorMath.cosineSimilarity(queryVector, entry.getValue());
            topK.offer(Map.entry(entry.getKey(), similarity));
        }

        List<Integer> results = new ArrayList<>();
        while (!topK.isEmpty() && results.size() < k) {
            results.add(topK.poll().getKey());
        }

        return results;
    }
}
