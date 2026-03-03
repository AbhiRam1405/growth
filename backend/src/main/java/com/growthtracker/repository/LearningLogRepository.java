package com.growthtracker.repository;

import com.growthtracker.model.LearningLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningLogRepository extends MongoRepository<LearningLog, String> {
    List<LearningLog> findBySubject(String subject);
}
