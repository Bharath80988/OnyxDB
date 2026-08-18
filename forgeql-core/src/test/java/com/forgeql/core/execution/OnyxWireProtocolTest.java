package com.forgeql.core.execution;

import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;

import static org.assertj.core.api.Assertions.assertThat;

public class ForgeWireProtocolTest {

    @Test
    void testEncodeAndDecodeOwpFrame() {
        String query = "GET users 101";
        ByteBuffer encoded = ForgeWireProtocol.encode(ForgeWireProtocol.MSG_QUERY, query);
        
        assertThat(encoded.capacity()).isEqualTo(ForgeWireProtocol.HEADER_SIZE + query.getBytes().length);

        ForgeWireProtocol.Frame decoded = ForgeWireProtocol.decode(encoded);
        assertThat(decoded).isNotNull();
        assertThat(decoded.getMsgType()).isEqualTo(ForgeWireProtocol.MSG_QUERY);
        assertThat(decoded.getPayload()).isEqualTo(query);
    }

    @Test
    void testDecodeIncompleteBuffer() {
        ByteBuffer shortBuf = ByteBuffer.allocate(4);
        shortBuf.putInt(ForgeWireProtocol.MAGIC_HEADER);
        shortBuf.flip();

        ForgeWireProtocol.Frame decoded = ForgeWireProtocol.decode(shortBuf);
        assertThat(decoded).isNull();
    }
}
