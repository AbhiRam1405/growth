package com.growthtracker.service;

import com.growthtracker.model.ExamNote;
import com.growthtracker.repository.ExamNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExamNoteService {
    private final ExamNoteRepository examNoteRepository;

    public List<ExamNote> getAllNotes() {
        return examNoteRepository.findAllByOrderByCreatedAtDesc();
    }

    public ExamNote createNote(ExamNote note) {
        return examNoteRepository.save(note);
    }

    public void deleteNote(String id) {
        examNoteRepository.deleteById(id);
    }
}
