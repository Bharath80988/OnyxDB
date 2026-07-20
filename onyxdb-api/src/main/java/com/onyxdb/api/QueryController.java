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
    
    // RBAC mapping (configurable via .env or application.properties)
    @org.springframework.beans.factory.annotation.Value("${ADMIN_TOKEN:Bearer admin-secret-key}")
    private String adminToken;
    
    @org.springframework.beans.factory.annotation.Value("${READ_ONLY_TOKEN:Bearer readonly-secret-key}")
    private String readOnlyToken;

    public QueryController(QueryService queryService) {
        this.queryService = queryService;
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> executeQuery(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, Object> query) {
            
        Map<String, Object> response = new HashMap<>();
        
        // RBAC Enforcement
        if (authHeader == null || (!authHeader.equals(adminToken) && !authHeader.equals(readOnlyToken))) {
            response.put("status", "error");
            response.put("message", "Unauthorized: Missing or invalid Authorization header");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String action = (String) query.get("action");
        if (action != null && action.equalsIgnoreCase("insert") && authHeader.equals(readOnlyToken)) {
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
