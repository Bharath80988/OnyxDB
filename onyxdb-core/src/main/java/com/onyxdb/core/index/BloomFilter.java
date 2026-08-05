package com.onyxdb.core.index;

import java.util.BitSet;

/**
 * Probabilistic Bloom Filter for fast O(1) membership checks to eliminate
 * unnecessary page lookups for missing keys.
 */
public class BloomFilter {
    private final BitSet bitSet;
    private final int bitSetSize;
    private final int numHashFunctions;
    private int elementCount;

    public BloomFilter(int expectedElements, double falsePositiveRate) {
        this.bitSetSize = Math.max(64, (int) Math.ceil((-expectedElements * Math.log(falsePositiveRate)) / (Math.log(2) * Math.log(2))));
        this.numHashFunctions = Math.max(1, (int) Math.round((double) bitSetSize / expectedElements * Math.log(2)));
        this.bitSet = new BitSet(bitSetSize);
        this.elementCount = 0;
    }

    public BloomFilter() {
        this(10000, 0.01);
    }

    private int[] getHashes(int key) {
        int[] hashes = new int[numHashFunctions];
        int h1 = key * 0x45d9f3b;
        h1 = (h1 ^ (h1 >>> 16)) * 0x45d9f3b;
        h1 = h1 ^ (h1 >>> 16);
        
        int h2 = key * 0x119de1f3;
        h2 = (h2 ^ (h2 >>> 16)) * 0x119de1f3;
        h2 = h2 ^ (h2 >>> 16);

        for (int i = 0; i < numHashFunctions; i++) {
            int combinedHash = h1 + i * h2;
            hashes[i] = Math.abs(combinedHash % bitSetSize);
        }
        return hashes;
    }

    public void add(int key) {
        for (int hash : getHashes(key)) {
            bitSet.set(hash);
        }
        elementCount++;
    }

    public boolean mightContain(int key) {
        for (int hash : getHashes(key)) {
            if (!bitSet.get(hash)) {
                return false;
            }
        }
        return true;
    }

    public int getElementCount() {
        return elementCount;
    }

    public void clear() {
        bitSet.clear();
        elementCount = 0;
    }
}
