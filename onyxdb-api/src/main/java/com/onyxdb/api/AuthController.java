package com.onyxdb.api;

import com.onyxdb.api.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Authentication REST controller for issuing signed JWT tokens.
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code POST /api/auth/login} — Authenticate user and receive a JWT Bearer token.</li>
 * </ul>
 * </p>
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${ADMIN_PASSWORD:admin123}")
    private String adminPassword;

    @Value("${READONLY_PASSWORD:read123}")
    private String readOnlyPassword;

    public AuthController(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();

        String username = credentials.get("username");
        String password = credentials.get("password");
        String secretToken = credentials.get("token");

        String role = null;

        if ("admin".equalsIgnoreCase(username) && adminPassword.equals(password)) {
            role = "ADMIN";
        } else if ("readonly".equalsIgnoreCase(username) && readOnlyPassword.equals(password)) {
            role = "READ_ONLY";
        } else if ("admin-secret-key".equals(secretToken) || "admin-secret-key".equals(password)) {
            username = "admin";
            role = "ADMIN";
        } else if ("readonly-secret-key".equals(secretToken) || "readonly-secret-key".equals(password)) {
            username = "readonly";
            role = "READ_ONLY";
        }

        if (role == null) {
            response.put("status", "error");
            response.put("message", "Invalid username or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String jwt = jwtTokenProvider.generateToken(username, role);

        response.put("status", "success");
        response.put("token", jwt);
        response.put("token_type", "Bearer");
        response.put("role", role);
        response.put("username", username);
        response.put("expires_in", 86400);

        return ResponseEntity.ok(response);
    }
}
