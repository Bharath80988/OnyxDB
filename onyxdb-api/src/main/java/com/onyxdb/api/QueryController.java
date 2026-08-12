package com.onyxdb.api;

import com.onyxdb.api.security.JwtTokenProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API controller for executing OnyxDB queries and fetching server metrics.
 *
 * <p>Endpoints:
 * <ul>
 *   <li>{@code POST /api/query} — Execute a JSON or OQS query (requires Authorization header).</li>
 *   <li>{@code GET  /api/stats} — Health check and server uptime.</li>
 *   <li>{@code GET  /api/metrics} — Live system telemetry (table count, JVM memory, indexes).</li>
 * </ul>
 * </p>
 *
 * <p>RBAC:
 * <ul>
 *   <li>Admin token: full read/write/admin access.</li>
 *   <li>Read-only token: SELECT and read operations only.</li>
 * </ul>
 * </p>
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow dashboard and CLI to connect
public class QueryController {

    private final QueryService queryService;
    
    private final JwtTokenProvider jwtTokenProvider;
    
    // RBAC mapping (configurable via .env or application.properties)
    @org.springframework.beans.factory.annotation.Value("${ADMIN_TOKEN:}")
    private String adminToken;
    
    @org.springframework.beans.factory.annotation.Value("${READ_ONLY_TOKEN:}")
    private String readOnlyToken;

    public QueryController(QueryService queryService, JwtTokenProvider jwtTokenProvider) {
        this.queryService = queryService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> executeQuery(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> query) {
            
        Map<String, Object> response = new HashMap<>();
        
        String userRole = null;

        // 1. Check configured tokens or JWT
        if (authHeader != null && !authHeader.isBlank()) {
            if (adminToken != null && !adminToken.isBlank() && authHeader.equals(adminToken)) {
                userRole = "ADMIN";
            } else if (readOnlyToken != null && !readOnlyToken.isBlank() && authHeader.equals(readOnlyToken)) {
                userRole = "READ_ONLY";
            } else {
                // 2. Validate JWT token
                Map<String, Object> claims = jwtTokenProvider.validateAndExtractClaims(authHeader);
                if (claims != null && claims.containsKey("role")) {
                    userRole = (String) claims.get("role");
                }
            }
        }

        // RBAC Enforcement
        if (userRole == null) {
            response.put("status", "error");
            response.put("message", "Unauthorized: Missing, expired, or invalid Authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String action = (String) query.get("action");
        if (action != null && (action.equalsIgnoreCase("insert") || action.equalsIgnoreCase("update") || action.equalsIgnoreCase("delete") || action.equalsIgnoreCase("create_index")) && "READ_ONLY".equals(userRole)) {
            response.put("status", "error");
            response.put("message", "Forbidden: READ_ONLY role cannot perform mutative, destructive, or administrative operations");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        try {
            List<String> results = queryService.executeQuery(query);
            response.put("status", "success");
            response.put("rows", results);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Health check endpoint. Returns server status and current uptime timestamp.
     */
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("status", "running");
        stats.put("version", "4.0.0");
        stats.put("uptime_epoch_ms", System.currentTimeMillis());
        return stats;
    }

    /**
     * Live metrics endpoint. Returns JVM memory stats, table count, and index metadata.
     * Delegates to {@link com.onyxdb.core.execution.ExecutionEngine#getSystemMetrics()}.
     */
    @GetMapping("/metrics")
    public Map<String, Object> getMetrics() {
        return queryService.getSystemMetrics();
    }
}
