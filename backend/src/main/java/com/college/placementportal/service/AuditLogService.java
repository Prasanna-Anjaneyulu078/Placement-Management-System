package com.college.placementportal.service;

import com.college.placementportal.entity.AuditLog;
import com.college.placementportal.entity.User;
import com.college.placementportal.repository.AuditLogRepository;
import com.college.placementportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void logAction(String action, String details) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return; // Or handle appropriately
        }

        String email = authentication.getName();
        User admin = userRepository.findByEmail(email).orElse(null);
        
        if (admin != null) {
            AuditLog log = new AuditLog();
            log.setAction(action);
            log.setDetails(details);
            log.setPerformedBy(admin);
            auditLogRepository.save(log);
        }
    }
}
