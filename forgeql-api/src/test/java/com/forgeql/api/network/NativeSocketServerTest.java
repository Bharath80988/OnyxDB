package com.forgeql.api.network;

import com.forgeql.core.execution.ExecutionEngine;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

public class NativeSocketServerTest {

    @TempDir
    Path tempDir;

    private ForgeNativeSocketServer server;
    private int testPort = 8089;

    @BeforeEach
    void setUp() throws Exception {
        ExecutionEngine engine = new ExecutionEngine(tempDir);
        server = new ForgeNativeSocketServer(testPort, engine);
        Thread thread = new Thread(server);
        thread.setDaemon(true);
        thread.start();
        Thread.sleep(200); // Allow server to bind socket
    }

    @AfterEach
    void tearDown() {
        if (server != null) {
            server.stop();
        }
    }

    @Test
    void testTcpSocketInsertAndSelect() throws Exception {
        try (Socket socket = new Socket("localhost", testPort);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            // 1. Send Insert query over TCP socket
            String insertJson = "{\"action\":\"insert\",\"table\":\"products\",\"data\":{\"id\":10,\"name\":\"Gaming Mouse\",\"price\":49.99}}";
            out.println(insertJson);

            String response = in.readLine();
            assertNotNull(response);
            assertTrue(response.contains("Inserted 1 row."));

            // 2. Send Point Select query over TCP socket
            String selectJson = "{\"action\":\"select\",\"table\":\"products\",\"id\":10}";
            out.println(selectJson);

            String selectResponse = in.readLine();
            assertNotNull(selectResponse);
            assertTrue(selectResponse.contains("Gaming Mouse"));
        }
    }
}
