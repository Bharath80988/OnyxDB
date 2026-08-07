package com.onyxdb.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Lightweight, zero-external-dependency JWT Token Provider.
 *
 * <p>Uses Standard Java Cryptography (HMAC-SHA256) and standard Base64URL encoding
 * to generate and validate signed JSON Web Tokens (JWT).</p>
 */
@Component
public class JwtTokenProvider {

    private final String secretKey;
    private final long expirationMs;
    private final ObjectMapper objectMapper;

    public JwtTokenProvider(
            @Value("${JWT_SECRET:onyxdb-default-jwt-secret-key-32-chars-long!}") String secretKey,
            @Value("${JWT_EXPIRATION_MS:86400000}") long expirationMs) { // Default 24h
        this.secretKey = secretKey;
        this.expirationMs = expirationMs;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Generates a signed JWT token for a given username and role.
     *
     * @param username User identifier.
     * @param role     User permission role (e.g. "ADMIN", "READ_ONLY").
     * @return Signed JWT string in format header.payload.signature
     */
    public String generateToken(String username, String role) {
        try {
            long now = System.currentTimeMillis();
            long exp = now + expirationMs;

            // 1. Header
            Map<String, String> headerMap = new HashMap<>();
            headerMap.put("alg", "HS256");
            headerMap.put("typ", "JWT");
            String headerJson = objectMapper.writeValueAsString(headerMap);
            String headerB64 = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));

            // 2. Payload
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("sub", username);
            payloadMap.put("role", role);
            payloadMap.put("iat", now / 1000);
            payloadMap.put("exp", exp / 1000);
            String payloadJson = objectMapper.writeValueAsString(payloadMap);
            String payloadB64 = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));

            // 3. Signature
            String unsignedToken = headerB64 + "." + payloadB64;
            String signatureB64 = sign(unsignedToken, secretKey);

            return unsignedToken + "." + signatureB64;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    /**
     * Parses and verifies a JWT token.
     *
     * @param token Bearer token string.
     * @return Claims map if valid and unexpired; null if signature invalid or expired.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> validateAndExtractClaims(String token) {
        if (token == null || token.isBlank()) return null;

        // Strip "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            return null; // Invalid JWT structure
        }

        String headerB64 = parts[0];
        String payloadB64 = parts[1];
        String signatureB64 = parts[2];

        // 1. Verify signature
        String expectedSignature = sign(headerB64 + "." + payloadB64, secretKey);
        if (!constantTimeEquals(signatureB64, expectedSignature)) {
            return null; // Signature mismatch
        }

        // 2. Parse payload claims
        try {
            byte[] payloadBytes = base64UrlDecode(payloadB64);
            Map<String, Object> claims = objectMapper.readValue(payloadBytes, Map.class);

            // 3. Check expiration
            Number expNumber = (Number) claims.get("exp");
            if (expNumber != null) {
                long expSec = expNumber.longValue();
                long currentSec = System.currentTimeMillis() / 1000;
                if (currentSec >= expSec) {
                    return null; // Token expired
                }
            }

            return claims;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Computes HMAC-SHA256 signature encoded as Base64URL string.
     */
    private String sign(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return base64UrlEncode(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("HMAC SHA256 error", e);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] base64UrlDecode(String b64String) {
        return Base64.getUrlDecoder().decode(b64String);
    }

    /**
     * Prevents timing attacks during signature verification.
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null) return false;
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
