package com.growthtracker.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a user-defined growth task (e.g., "Morning Run", "Read Books").
 * Title is unique at DB level via @Indexed(unique = true).
 * Auditing fields are auto-populated by @EnableMongoAuditing.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;

    @Indexed(unique = true)
    private String title;

    @Indexed
    private String category;

    /** "Daily", "Weekly", or "One-time" */
    private String frequency;

    private LocalDate scheduledDate;

    @Indexed
    @Field("status")
    @Builder.Default
    private String status = "PENDING";

    private String completionNote;

    private Integer timeSpent;

    @Indexed
    private LocalDateTime completedAt;

    @Indexed
    @Field("priority")
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Builder.Default
    private boolean mustDo = false;

    @Builder.Default
    private String userEmail = "abhishek25ict@gmail.com";
}
