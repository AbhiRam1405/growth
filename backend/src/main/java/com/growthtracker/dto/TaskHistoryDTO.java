package com.growthtracker.dto;

import com.growthtracker.model.Priority;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskHistoryDTO {
    private String id; // completion id
    private String taskId;
    private String title;
    private String category;
    private String frequency;
    private Priority priority;
    private LocalDateTime completedAt;
    private Integer timeSpent;
    private String completionNote;
    
    @Builder.Default
    private String status = "COMPLETED";
}
