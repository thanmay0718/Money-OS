package com.moneyos.service.impl;

import com.moneyos.dto.response.AuditLogResponse;
import com.moneyos.entity.AuditLog;
import com.moneyos.repository.AuditLogRepository;
import com.moneyos.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public void log(String eventType, String actorEmail, String targetResource, String details) {
        AuditLog auditLog = new AuditLog(eventType, actorEmail, targetResource, details);
        auditLogRepository.save(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(log -> new AuditLogResponse(
                        log.getId(),
                        log.getEventType(),
                        log.getActorEmail(),
                        log.getTargetResource(),
                        log.getDetails(),
                        log.getTimestamp()
                ));
    }
}
