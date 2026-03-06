package com.growthtracker.service;

import com.growthtracker.dto.*;
import com.growthtracker.exception.DuplicateTitleException;
import com.growthtracker.exception.ResourceNotFoundException;
import com.growthtracker.model.Task;
import com.growthtracker.model.TaskCompletion;
import com.growthtracker.model.TaskStatus;
import com.growthtracker.repository.TaskRepository;
import com.growthtracker.repository.TaskStatusRepository;
import com.growthtracker.repository.TaskCompletionRepository;
import com.growthtracker.model.Priority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.aggregation.ConditionalOperators;
import org.springframework.data.mongodb.core.aggregation.ComparisonOperators;
import org.springframework.data.mongodb.core.aggregation.TypedAggregation;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Task CRUD operations.
 * Enforces unique title constraint at the service layer (complementing the DB index).
 * Cascades deletes to TaskStatus records to avoid orphaned data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskStatusRepository taskStatusRepository;
    private final TaskCompletionRepository taskCompletionRepository;
    private final MongoTemplate mongoTemplate;
    private final DailySummaryService dailySummaryService;

    public List<Task> getAllTasks() {
        return taskRepository.findAll().stream()
            .sorted((t1, t2) -> {
                // Primary: Status (PENDING before COMPLETED)
                int statusCompare = t1.getStatus().compareTo(t2.getStatus()); // "COMPLETED" > "PENDING" ? No, C < P. 
                // Wait, "COMPLETED" starts with C, "PENDING" starts with P. 
                // C comes before P. So compareTo will return < 0 if t1 is COMPLETED.
                // We want PENDING first. So we should reverse it or use custom logic.
                
                boolean t1Pending = !"COMPLETED".equals(t1.getStatus());
                boolean t2Pending = !"COMPLETED".equals(t2.getStatus());
                
                if (t1Pending && !t2Pending) return -1;
                if (!t1Pending && t2Pending) return 1;
                
                // Secondary: Priority (Weight DESC)
                return Integer.compare(t2.getPriority().getWeight(), t1.getPriority().getWeight());
            })
            .toList();
    }

    public Task getTaskById(String id) {
        return taskRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public Task createTask(TaskDTO dto) {
        if (taskRepository.existsByTitle(dto.getTitle())) {
            throw new DuplicateTitleException(dto.getTitle());
        }
        Task task = Task.builder()
            .title(dto.getTitle())
            .category(dto.getCategory())
            .frequency(dto.getFrequency())
            .scheduledDate(dto.getScheduledDate())
            .priority(dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM)
            .mustDo(dto.isMustDo())
            .build();
        Task saved = taskRepository.save(task);
        log.info("Created task: {}", saved.getId());
        return saved;
    }

    public Task updateTask(String id, TaskDTO dto) {
        Task existing = getTaskById(id);

        if (taskRepository.existsByTitleAndIdNot(dto.getTitle(), id)) {
            throw new DuplicateTitleException(dto.getTitle());
        }

        existing.setTitle(dto.getTitle());
        existing.setCategory(dto.getCategory());
        existing.setFrequency(dto.getFrequency());
        existing.setScheduledDate(dto.getScheduledDate());
        existing.setPriority(dto.getPriority() != null ? dto.getPriority() : Priority.MEDIUM);
        existing.setMustDo(dto.isMustDo());
        Task updated = taskRepository.save(existing);
        log.info("Updated task: {}", updated.getId());
        return updated;
    }

    public TaskWithStatusDTO completeTask(String id, CompleteTaskRequest request) {
        Task task = getTaskById(id);
        java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.systemDefault());

        // Service-level duplicate check
        if (taskCompletionRepository.existsByTaskIdAndDate(id, today)) {
            throw new IllegalStateException("Task already completed today");
        }

        // Create new completion record
        TaskCompletion completion = TaskCompletion.builder()
            .taskId(id)
            .date(today)
            .note(request.getNote())
            .timeSpent(request.getTimeSpent())
            .completedAt(LocalDateTime.now())
            .build();
        
        taskCompletionRepository.save(completion);

        // Update TaskStatus for compatibility (streaks, etc.)
        TaskStatus status = taskStatusRepository.findByTaskIdAndDate(id, today)
            .orElse(TaskStatus.builder().taskId(id).date(today).build());
        status.setCompleted(true);
        taskStatusRepository.save(status);

        // ✅ Update the Task document itself so getTaskHistory queries work
        task.setStatus("COMPLETED");
        task.setCompletedAt(completion.getCompletedAt());
        task.setCompletionNote(request.getNote());
        task.setTimeSpent(request.getTimeSpent());
        taskRepository.save(task);

        // Recompute summary
        dailySummaryService.recompute(today);

        log.info("Task {} marked as COMPLETED for today", id);
        
        return TaskWithStatusDTO.builder()
            .taskId(task.getId())
            .title(task.getTitle())
            .category(task.getCategory())
            .frequency(task.getFrequency())
            .priority(task.getPriority())
            .status("COMPLETED")
            .completed(true)
            .completionNote(completion.getNote())
            .timeSpent(completion.getTimeSpent())
            .build();
    }

    public List<TaskWithStatusDTO> getTodayTasks() {
        java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.systemDefault());
        List<Task> allTasks = taskRepository.findAll();
        List<TaskCompletion> todayCompletions = taskCompletionRepository.findByDate(today);

        java.util.Map<String, TaskCompletion> completionMap = todayCompletions.stream()
            .collect(java.util.stream.Collectors.toMap(TaskCompletion::getTaskId, c -> c));

        return allTasks.stream()
            .map(task -> {
                TaskCompletion completion = completionMap.get(task.getId());
                boolean isCompleted = completion != null;
                
                return TaskWithStatusDTO.builder()
                    .taskId(task.getId())
                    .title(task.getTitle())
                    .category(task.getCategory())
                    .frequency(task.getFrequency())
                    .priority(task.getPriority())
                    .status(isCompleted ? "COMPLETED" : "PENDING")
                    .completed(isCompleted)
                    .completionNote(isCompleted ? completion.getNote() : null)
                    .timeSpent(isCompleted ? completion.getTimeSpent() : null)
                    .build();
            })
            .sorted((t1, t2) -> {
                // PENDING first
                if (!t1.isCompleted() && t2.isCompleted()) return -1;
                if (t1.isCompleted() && !t2.isCompleted()) return 1;
                // Weight DESC
                return Integer.compare(t2.getPriority().getWeight(), t1.getPriority().getWeight());
            })
            .toList();
    }

    public void deleteTask(String id) {
        getTaskById(id);
        taskStatusRepository.deleteByTaskId(id);
        taskRepository.deleteById(id);
        log.info("Deleted task {} and its status history.", id);
    }

    /**
     * Automatic cleanup for One-time tasks that have passed their scheduled date.
     * Deletes the task and its status records from the DB.
     */
    public void deleteExpiredOneTimeTasks() {
        java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
        java.util.List<Task> expiredTasks = taskRepository.findByFrequencyAndScheduledDateBefore("One-time", today);
        
        if (!expiredTasks.isEmpty()) {
            log.info("Found {} expired one-time tasks for cleanup", expiredTasks.size());
            for (Task task : expiredTasks) {
                deleteTask(task.getId());
            }
            log.info("Expired one-time tasks cleanup complete.");
        }
    }

    public List<Task> getTaskHistory(TaskHistoryFilterRequest filters) {
        if (filters == null) {
            filters = new TaskHistoryFilterRequest();
        }

        // 1. Date Validation
        if (filters.getStartDate() != null && filters.getEndDate() != null 
                && filters.getStartDate().isAfter(filters.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Query query = new Query();
        
        // 2. Always filter status = "COMPLETED"
        Criteria criteria = Criteria.where("status").is("COMPLETED");

        // 3. Optional Filters
        if (StringUtils.hasText(filters.getCategory())) {
            criteria.and("category").is(filters.getCategory());
        }

        if (filters.getStartDate() != null && filters.getEndDate() != null) {
            criteria.and("completedAt").gte(filters.getStartDate().atStartOfDay())
                                       .lte(filters.getEndDate().atTime(LocalTime.MAX));
        } else if (filters.getStartDate() != null) {
            criteria.and("completedAt").gte(filters.getStartDate().atStartOfDay());
        } else if (filters.getEndDate() != null) {
            criteria.and("completedAt").lte(filters.getEndDate().atTime(LocalTime.MAX));
        }

        if (filters.getMinTimeSpent() != null && filters.getMaxTimeSpent() != null) {
            criteria.and("timeSpent").gte(filters.getMinTimeSpent()).lte(filters.getMaxTimeSpent());
        } else if (filters.getMinTimeSpent() != null) {
            criteria.and("timeSpent").gte(filters.getMinTimeSpent());
        } else if (filters.getMaxTimeSpent() != null) {
            criteria.and("timeSpent").lte(filters.getMaxTimeSpent());
        }

        if (StringUtils.hasText(filters.getSearchKeyword())) {
            criteria.and("title").regex(filters.getSearchKeyword(), "i");
        }

        if (filters.getPriority() != null) {
            criteria.and("priority").is(filters.getPriority());
        }

        query.addCriteria(criteria);

        // 4. Sorting
        String sortBy = filters.getSortBy();
        
        // 5. Pagination
        int page = (filters.getPage() != null && filters.getPage() >= 0) ? filters.getPage() : 0;
        int size = (filters.getSize() != null && filters.getSize() > 0) ? filters.getSize() : 10;
        
        // If sorting by priority, we need custom weights via Aggregation
        if ("priority".equalsIgnoreCase(sortBy)) {
            AggregationOperation match = Aggregation.match(criteria);
            
            // Safer weight assignment using explicit ComparisonOperators.Eq
            // addFields() is better than project() because it keeps all existing fields automatically.
            AggregationOperation addWeight = Aggregation.addFields()
                .addField("prioWeight")
                .withValue(ConditionalOperators.Cond.when(ComparisonOperators.Eq.valueOf("priority").equalToValue("URGENT")).then(3)
                    .otherwise(ConditionalOperators.Cond.when(ComparisonOperators.Eq.valueOf("priority").equalToValue("HIGH")).then(2)
                        .otherwise(ConditionalOperators.Cond.when(ComparisonOperators.Eq.valueOf("priority").equalToValue("MEDIUM")).then(1)
                            .otherwise(0))))
                .build();
            
            AggregationOperation sort = Aggregation.sort(Sort.Direction.DESC, "prioWeight")
                    .and(Sort.Direction.DESC, "completedAt");
            AggregationOperation skip = Aggregation.skip((long) page * size);
            AggregationOperation limit = Aggregation.limit(size);
            
            TypedAggregation<Task> aggregation = Aggregation.newAggregation(Task.class, match, addWeight, sort, skip, limit);
            return mongoTemplate.aggregate(aggregation, Task.class).getMappedResults();
        }

        // Standard Query for other cases
        if ("oldest".equalsIgnoreCase(sortBy)) {
            query.with(Sort.by(Sort.Direction.ASC, "completedAt"));
        } else if ("time_desc".equalsIgnoreCase(sortBy)) {
            query.with(Sort.by(Sort.Direction.DESC, "timeSpent"));
        } else {
            // Default: latest completed first
            query.with(Sort.by(Sort.Direction.DESC, "completedAt"));
        }

        query.with(PageRequest.of(page, size));
        return mongoTemplate.find(query, Task.class);
    }
}
