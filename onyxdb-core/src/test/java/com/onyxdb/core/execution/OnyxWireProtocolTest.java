package com.onyxdb.core.execution;

import org.junit.jupiter.api.Test;

import java.nio.ByteBuffer;

import static org.assertj.core.api.Assertions.assertThat;

public class OnyxWireProtocolTest {

    @Test
    void testEncodeAndDecodeOwpFrame() {
        String query = "GET users 101";
        ByteBuffer encoded = OnyxWireProtocol.encode(OnyxWireProtocol.MSG_QUERY, query);
        
        assertThat(encoded.capacity()).isEqualTo(OnyxWireProtocol.HEADER_SIZE + query.getBytes().length);

        OnyxWireProtocol.Frame decoded = OnyxWireProtocol.decode(encoded);
        assertThat(decoded).isNotNull();
        assertThat(decoded.getMsgType()).isEqualTo(OnyxWireProtocol.MSG_QUERY);
        assertThat(decoded.getPayload()).isEqualTo(query);
    }

    @Test
    void testDecodeIncompleteBuffer() {
        ByteBuffer shortBuf = ByteBuffer.allocate(4);
        shortBuf.putInt(OnyxWireProtocol.MAGIC_HEADER);
        shortBuf.flip();

        OnyxWireProtocol.Frame decoded = OnyxWireProtocol.decode(shortBuf);
        assertThat(decoded).isNull();
    }
}
