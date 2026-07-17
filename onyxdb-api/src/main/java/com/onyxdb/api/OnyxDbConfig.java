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
    public StorageManager storageManager() throws IOException {
        Path dbDir = Paths.get(System.getProperty("user.home"), "OnyxDB", "database");
        Files.createDirectories(dbDir);
        
        Path dataFile = dbDir.resolve("onyx.db");
        return new StorageManager(dataFile);
    }

    @Bean
    public BufferPool bufferPool(StorageManager storageManager) {
        // Cache 1024 pages (8 MB)
        return new BufferPool(1024, storageManager);
    }
}
