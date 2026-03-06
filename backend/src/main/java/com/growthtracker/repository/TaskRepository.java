package com.growthtracker.repository;

import com.growthtracker.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    Optional<Task> findByTitle(String title);
    boolean existsByTitle(String title);
    boolean existsByTitleAndIdNot(String title, String id);

    java.util.List<Task> findByFrequencyAndScheduledDateBefore(String frequency, java.time.LocalDate date);
}
