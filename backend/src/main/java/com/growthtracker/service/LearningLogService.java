package com.growthtracker.service;

import com.growthtracker.dto.CreateLearningLogRequest;
import com.growthtracker.dto.LearningLogFilterRequest;
import com.growthtracker.exception.ResourceNotFoundException;
import com.growthtracker.model.LearningLog;
import com.growthtracker.repository.LearningLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for managing college learning logs.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LearningLogService {

    private final LearningLogRepository learningLogRepository;
    private final MongoTemplate mongoTemplate;

    public LearningLog createEntry(CreateLearningLogRequest request) {
        LearningLog entry = LearningLog.builder()
            .subject(request.getSubject())
            .topicTitle(request.getTopicTitle())
            .assignedTask(request.getAssignedTask())
            .lectureDate(request.getLectureDate())
            .createdAt(LocalDateTime.now())
            .build();

        log.info("Creating new learning log for subject: {}", entry.getSubject());
        return learningLogRepository.save(entry);
    }

    public List<LearningLog> getAllEntries() {
        return learningLogRepository.findAll(Sort.by(Sort.Direction.DESC, "lectureDate"));
    }

    public List<LearningLog> searchEntries(LearningLogFilterRequest filters) {
        Query query = new Query();
        Criteria criteria = new Criteria();

        if (StringUtils.hasText(filters.getSubject())) {
            criteria.and("subject").is(filters.getSubject());
        }

        if (filters.getStartDate() != null && filters.getEndDate() != null) {
            criteria.and("lectureDate").gte(filters.getStartDate()).lte(filters.getEndDate());
        } else if (filters.getStartDate() != null) {
            criteria.and("lectureDate").gte(filters.getStartDate());
        } else if (filters.getEndDate() != null) {
            criteria.and("lectureDate").lte(filters.getEndDate());
        }

        if (StringUtils.hasText(filters.getSearchKeyword())) {
            Criteria keywordCriteria = new Criteria().orOperator(
                Criteria.where("topicTitle").regex(filters.getSearchKeyword(), "i"),
                Criteria.where("assignedTask").regex(filters.getSearchKeyword(), "i")
            );
            criteria.andOperator(keywordCriteria);
        }

        query.addCriteria(criteria);

        // Sorting
        String sortBy = filters.getSortBy();
        if ("oldest".equalsIgnoreCase(sortBy)) {
            query.with(Sort.by(Sort.Direction.ASC, "lectureDate"));
        } else {
            // Default: latest
            query.with(Sort.by(Sort.Direction.DESC, "lectureDate"));
        }

        // Pagination
        int page = (filters.getPage() != null && filters.getPage() >= 0) ? filters.getPage() : 0;
        int size = (filters.getSize() != null && filters.getSize() > 0) ? filters.getSize() : 10;
        query.with(PageRequest.of(page, size));

        return mongoTemplate.find(query, LearningLog.class);
    }

    public LearningLog getEntryById(String id) {
        return learningLogRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Learning log not found with id: " + id));
    }

    public void deleteEntry(String id) {
        if (!learningLogRepository.existsById(id)) {
            throw new ResourceNotFoundException("Learning log not found with id: " + id);
        }
        learningLogRepository.deleteById(id);
    }
}
