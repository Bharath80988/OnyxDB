package com.onyxdb.api.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class JwtAuthTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    public void setUp() {
        // Secret key (at least 32 chars) and 5 seconds expiration for testing
        jwtTokenProvider = new JwtTokenProvider("test-secret-key-32-chars-long-string!", 5000);
    }

    @Test
    public void testGenerateAndValidateToken() {
        String token = jwtTokenProvider.generateToken("adminUser", "ADMIN");
        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);

        Map<String, Object> claims = jwtTokenProvider.validateAndExtractClaims(token);
        assertNotNull(claims);
        assertEquals("adminUser", claims.get("sub"));
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    public void testBearerPrefixHandling() {
        String rawToken = jwtTokenProvider.generateToken("readUser", "READ_ONLY");
        String bearerToken = "Bearer " + rawToken;

        Map<String, Object> claims = jwtTokenProvider.validateAndExtractClaims(bearerToken);
        assertNotNull(claims);
        assertEquals("readUser", claims.get("sub"));
        assertEquals("READ_ONLY", claims.get("role"));
    }

    @Test
    public void testInvalidSignatureRejected() {
        String token = jwtTokenProvider.generateToken("user", "ADMIN");
        String tamperedToken = token.substring(0, token.length() - 5) + "abcde";

        Map<String, Object> claims = jwtTokenProvider.validateAndExtractClaims(tamperedToken);
        assertNull(claims);
    }

    @Test
    public void testExpiredTokenRejected() throws InterruptedException {
        // Create provider with 100ms expiration
        JwtTokenProvider shortLivedProvider = new JwtTokenProvider("test-secret-key-32-chars-long-string!", 100);
        String token = shortLivedProvider.generateToken("user", "ADMIN");

        Thread.sleep(200); // Wait for token to expire

        Map<String, Object> claims = shortLivedProvider.validateAndExtractClaims(token);
        assertNull(claims);
    }
}
