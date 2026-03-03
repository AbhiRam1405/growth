package com.growthtracker.controller;

import com.growthtracker.dto.CreateLearningLogRequest;
import com.growthtracker.dto.LearningLogFilterRequest;
import com.growthtracker.model.LearningLog;
import com.growthtracker.service.LearningLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/learning-log")
@RequiredArgsConstructor
public class LearningLogController {

    private final LearningLogService learningLogService;

    @PostMapping
    public ResponseEntity<LearningLog> createEntry(@Valid @RequestBody CreateLearningLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningLogService.createEntry(request));
    }

    @GetMapping
    public ResponseEntity<List<LearningLog>> getAllEntries() {
        return ResponseEntity.ok(learningLogService.getAllEntries());
    }

    @PostMapping("/search")
    public ResponseEntity<List<LearningLog>> searchEntries(@RequestBody LearningLogFilterRequest filters) {
        return ResponseEntity.ok(learningLogService.searchEntries(filters));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningLog> getEntry(@PathVariable String id) {
        return ResponseEntity.ok(learningLogService.getEntryById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable String id) {
        learningLogService.deleteEntry(id);
        return ResponseEntity.noContent().build();
    }
}
