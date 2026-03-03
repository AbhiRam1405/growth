package com.growthtracker.dto;

import com.growthtracker.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * DTO for creating or updating a task.
 */
@Data
public class TaskDTO {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Frequency is required")
    @Pattern(regexp = "Daily|Weekly|One-time", message = "Frequency must be 'Daily', 'Weekly' or 'One-time'")
    private String frequency;

    private java.time.LocalDate scheduledDate;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private boolean mustDo;
}
