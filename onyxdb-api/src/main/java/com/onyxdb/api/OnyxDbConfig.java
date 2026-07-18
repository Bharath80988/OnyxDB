package com.onyxdb.api;

import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.StorageManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class OnyxDbConfig {

    @Bean
    public StorageManager storageManager(@org.springframework.beans.factory.annotation.Value("${db.storage.path:${user.home}/OnyxDB/database}") String dbPath) throws IOException {
        Path dbDir = Paths.get(dbPath.replace("${user.home}", System.getProperty("user.home")));
        Files.createDirectories(dbDir);
        
        Path dataFile = dbDir.resolve("onyx.db");
        return new StorageManager(dataFile);
    }

    @Bean
    public BufferPool bufferPool(StorageManager storageManager) {
        // Cache 1024 pages (8 MB)
        return new BufferPool(1024, storageManager);
    }

    @Bean
    public com.onyxdb.core.index.BTreeManager bTreeManager(BufferPool bufferPool) throws IOException {
        return new com.onyxdb.core.index.BTreeManager(bufferPool);
    }

    @Bean
    public com.onyxdb.core.execution.ExecutionEngine executionEngine(com.onyxdb.core.index.BTreeManager bTreeManager) {
        return new com.onyxdb.core.execution.ExecutionEngine(bTreeManager);
    }
}
