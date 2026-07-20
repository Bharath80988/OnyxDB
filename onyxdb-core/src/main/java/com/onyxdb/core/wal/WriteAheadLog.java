package com.onyxdb.core.wal;

import java.io.EOFException;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Write-Ahead Log (WAL) for durability.
 * All changes must be appended here and fsync'd before being applied to the actual pages on disk.
 */
public class WriteAheadLog {
    private static final Logger log = LoggerFactory.getLogger(WriteAheadLog.class);
    private final FileChannel logChannel;
    private final Path logPath;
    private final ReentrantLock lock = new ReentrantLock();

    public WriteAheadLog(Path logPath) throws IOException {
        this.logPath = logPath;
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

    /**
     * Reads all log entries from the WAL for crash recovery.
     */
    public List<byte[]> readAllLogs() throws IOException {
        List<byte[]> entries = new ArrayList<>();
        lock.lock();
        try (FileChannel readChannel = FileChannel.open(logPath, StandardOpenOption.READ)) {
            ByteBuffer lengthBuffer = ByteBuffer.allocate(Integer.BYTES);
            while (true) {
                lengthBuffer.clear();
                int bytesRead = readChannel.read(lengthBuffer);
                if (bytesRead == -1) {
                    break; // EOF
                }
                if (bytesRead < Integer.BYTES) {
                    log.warn("Corrupted WAL entry length at position {}", readChannel.position());
                    break; 
                }
                
                lengthBuffer.flip();
                int length = lengthBuffer.getInt();
                if (length <= 0 || length > 1024 * 1024 * 100) { // arbitrary 100MB limit per entry
                    log.warn("Invalid WAL entry length: {}", length);
                    break;
                }

                ByteBuffer dataBuffer = ByteBuffer.allocate(length);
                while (dataBuffer.hasRemaining()) {
                    if (readChannel.read(dataBuffer) == -1) {
                        log.warn("Unexpected EOF while reading WAL entry data");
                        break;
                    }
                }
                if (dataBuffer.hasRemaining()) {
                    break; // corrupted
                }
                entries.add(dataBuffer.array());
            }
        } finally {
            lock.unlock();
        }
        return entries;
    }

    public void close() throws IOException {
        if (logChannel != null && logChannel.isOpen()) {
            logChannel.close();
        }
    }
}
