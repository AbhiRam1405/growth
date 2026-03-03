package com.growthtracker.controller;

import com.growthtracker.model.ExamNote;
import com.growthtracker.service.ExamNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exam-notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ExamNoteController {
    private final ExamNoteService examNoteService;

    @GetMapping
    public List<ExamNote> getAllNotes() {
        return examNoteService.getAllNotes();
    }

    @PostMapping
    public ResponseEntity<ExamNote> createNote(@RequestBody ExamNote note) {
        return new ResponseEntity<>(examNoteService.createNote(note), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(@PathVariable String id) {
        examNoteService.deleteNote(id);
        return ResponseEntity.noContent().build();
    }
}
