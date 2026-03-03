package com.growthtracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a log entry for a college lecture.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "learningLogs")
public class LearningLog {

    @Id
    private String id;

    @Indexed
    private String subject;

    private String topicTitle;

    private String assignedTask; // Given task by sir

    @Indexed
    private LocalDate lectureDate;

    @CreatedDate
    private LocalDateTime createdAt;
}
