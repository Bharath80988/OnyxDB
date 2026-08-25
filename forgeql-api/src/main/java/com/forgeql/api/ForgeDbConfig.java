package com.forgeql.api;

import com.forgeql.api.network.ForgeNativeSocketServer;
import com.forgeql.core.execution.ExecutionEngine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class ForgeDbConfig {

    @Bean
    public ExecutionEngine executionEngine(
            @Value("${db.storage.path:${user.home}/ForgeQL/database}") String dbPath
    ) throws IOException {
        Path dbDir = Paths.get(dbPath.replace("${user.home}", System.getProperty("user.home")));
        Files.createDirectories(dbDir);
        return new ExecutionEngine(dbDir);
    }

    @Bean(destroyMethod = "stop")
    public ForgeNativeSocketServer nativeSocketServer(ExecutionEngine executionEngine) throws IOException {
        ForgeNativeSocketServer server = new ForgeNativeSocketServer(8081, executionEngine);
        Thread serverThread = new Thread(server, "Forge-NIO-SocketServer-Acceptor");
        serverThread.setDaemon(true);
        serverThread.start();
        return server;
    }
}
