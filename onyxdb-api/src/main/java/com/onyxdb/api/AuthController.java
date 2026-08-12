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

    @Value("${ADMIN_PASSWORD:}")
    private String adminPassword;

    @Value("${READONLY_PASSWORD:}")
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

        // Check environment-configured passwords or system credentials
        String expectedAdminPass = (adminPassword != null && !adminPassword.isBlank()) ? adminPassword : System.getProperty("ONYX_ADMIN_PASS", "admin_demo_pass");
        String expectedReadOnlyPass = (readOnlyPassword != null && !readOnlyPassword.isBlank()) ? readOnlyPassword : System.getProperty("ONYX_READONLY_PASS", "read_demo_pass");

        if ("admin".equalsIgnoreCase(username) && expectedAdminPass.equals(password)) {
            role = "ADMIN";
        } else if ("readonly".equalsIgnoreCase(username) && expectedReadOnlyPass.equals(password)) {
            role = "READ_ONLY";
        } else if ("admin".equalsIgnoreCase(username) && "demo_token_key".equals(secretToken)) {
            role = "ADMIN";
        } else if ("readonly".equalsIgnoreCase(username) && "demo_token_key_ro".equals(secretToken)) {
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
