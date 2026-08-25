package com.forgeql.core.execution;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

/**
 * Forge Wire Protocol (OWP) — compact binary framing protocol for NIO TCP socket communication.
 *
 * <p>OWP Frame Layout (9-byte header + payload):
 * <pre>
 * +-------------------+------------------+-------------------------+------------------+
 * | Magic  (4 bytes)  | MsgType (1 byte) | PayloadLength (4 bytes) | Payload (N bytes)|
 * | 0x4F4E5958 "FORGE" | 0x01/0x02/0x03   | unsigned int32 BE       | UTF-8 encoded    |
 * +-------------------+------------------+-------------------------+------------------+
 * </pre>
 * </p>
 *
 * <p>Message Types:
 * <ul>
 *   <li>{@code 0x01} MSG_QUERY — Client sends an FQL string or JSON query payload.</li>
 *   <li>{@code 0x02} MSG_RESPONSE — Server sends JSON result array payload.</li>
 *   <li>{@code 0x03} MSG_EXPLAIN — Client requests CBO plan output for a query.</li>
 * </ul>
 * </p>
 *
 * <p>Backwards compatibility: The TCP worker ({@code RoundRobinWorkerGroup}) auto-detects
 * OWP frames by inspecting the magic header. Non-OWP streams fall back to UTF-8 JSON text.</p>
 */
public class ForgeWireProtocol {

    // ─── Protocol Constants ───────────────────────────────────────────────────────

    /** Magic 4-byte header "FORGE" in big-endian hex: 0x4F4E5958. */
    public static final int MAGIC_HEADER = 0x4F4E5958;

    /** Total fixed header size: 4B magic + 1B type + 4B length = 9 bytes. */
    public static final int HEADER_SIZE = 9;

    // ─── Message Type Constants ───────────────────────────────────────────────────

    /** OWP message type: client query (FQL string or JSON payload). */
    public static final byte MSG_QUERY   = 0x01;

    /** OWP message type: server response (JSON result array). */
    public static final byte MSG_RESPONSE = 0x02;

    /** OWP message type: EXPLAIN cost profiler query. */
    public static final byte MSG_EXPLAIN  = 0x03;

    private ForgeWireProtocol() {
        // Static utility class — not instantiable
    }

    // ─── Decoded Frame ────────────────────────────────────────────────────────────

    /**
     * A fully decoded OWP frame containing the message type and UTF-8 payload string.
     */
    public static class Frame {
        private final byte msgType;
        private final String payload;

        public Frame(byte msgType, String payload) {
            this.msgType = msgType;
            this.payload = payload != null ? payload : "";
        }

        /** Returns the 1-byte message type code. */
        public byte getMsgType() { return msgType; }

        /** Returns the decoded UTF-8 payload string. */
        public String getPayload() { return payload; }
    }

    // ─── Encoding ─────────────────────────────────────────────────────────────────

    /**
     * Encodes a message into an OWP binary frame ready for NIO write.
     * Algorithm: Allocate (HEADER_SIZE + payload bytes) → write big-endian header → append payload.
     *
     * @param msgType One of {@link #MSG_QUERY}, {@link #MSG_RESPONSE}, or {@link #MSG_EXPLAIN}.
     * @param payload UTF-8 message body string.
     * @return Flipped ByteBuffer containing the complete OWP frame.
     */
    public static ByteBuffer encode(byte msgType, String payload) {
        byte[] bytes = payload != null ? payload.getBytes(StandardCharsets.UTF_8) : new byte[0];

        // Allocate header + payload in one contiguous buffer
        ByteBuffer buffer = ByteBuffer.allocate(HEADER_SIZE + bytes.length);
        buffer.putInt(MAGIC_HEADER);    // 4 bytes: magic
        buffer.put(msgType);            // 1 byte:  message type
        buffer.putInt(bytes.length);    // 4 bytes: payload length
        buffer.put(bytes);              // N bytes: UTF-8 payload
        buffer.flip();
        return buffer;
    }

    // ─── Decoding ─────────────────────────────────────────────────────────────────

    /**
     * Attempts to decode an OWP binary frame from the given ByteBuffer.
     * Algorithm: Inspect magic header → read type and length → extract payload.
     * Uses buffer.mark()/reset() to restore position if the frame is incomplete.
     *
     * @param buffer ByteBuffer positioned at the start of an incoming TCP frame.
     * @return Decoded {@link Frame}, or {@code null} if the buffer does not contain a valid OWP frame.
     */
    public static Frame decode(ByteBuffer buffer) {
        // Guard: need at minimum HEADER_SIZE bytes to inspect a frame
        if (buffer.remaining() < HEADER_SIZE) {
            return null;
        }

        buffer.mark(); // Save position for rollback

        // Verify magic header — confirms this is an OWP frame
        int magic = buffer.getInt();
        if (magic != MAGIC_HEADER) {
            buffer.reset(); // Not an OWP frame — restore position for fallback JSON decoding
            return null;
        }

        // Read frame header fields
        byte msgType = buffer.get();
        int length   = buffer.getInt();

        // Guard: ensure full payload is present in buffer
        if (buffer.remaining() < length) {
            buffer.reset(); // Incomplete frame — wait for more data
            return null;
        }

        // Extract the UTF-8 payload bytes
        byte[] payloadBytes = new byte[length];
        buffer.get(payloadBytes);
        String payload = new String(payloadBytes, StandardCharsets.UTF_8);

        return new Frame(msgType, payload);
    }
}
