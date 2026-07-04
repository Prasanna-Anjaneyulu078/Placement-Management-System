package com.college.placementportal.controller;

import com.college.placementportal.service.StudentJobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/jobs")
public class StudentJobController {

    @Autowired
    private StudentJobService studentJobService;

    @GetMapping("/open")
    public ResponseEntity<?> getOpenJobs(Authentication authentication) {
        try {
            return ResponseEntity.ok(studentJobService.getOpenJobs(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/applied")
    public ResponseEntity<?> getAppliedJobs(Authentication authentication) {
        try {
            return ResponseEntity.ok(studentJobService.getAppliedJobs(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/closed")
    public ResponseEntity<?> getClosedJobs() {
        try {
            return ResponseEntity.ok(studentJobService.getClosedJobs());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> applyToJob(@PathVariable @org.springframework.lang.NonNull Long jobId, Authentication authentication) {
        try {
            return ResponseEntity.ok(studentJobService.applyToJob(jobId, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
