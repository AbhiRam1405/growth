package com.growthtracker.service;

import com.growthtracker.model.DailySummary;
import com.growthtracker.model.Task;
import com.growthtracker.model.TaskStatus;
import com.growthtracker.model.TaskCompletion;
import com.growthtracker.repository.DailySummaryRepository;
import com.growthtracker.repository.TaskRepository;
import com.growthtracker.repository.TaskStatusRepository;
import com.growthtracker.repository.TaskCompletionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Computes and persists daily summary documents.
 *
 * STREAK RULES (applied in order):
 *  1. No Daily tasks exist → streak = 0
 *  2. completionPercentage >= 70 → streak = yesterdayStreak + 1
 *  3. yesterdayStreak not found (no summary) → streak = (pct >= 70 ? 1 : 0)
 *  4. completionPercentage < 70 → streak = 0
 *
 * longestStreak is updated in this document if current streak exceeds all previous values.
 *
 * Only DAILY-frequency tasks are counted toward the streak calculation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DailySummaryService {

    private final TaskRepository taskRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final TaskCompletionRepository taskCompletionRepository;
    private final DailySummaryRepository dailySummaryRepository;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ISO_LOCAL_DATE;

    /**
     * Recomputes the DailySummary for the given date and saves it to MongoDB.
     * Called after any task status change.
     */
    public DailySummary recompute(LocalDate date) {
        String dateStr = date.format(DATE_FMT);

        // Streak (70%) tasks for this date: Daily, Weekly + One-time tasks scheduled for today
        List<Task> allTasks = taskRepository.findAll();
        List<Task> streakTasks = allTasks.stream()
            .filter(t -> !"One-time".equalsIgnoreCase(t.getFrequency()) || 
                        (t.getScheduledDate() != null && date.equals(t.getScheduledDate())))
            .toList();

        int totalStreakTasks = streakTasks.size();

        // If no Daily/Today tasks exist, streak = 0
        if (totalStreakTasks == 0) {
            return saveSummary(dateStr, 0, 0, 0.0, 0, resolveCurrentLongest(0));
        }

        // Count completed streak tasks for today
        // A task is completed if it has a TaskCompletion record for today
        List<TaskCompletion> todayCompletions = taskCompletionRepository.findByDate(date);
        java.util.Set<String> completedIds = todayCompletions.stream()
            .map(TaskCompletion::getTaskId)
            .collect(java.util.stream.Collectors.toSet());

        long completedCount = streakTasks.stream()
            .filter(t -> completedIds.contains(t.getId()))
            .count();

        double completionPct = (totalStreakTasks == 0) ? 0.0 : (double) completedCount / totalStreakTasks * 100.0;

        // Determine streak from yesterday's summary
        String yesterdayStr = date.minusDays(1).format(DATE_FMT);
        int yesterdayStreak = dailySummaryRepository.findById(yesterdayStr)
            .map(DailySummary::getStreak)
            .orElse(0); // no yesterday record → streak resets

        int streak = (completionPct >= 70.0) ? (yesterdayStreak + 1) : 0;
        int longestStreak = resolveCurrentLongest(streak);

        return saveSummary(dateStr, totalStreakTasks, (int) completedCount, completionPct, streak, longestStreak);
    }

    private boolean isStreakTask(List<Task> streakTasks, String taskId) {
        return streakTasks.stream().anyMatch(t -> t.getId().equals(taskId));
    }

    /**
     * Finds the current longest streak across all recorded summaries, then
     * returns whichever is bigger: the existing record or the new streak.
     */
    private int resolveCurrentLongest(int currentStreak) {
        return dailySummaryRepository.findAllByOrderByDateDesc().stream()
            .mapToInt(DailySummary::getLongestStreak)
            .max()
            .orElse(0) < currentStreak
            ? currentStreak
            : dailySummaryRepository.findAllByOrderByDateDesc().stream()
                .mapToInt(DailySummary::getLongestStreak)
                .max()
                .orElse(currentStreak);
    }

    private DailySummary saveSummary(String dateStr, int total, int completed,
                                      double pct, int streak, int longestStreak) {
        DailySummary summary = DailySummary.builder()
            .id(dateStr)
            .date(dateStr)
            .totalTasks(total)
            .completedTasks(completed)
            .completionPercentage(Math.round(pct * 100.0) / 100.0)
            .streak(streak)
            .longestStreak(longestStreak)
            .build();
        return dailySummaryRepository.save(summary);
    }

    public DailySummary getSummary(LocalDate date) {
        String dateStr = date.format(DATE_FMT);
        return dailySummaryRepository.findById(dateStr).orElseGet(() ->
            DailySummary.builder()
                .id(dateStr).date(dateStr)
                .totalTasks(0).completedTasks(0)
                .completionPercentage(0).streak(0).longestStreak(0)
                .build()
        );
    }
}
