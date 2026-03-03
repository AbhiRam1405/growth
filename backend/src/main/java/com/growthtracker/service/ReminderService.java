package com.growthtracker.service;

import com.growthtracker.model.ReminderLog;
import com.growthtracker.model.Task;
import com.growthtracker.repository.ReminderLogRepository;
import com.growthtracker.repository.TaskCompletionRepository;
import com.growthtracker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderService {

    private final TaskRepository taskRepository;
    private final TaskCompletionRepository taskCompletionRepository;
    private final ReminderLogRepository reminderLogRepository;
    private final EmailService emailService;

    /**
     * Scheduled task to send reminders at 3 PM and 9 PM.
     * Cron: 0 0 15,21 * * ?
     */
    @Scheduled(cron = "0 0 15,21 * * ?", zone = "Asia/Kolkata")
    public void sendMustDoReminders() {
        int currentHour = LocalTime.now(ZoneId.of("Asia/Kolkata")).getHour();
        log.info("Starting must-do task reminder check for hour: {}", currentHour);

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        
        // Find all active must-do tasks
        List<Task> mustDoTasks = taskRepository.findAll().stream()
                .filter(task -> task.isMustDo() && !"DELETED".equals(task.getStatus()))
                .toList();

        for (Task task : mustDoTasks) {
            // 1. Check if completed today
            boolean isCompleted = taskCompletionRepository.existsByTaskIdAndDate(task.getId(), today);
            
            if (!isCompleted) {
                // 2. Check if reminder already sent for this time today
                boolean alreadyReminded = reminderLogRepository.existsByTaskIdAndDateAndReminderTime(
                        task.getId(), today, currentHour);

                if (!alreadyReminded) {
                    // 3. Send Email
                    String recipient = (task.getUserEmail() != null && !task.getUserEmail().isEmpty()) 
                            ? task.getUserEmail() : "abhishek25ict@gmail.com";
                    
                    emailService.sendReminderEmail(recipient, task.getTitle());

                    // 4. Log the reminder
                    ReminderLog reminderLog = ReminderLog.builder()
                            .taskId(task.getId())
                            .date(today)
                            .reminderTime(currentHour)
                            .build();
                    reminderLogRepository.save(reminderLog);
                    log.info("Logged reminder for task: {} at hour: {}", task.getTitle(), currentHour);
                } else {
                    log.debug("Reminder already sent for task: {} at hour: {}", task.getTitle(), currentHour);
                }
            } else {
                log.debug("Task: {} already completed today. Skipping reminder.", task.getTitle());
            }
        }
    }
}
