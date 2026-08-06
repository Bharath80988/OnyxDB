package com.onyxdb.core.execution;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;

/**
 * Compact binary protocol (Onyx Wire Protocol - OWP) for high-performance zero-copy socket communication.
 * Frame Layout:
 * [4 bytes Magic Header (0x4F4E5958 "ONYX")] [1 byte MsgType] [4 bytes Payload Length] [Payload Bytes]
 */
public class OnyxWireProtocol {
    public static final int MAGIC_HEADER = 0x4F4E5958; // "ONYX"
    public static final int HEADER_SIZE = 9;

    public static final byte MSG_QUERY = 0x01;
    public static final byte MSG_RESPONSE = 0x02;
    public static final byte MSG_EXPLAIN = 0x03;

    public static class Frame {
        private final byte msgType;
        private final String payload;

        public Frame(byte msgType, String payload) {
            this.msgType = msgType;
            this.payload = payload != null ? payload : "";
        }

        public byte getMsgType() {
            return msgType;
        }

        public String getPayload() {
            return payload;
        }
    }

    public static ByteBuffer encode(byte msgType, String payload) {
        byte[] bytes = payload != null ? payload.getBytes(StandardCharsets.UTF_8) : new byte[0];
        ByteBuffer buffer = ByteBuffer.allocate(HEADER_SIZE + bytes.length);
        buffer.putInt(MAGIC_HEADER);
        buffer.put(msgType);
        buffer.putInt(bytes.length);
        buffer.put(bytes);
        buffer.flip();
        return buffer;
    }

    public static Frame decode(ByteBuffer buffer) {
        if (buffer.remaining() < HEADER_SIZE) {
            return null;
        }
        buffer.mark();
        int magic = buffer.getInt();
        if (magic != MAGIC_HEADER) {
            buffer.reset();
            return null;
        }
        byte msgType = buffer.get();
        int length = buffer.getInt();

        if (buffer.remaining() < length) {
            buffer.reset();
            return null;
        }

        byte[] payloadBytes = new byte[length];
        buffer.get(payloadBytes);
        String payload = new String(payloadBytes, StandardCharsets.UTF_8);
        return new Frame(msgType, payload);
    }
}
