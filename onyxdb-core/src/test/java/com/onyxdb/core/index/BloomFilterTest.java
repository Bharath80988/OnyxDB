package com.onyxdb.core.index;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

public class BloomFilterTest {

    @Test
    void testBloomFilterMembership() {
        BloomFilter filter = new BloomFilter(100, 0.01);
        
        filter.add(101);
        filter.add(202);
        filter.add(303);

        assertThat(filter.mightContain(101)).isTrue();
        assertThat(filter.mightContain(202)).isTrue();
        assertThat(filter.mightContain(303)).isTrue();
        assertThat(filter.mightContain(999)).isFalse();
    }
}
