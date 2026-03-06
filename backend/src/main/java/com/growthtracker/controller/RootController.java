package com.growthtracker.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Basic controller for the root path.
 * Helps verify backend is running and satisfies simple health checks.
 */
@RestController
public class RootController {

    @GetMapping("/")
    public Map<String, Object> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Personal Growth Tracker API is Live 🚀");
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("docs", "Use /api prefix for all endpoints");
        return response;
    }

    /** Lightweight health check — used by frontend keep-alive ping */
    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
