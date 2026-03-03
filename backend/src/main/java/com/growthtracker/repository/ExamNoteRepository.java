package com.growthtracker.repository;

import com.growthtracker.model.ExamNote;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamNoteRepository extends MongoRepository<ExamNote, String> {
    List<ExamNote> findAllByOrderByCreatedAtDesc();
}
