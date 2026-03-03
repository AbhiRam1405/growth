package com.growthtracker.dto;

import com.growthtracker.model.Difficulty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for creating a new learning log entry.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateLearningLogRequest {

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Topic title is required")
    private String topicTitle;

    private String assignedTask; // Optional

    @NotNull(message = "Lecture date is required")
    private LocalDate lectureDate;
}
