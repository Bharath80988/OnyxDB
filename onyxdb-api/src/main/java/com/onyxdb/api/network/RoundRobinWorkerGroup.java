package com.onyxdb.api.network;

import com.onyxdb.core.execution.ExecutionEngine;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.SocketChannel;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * High-performance Multi-Reactor Event Loop Worker Group using a Round-Robin load-balancing algorithm.
 * Socket channels accepted by the main reactor are distributed evenly across CPU worker threads.
 */
public class RoundRobinWorkerGroup {
    private static final Logger log = LoggerFactory.getLogger(RoundRobinWorkerGroup.class);
    private final WorkerThread[] workers;
    private final AtomicInteger nextWorkerIndex = new AtomicInteger(0);
    private final ExecutionEngine executionEngine;
    private final ObjectMapper mapper = new ObjectMapper();

    public RoundRobinWorkerGroup(int poolSize, ExecutionEngine executionEngine) throws IOException {
        this.executionEngine = executionEngine;
        this.workers = new WorkerThread[poolSize];
        for (int i = 0; i < poolSize; i++) {
            workers[i] = new WorkerThread("Onyx-NIO-Worker-" + i);
            workers[i].start();
        }
        log.info("Initialized RoundRobinWorkerGroup with {} worker event loops", poolSize);
    }

    /**
     * Assigns a newly accepted socket channel to a worker thread using Round-Robin scheduling.
     */
    public void registerChannel(SocketChannel channel) {
        int idx = Math.abs(nextWorkerIndex.getAndIncrement() % workers.length);
        WorkerThread worker = workers[idx];
        log.debug("Round-Robin assigned channel {} to worker thread '{}'", channel, worker.getName());
        worker.addChannel(channel);
    }

    public void stop() {
        for (WorkerThread worker : workers) {
            worker.shutdown();
        }
    }

    private class WorkerThread extends Thread {
        private final Selector selector;
        private final ConcurrentLinkedQueue<SocketChannel> pendingChannels = new ConcurrentLinkedQueue<>();
        private volatile boolean running = true;

        public WorkerThread(String name) throws IOException {
            super(name);
            this.selector = Selector.open();
        }

        public void addChannel(SocketChannel channel) {
            pendingChannels.add(channel);
            selector.wakeup();
        }

        public void shutdown() {
            this.running = false;
            selector.wakeup();
        }

        @Override
        public void run() {
            while (running) {
                try {
                    // Register any newly assigned channels
                    SocketChannel newChannel;
                    while ((newChannel = pendingChannels.poll()) != null) {
                        newChannel.configureBlocking(false);
                        newChannel.register(selector, SelectionKey.OP_READ);
                    }

                    int ready = selector.select(100);
                    if (ready == 0) continue;

                    Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
                    while (keys.hasNext()) {
                        SelectionKey key = keys.next();
                        keys.remove();

                        if (!key.isValid()) continue;

                        if (key.isReadable()) {
                            readQuery(key);
                        }
                    }
                } catch (Exception e) {
                    log.error("Error in worker thread {}", getName(), e);
                }
            }
            try {
                selector.close();
            } catch (IOException ignored) {}
        }

        @SuppressWarnings("unchecked")
        private void readQuery(SelectionKey key) {
            SocketChannel channel = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocateDirect(4096);

            try {
                int bytesRead = channel.read(buffer);
                if (bytesRead == -1) {
                    channel.close();
                    return;
                }

                buffer.flip();
                
                // Attempt to decode Onyx Wire Protocol (OWP) binary frame
                com.onyxdb.core.execution.OnyxWireProtocol.Frame owpFrame = com.onyxdb.core.execution.OnyxWireProtocol.decode(buffer);
                if (owpFrame != null) {
                    log.debug("Received OWP binary frame type 0x{}", Integer.toHexString(owpFrame.getMsgType()));
                    String payload = owpFrame.getPayload();
                    List<String> results;
                    if (payload.trim().startsWith("{")) {
                        Map<String, Object> queryNode = mapper.readValue(payload, Map.class);
                        results = executionEngine.execute(queryNode);
                    } else {
                        results = executionEngine.execute(payload);
                    }
                    String responsePayload = mapper.writeValueAsString(results);
                    ByteBuffer writeBuf = com.onyxdb.core.execution.OnyxWireProtocol.encode(com.onyxdb.core.execution.OnyxWireProtocol.MSG_RESPONSE, responsePayload);
                    while (writeBuf.hasRemaining()) {
                        channel.write(writeBuf);
                    }
                    return;
                }

                // Fallback to legacy UTF-8 text framing
                buffer.rewind();
                byte[] bytes = new byte[buffer.remaining()];
                buffer.get(bytes);
                String jsonQueryStr = new String(bytes, StandardCharsets.UTF_8).trim();

                if (jsonQueryStr.isEmpty()) return;

                log.debug("Received TCP socket query: {}", jsonQueryStr);
                List<String> results;
                if (jsonQueryStr.startsWith("{")) {
                    Map<String, Object> queryNode = mapper.readValue(jsonQueryStr, Map.class);
                    results = executionEngine.execute(queryNode);
                } else {
                    results = executionEngine.execute(jsonQueryStr);
                }

                String jsonResponse = mapper.writeValueAsString(results) + "\n";
                ByteBuffer writeBuf = ByteBuffer.wrap(jsonResponse.getBytes(StandardCharsets.UTF_8));
                while (writeBuf.hasRemaining()) {
                    channel.write(writeBuf);
                }
            } catch (Exception e) {
                log.error("Failed to process TCP socket query", e);
                try {
                    String errResponse = "{\"error\":\"" + e.getMessage() + "\"}\n";
                    channel.write(ByteBuffer.wrap(errResponse.getBytes(StandardCharsets.UTF_8)));
                } catch (IOException ignored) {}
            }
        }
    }
}
