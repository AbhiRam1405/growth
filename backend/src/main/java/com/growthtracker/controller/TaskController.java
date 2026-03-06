package com.growthtracker.controller;

import com.growthtracker.dto.*;
import com.growthtracker.model.Task;
import com.growthtracker.service.ReminderService;
import com.growthtracker.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final ReminderService reminderService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@Valid @RequestBody TaskDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id,
                                           @Valid @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(taskService.updateTask(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable String id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TaskWithStatusDTO> completeTask(@PathVariable String id,
                                              @Valid @RequestBody CompleteTaskRequest request) {
        return ResponseEntity.ok(taskService.completeTask(id, request));
    }

    @GetMapping("/today")
    public ResponseEntity<List<TaskWithStatusDTO>> getTodayTasks() {
        return ResponseEntity.ok(taskService.getTodayTasks());
    }

    @GetMapping("/{id}")
    public Task getTask(@PathVariable String id) {
        return taskService.getTaskById(id);
    }

    @PostMapping("/query")
    public List<Task> getTaskHistory(@RequestBody TaskHistoryFilterRequest filters) {
        try {
            return taskService.getTaskHistory(filters);
        } catch (Exception e) {
            System.err.println("Error fetching task history: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/trigger-reminders")
    public ResponseEntity<String> triggerReminders() {
        reminderService.sendMustDoReminders();
        return ResponseEntity.ok("Reminder check triggered manually.");
    }
}
