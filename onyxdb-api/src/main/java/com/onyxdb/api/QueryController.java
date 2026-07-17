package com.onyxdb.api;

import com.onyxdb.core.execution.ExecutionEngine;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow dashboard to connect
public class QueryController {

    private final ExecutionEngine executionEngine;

    public QueryController(ExecutionEngine executionEngine) {
        this.executionEngine = executionEngine;
    }

    @PostMapping("/query")
    public Map<String, Object> executeQuery(@RequestBody Map<String, Object> query) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<String> results = executionEngine.execute(query);
            response.put("status", "success");
            response.put("rows", results);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        return response;
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("status", "running");
        stats.put("uptime", System.currentTimeMillis());
        return stats;
    }
}
