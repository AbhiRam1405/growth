package com.growthtracker.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "examNotes")
public class ExamNote {
    @Id
    private String id;
    private String subject; // Adv Java, DBMS, etc.
    private String examType; // Minor 1, Minor 2, Final Exam
    private String noteContent;

    @CreatedDate
    private LocalDateTime createdAt;
}
