package com.onyxdb.core.wal;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Write-Ahead Log (WAL) for durability.
 * All changes must be appended here and fsync'd before being applied to the actual pages on disk.
 */
public class WriteAheadLog {
    private final FileChannel logChannel;
    private final ReentrantLock lock = new ReentrantLock();

    public WriteAheadLog(Path logPath) throws IOException {
        this.logChannel = FileChannel.open(logPath, 
            StandardOpenOption.CREATE, 
            StandardOpenOption.WRITE, 
            StandardOpenOption.APPEND);
    }

    /**
     * Appends a log entry. Format: [Length (4 bytes)] [Data]
     */
    public void append(byte[] logData) throws IOException {
        lock.lock();
        try {
            ByteBuffer buffer = ByteBuffer.allocate(Integer.BYTES + logData.length);
            buffer.putInt(logData.length);
            buffer.put(logData);
            buffer.flip();
            
            while (buffer.hasRemaining()) {
                logChannel.write(buffer);
            }
            // Force write to disk for durability (fsync)
            logChannel.force(false);
        } finally {
            lock.unlock();
        }
    }

    public void close() throws IOException {
        if (logChannel != null && logChannel.isOpen()) {
            logChannel.close();
        }
    }
}
