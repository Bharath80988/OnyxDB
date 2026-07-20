package com.onyxdb.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow dashboard to connect
public class QueryController {

    private final QueryService queryService;
    
    // Static RBAC mapping for simplicity (in a real app, this would be a DB or JWT)
    private static final String ADMIN_TOKEN = "Bearer admin-secret-key";
    private static final String READ_ONLY_TOKEN = "Bearer readonly-secret-key";

    public QueryController(QueryService queryService) {
        this.queryService = queryService;
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> executeQuery(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> query) {
            
        Map<String, Object> response = new HashMap<>();
        
        // RBAC Enforcement
        if (authHeader == null || (!authHeader.equals(ADMIN_TOKEN) && !authHeader.equals(READ_ONLY_TOKEN))) {
            response.put("status", "error");
            response.put("message", "Unauthorized: Missing or invalid Authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String action = (String) query.get("action");
        if (action != null && action.equalsIgnoreCase("insert") && authHeader.equals(READ_ONLY_TOKEN)) {
            response.put("status", "error");
            response.put("message", "Forbidden: READ_ONLY role cannot perform inserts");
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

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("status", "running");
        stats.put("uptime", System.currentTimeMillis());
        return stats;
    }
}
