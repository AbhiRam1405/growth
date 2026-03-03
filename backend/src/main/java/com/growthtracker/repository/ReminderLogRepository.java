package com.growthtracker.repository;

import com.growthtracker.model.ReminderLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ReminderLogRepository extends MongoRepository<ReminderLog, String> {
    boolean existsByTaskIdAndDateAndReminderTime(String taskId, LocalDate date, Integer reminderTime);
}
