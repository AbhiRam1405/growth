package com.growthtracker.repository;

import com.growthtracker.model.TaskCompletion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskCompletionRepository extends MongoRepository<TaskCompletion, String> {

    Optional<TaskCompletion> findByTaskIdAndDate(String taskId, LocalDate date);

    boolean existsByTaskIdAndDate(String taskId, LocalDate date);

    List<TaskCompletion> findByDate(LocalDate date);

    List<TaskCompletion> findByTaskId(String taskId);
}
