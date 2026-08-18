package com.forgeql.api.network;

import com.forgeql.core.execution.ExecutionEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;

/**
 * Non-Blocking Native TCP Socket Server (`ForgeNativeSocketServer`).
 * Bypasses HTTP REST servlet overhead running on port `8081` with Round-Robin worker load balancing.
 */
public class ForgeNativeSocketServer implements Runnable {
    private static final Logger log = LoggerFactory.getLogger(ForgeNativeSocketServer.class);
    private final int port;
    private final RoundRobinWorkerGroup workerGroup;
    private ServerSocketChannel serverChannel;
    private Selector acceptorSelector;
    private volatile boolean running = true;

    public ForgeNativeSocketServer(int port, ExecutionEngine executionEngine) throws IOException {
        this.port = port;
        int workerCount = Math.max(2, Runtime.getRuntime().availableProcessors());
        this.workerGroup = new RoundRobinWorkerGroup(workerCount, executionEngine);
    }

    @Override
    public void run() {
        try {
            acceptorSelector = Selector.open();
            serverChannel = ServerSocketChannel.open();
            serverChannel.configureBlocking(false);
            serverChannel.bind(new InetSocketAddress(port));
            serverChannel.register(acceptorSelector, SelectionKey.OP_ACCEPT);

            log.info("🚀 ForgeNativeSocketServer (Zero-Copy Non-Blocking NIO) running on port {}", port);

            while (running) {
                int ready = acceptorSelector.select(200);
                if (ready == 0) continue;

                Iterator<SelectionKey> keys = acceptorSelector.selectedKeys().iterator();
                while (keys.hasNext()) {
                    SelectionKey key = keys.next();
                    keys.remove();

                    if (key.isValid() && key.isAcceptable()) {
                        SocketChannel clientChannel = serverChannel.accept();
                        if (clientChannel != null) {
                            log.debug("Accepted new TCP connection from {}", clientChannel.getRemoteAddress());
                            workerGroup.registerChannel(clientChannel);
                        }
                    }
                }
            }
        } catch (IOException e) {
            if (running) {
                log.error("Error in ForgeNativeSocketServer acceptor loop", e);
            }
        } finally {
            stop();
        }
    }

    public void stop() {
        this.running = false;
        if (workerGroup != null) {
            workerGroup.stop();
        }
        if (serverChannel != null && serverChannel.isOpen()) {
            try {
                serverChannel.close();
            } catch (IOException ignored) {}
        }
        if (acceptorSelector != null && acceptorSelector.isOpen()) {
            try {
                acceptorSelector.close();
            } catch (IOException ignored) {}
        }
        log.info("ForgeNativeSocketServer stopped.");
    }
}
