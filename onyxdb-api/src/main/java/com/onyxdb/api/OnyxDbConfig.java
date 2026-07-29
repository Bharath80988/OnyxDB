package com.onyxdb.api;

import com.onyxdb.api.network.OnyxNativeSocketServer;
import com.onyxdb.core.execution.ExecutionEngine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class OnyxDbConfig {

    @Bean
    public ExecutionEngine executionEngine(
            @Value("${db.storage.path:${user.home}/OnyxDB/database}") String dbPath
    ) throws IOException {
        Path dbDir = Paths.get(dbPath.replace("${user.home}", System.getProperty("user.home")));
        Files.createDirectories(dbDir);
        return new ExecutionEngine(dbDir);
    }

    @Bean(destroyMethod = "stop")
    public OnyxNativeSocketServer nativeSocketServer(ExecutionEngine executionEngine) throws IOException {
        OnyxNativeSocketServer server = new OnyxNativeSocketServer(8081, executionEngine);
        Thread serverThread = new Thread(server, "Onyx-NIO-SocketServer-Acceptor");
        serverThread.setDaemon(true);
        serverThread.start();
        return server;
    }
}
