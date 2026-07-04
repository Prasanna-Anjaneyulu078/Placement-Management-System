package com.college.placementportal.controller;

import com.college.placementportal.entity.User;
import com.college.placementportal.service.AlumniService;
import com.college.placementportal.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alumni")
public class AlumniController {

    @Autowired
    private AlumniService alumniService;

    @Autowired
    private JobService jobService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(alumniService.getAlumniProfile(user.getId()));
    }

    @GetMapping("/my-jobs")
    public ResponseEntity<?> getMyJobs(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();
        if (userId == null) {
            return ResponseEntity.badRequest().body("User ID is missing");
        }
        return ResponseEntity.ok(jobService.getJobsByPostedBy(userId));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(alumniService.getStats(user.getId()));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody com.college.placementportal.entity.Alumni alumni, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(alumniService.updateAlumniProfile(user.getId(), alumni));
    }
}
