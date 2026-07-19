package com.onyxdb.api;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class OnyxDbConfig {

    @Bean
    public com.onyxdb.core.execution.ExecutionEngine executionEngine(
            @org.springframework.beans.factory.annotation.Value("${db.storage.path:${user.home}/OnyxDB/database}") String dbPath
    ) throws IOException {
        Path dbDir = Paths.get(dbPath.replace("${user.home}", System.getProperty("user.home")));
        Files.createDirectories(dbDir);
        
        // Pass the directory to ExecutionEngine so it can manage multiple table files (.db) inside it
        return new com.onyxdb.core.execution.ExecutionEngine(dbDir);
    }
}
