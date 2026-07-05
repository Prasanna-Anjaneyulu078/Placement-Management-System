package com.college.placementportal.controller;

import com.college.placementportal.enums.ApplicationStatus;
import com.college.placementportal.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    @GetMapping("/alumni/my-posted-jobs")
    public ResponseEntity<?> getApplicationsForMyJobs(Authentication authentication) {
        try {
            return ResponseEntity.ok(applicationService.getApplicationsForAlumniJobs(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }


    @Autowired
    private ApplicationService applicationService;

    @PostMapping("/apply/{jobId}")
    public ResponseEntity<?> applyToJob(@PathVariable Long jobId, Authentication authentication) {
        if (jobId == null) {
            return ResponseEntity.badRequest().body("Job ID cannot be null");
        }
        try {
            return ResponseEntity.ok(applicationService.applyToJob(jobId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyApplications(Authentication authentication) {
        try {
            return ResponseEntity.ok(applicationService.getApplicationsByStudentEmail(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<?> getApplicationsForJob(@PathVariable Long jobId) {
        if (jobId == null) {
            return ResponseEntity.badRequest().body("Job ID cannot be null");
        }
        return ResponseEntity.ok(applicationService.getApplicationsByJobId(jobId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Long id, @RequestParam ApplicationStatus status) {
        if (id == null) {
            return ResponseEntity.badRequest().body("Application ID cannot be null");
        }
        try {
            return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
