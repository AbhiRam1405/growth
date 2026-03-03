package com.growthtracker.dto;

import com.growthtracker.model.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO returned when querying task completion status for a given date.
 * Combines Task details with its completion status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskWithStatusDTO {

    private String taskId;
    private String title;
    private String category;
    private String frequency;
    private java.time.LocalDate scheduledDate;
    private String status;
    private Priority priority;
    private boolean completed;
    private String completionNote;
    private Integer timeSpent;
}
