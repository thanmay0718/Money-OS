package com.moneyos.service;

import com.moneyos.dto.response.AuditLogResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {

    void log(String eventType, String actorEmail, String targetResource, String details);

    Page<AuditLogResponse> getAuditLogs(Pageable pageable);
}
