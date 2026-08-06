package com.onyxdb.core.index;

import java.util.BitSet;

/**
 * Probabilistic Bloom Filter for fast O(1) membership checking.
 *
 * <p>Algorithm: Double-hashing scheme (Kirsch-Mitzenmacher optimization).
 * Two independent hash functions h1 and h2 are composed as:
 *   hash_i(key) = h1(key) + i * h2(key)
 * to generate k independent hash positions without k separate hash computations.
 * This achieves near-optimal false-positive rates with minimal CPU overhead.</p>
 *
 * <p>Purpose: Eliminates unnecessary B+ Tree page lookups for missing keys.
 * If {@link #mightContain} returns false, the key is definitely not in the index.</p>
 */
public class BloomFilter {

    // Bit array storing the bloom filter state
    private final BitSet bitSet;

    // Total number of bit positions in the filter (m)
    private final int bitSetSize;

    // Number of hash functions applied per key (k)
    private final int numHashFunctions;

    // Running count of inserted elements
    private int elementCount;

    /**
     * Constructs a Bloom Filter sized optimally for the expected element count and false positive rate.
     *
     * <p>Algorithm for optimal bit count (m):
     *   m = ceil(-(n * ln(p)) / (ln(2)^2))
     * Algorithm for optimal hash count (k):
     *   k = round((m / n) * ln(2))</p>
     *
     * @param expectedElements  Expected number of elements to be inserted (n).
     * @param falsePositiveRate Target false positive probability (p), e.g. 0.01 = 1%.
     */
    public BloomFilter(int expectedElements, double falsePositiveRate) {
        // Compute optimal bit array size
        this.bitSetSize = Math.max(64,
            (int) Math.ceil((-expectedElements * Math.log(falsePositiveRate)) / (Math.log(2) * Math.log(2))));

        // Compute optimal number of hash functions
        this.numHashFunctions = Math.max(1,
            (int) Math.round((double) bitSetSize / expectedElements * Math.log(2)));

        this.bitSet = new BitSet(bitSetSize);
        this.elementCount = 0;
    }

    /**
     * Creates a default Bloom Filter sized for 10,000 elements at 1% false positive rate.
     */
    public BloomFilter() {
        this(10_000, 0.01);
    }

    /**
     * Generates k bit positions for a given integer key.
     * Algorithm: Kirsch-Mitzenmacher double-hash — two Wang integer hash variants
     * composed linearly to produce k independent bit positions.
     *
     * @param key Integer key to hash.
     * @return Array of k bit positions in range [0, bitSetSize).
     */
    private int[] getHashes(int key) {
        // Wang hash h1: scrambles bits via multiply-xorshift
        int h1 = key * 0x45d9f3b;
        h1 = (h1 ^ (h1 >>> 16)) * 0x45d9f3b;
        h1 = h1 ^ (h1 >>> 16);

        // Wang hash h2: second independent scramble
        int h2 = key * 0x119de1f3;
        h2 = (h2 ^ (h2 >>> 16)) * 0x119de1f3;
        h2 = h2 ^ (h2 >>> 16);

        // Produce k positions via linear combination: hash_i = h1 + i * h2
        int[] hashes = new int[numHashFunctions];
        for (int i = 0; i < numHashFunctions; i++) {
            hashes[i] = Math.abs((h1 + i * h2) % bitSetSize);
        }
        return hashes;
    }

    /**
     * Adds a key to the filter by setting all k hash bit positions.
     *
     * @param key Integer key (typically a record primary ID).
     */
    public void add(int key) {
        for (int hash : getHashes(key)) {
            bitSet.set(hash);
        }
        elementCount++;
    }

    /**
     * Tests whether a key might be in the filter.
     * Returns false = key is DEFINITELY absent (no false negatives).
     * Returns true = key PROBABLY exists (false positive possible).
     *
     * @param key Integer key to test.
     * @return true if all k hash bits are set, false if any bit is unset.
     */
    public boolean mightContain(int key) {
        for (int hash : getHashes(key)) {
            if (!bitSet.get(hash)) {
                return false; // Definitive absence — short-circuit
            }
        }
        return true;
    }

    /** Returns the number of elements inserted into the filter. */
    public int getElementCount() {
        return elementCount;
    }

    /** Resets the Bloom Filter to an empty state. */
    public void clear() {
        bitSet.clear();
        elementCount = 0;
    }
}
