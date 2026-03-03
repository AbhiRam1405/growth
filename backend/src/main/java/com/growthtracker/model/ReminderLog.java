package com.growthtracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;

/**
 * Tracks reminders sent for must-do tasks to prevent duplicates.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "reminderLogs")
@CompoundIndex(name = "task_date_time_idx", def = "{'taskId': 1, 'date': 1, 'reminderTime': 1}", unique = true)
public class ReminderLog {
    @Id
    private String id;
    private String taskId;
    private LocalDate date;
    private Integer reminderTime; // 15 or 21 (3 PM or 9 PM)
}
