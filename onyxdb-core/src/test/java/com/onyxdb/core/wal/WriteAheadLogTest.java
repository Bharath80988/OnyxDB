package com.onyxdb.core.wal;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class WriteAheadLogTest {
    private Path tempWalFile;
    private WriteAheadLog wal;

    @BeforeEach
    void setUp() throws IOException {
        tempWalFile = Files.createTempFile("onyxdb_wal", ".log");
        wal = new WriteAheadLog(tempWalFile);
    }

    @AfterEach
    void tearDown() throws IOException {
        wal.close();
        Files.deleteIfExists(tempWalFile);
    }

    @Test
    void testAppend() throws IOException {
        byte[] logEntry1 = "INSERT INTO users VALUES (1, 'Alice')".getBytes();
        byte[] logEntry2 = "INSERT INTO users VALUES (2, 'Bob')".getBytes();
        
        wal.append(logEntry1);
        wal.append(logEntry2);
        
        assertThat(Files.size(tempWalFile)).isGreaterThan(0);
    }
}
