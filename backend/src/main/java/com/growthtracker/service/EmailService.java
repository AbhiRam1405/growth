package com.growthtracker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendReminderEmail(String to, String taskTitle) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("abhishek25ict@gmail.com");
            message.setTo(to);
            message.setSubject("Reminder: You Have a Pending Must-Do Task");
            message.setText("You have not completed your daily must-do task:\n\n" +
                    "Task: " + taskTitle + "\n\n" +
                    "Please complete it before the end of the day.");

            mailSender.send(message);
            log.info("Reminder email sent to {} for task: {}", to, taskTitle);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
