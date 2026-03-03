package com.growthtracker.dto;

import com.growthtracker.model.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO for filtering learning logs.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningLogFilterRequest {

    private String subject;
    private LocalDate startDate;
    private LocalDate endDate;
    private String searchKeyword;

    // Pagination
    @Builder.Default
    private Integer page = 0;
    @Builder.Default
    private Integer size = 10;

    // Sorting
    private String sortBy; // latest, oldest, longest_duration
}
