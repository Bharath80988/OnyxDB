package com.onyxdb.api;

import com.onyxdb.core.storage.BufferPool;
import com.onyxdb.core.storage.Page;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow dashboard to connect
public class QueryController {

    private final BufferPool bufferPool;

    public QueryController(BufferPool bufferPool) {
        this.bufferPool = bufferPool;
    }

    @PostMapping("/query")
    public Map<String, Object> executeQuery(@RequestBody Map<String, Object> query) {
        // Placeholder for real query execution
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Query received: " + query.get("query"));
        response.put("rows", new Object[0]);
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
