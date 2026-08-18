package com.forgeql.core.storage;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class PageDefragTest {

    @Test
    public void testPageDefragmentation() {
        Page page = new Page(0);
        page.writeInt(1, 3); // numSlots = 3

        // Slot 0: Active record (id=1)
        int slot0Offset = 16;
        page.writeInt(slot0Offset, 1);
        page.getData()[slot0Offset + 4] = 'a';

        // Slot 1: Deleted / zeroed record
        int slot1Offset = 16 + 256;
        page.writeInt(slot1Offset, 0);

        // Slot 2: Active record (id=2)
        int slot2Offset = 16 + 512;
        page.writeInt(slot2Offset, 2);
        page.getData()[slot2Offset + 4] = 'b';

        // Run defrag
        int reclaimed = page.defrag();
        assertEquals(256, reclaimed);
        assertEquals(2, page.readInt(1)); // numSlots should now be 2
        assertTrue(page.isDirty());

        // Verify active record 2 was shifted up to slot 1
        assertEquals(2, page.readInt(16 + 256));
    }
}
