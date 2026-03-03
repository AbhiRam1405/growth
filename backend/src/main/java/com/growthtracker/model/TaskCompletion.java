package com.growthtracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Stores a historical record of a task completion.
 * Each completion is a separate document, allowing for a full history.
 * Compound index ensures only one completion per task per day.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "taskCompletions")
@CompoundIndexes({
    @CompoundIndex(name = "taskId_date_idx", def = "{'taskId': 1, 'date': 1}", unique = true)
})
public class TaskCompletion {

    @Id
    private String id;

    @Indexed
    private String taskId;

    @Indexed
    private LocalDate date;

    private String note;

    private Integer timeSpent;

    private LocalDateTime completedAt;
}
