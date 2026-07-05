package com.college.placementportal.controller;

import com.college.placementportal.entity.Job;
import com.college.placementportal.service.JobService;
import com.college.placementportal.service.JobImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired
    private JobService jobService;

    @Autowired
    private JobImageService jobImageService;

    @GetMapping("/approved")
    public ResponseEntity<?> getApprovedJobs() {
        return ResponseEntity.ok(jobService.getApprovedJobs());
    }

    @PostMapping("/post")
    public ResponseEntity<?> createJob(@RequestBody Job job, Authentication authentication) {
        try {
            return ResponseEntity.ok(jobService.createJob(job, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/my")
    public ResponseEntity<?> getMyJobs(Authentication authentication) {
        return ResponseEntity.ok(jobService.getJobsByPostedByEmail(authentication.getName()));
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateJobStatus(@PathVariable Long id, @RequestParam com.college.placementportal.enums.JobStatus status, @RequestParam(required = false) String reason) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body("Job ID cannot be null");
            }
            return ResponseEntity.ok(jobService.updateJobStatus(id, status, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @RequestBody Job job, Authentication authentication) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body("Job ID cannot be null");
            }
            return ResponseEntity.ok(jobService.updateJob(id, job, authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@PathVariable Long id, Authentication authentication) {
        try {
            if (id == null) {
                return ResponseEntity.badRequest().body("Job ID cannot be null");
            }
            jobService.deleteJob(id, authentication.getName());
            return ResponseEntity.ok("Job deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/logo")
    public ResponseEntity<?> uploadLogo(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        if (id == null) {
            return ResponseEntity.badRequest().body("Job ID cannot be null");
        }
        try {
            String fileUrl = jobImageService.storeLogo(file, id);
            return ResponseEntity.ok().body("{\"url\":\"" + fileUrl + "\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{id}/banner")
    public ResponseEntity<?> uploadBanner(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        if (id == null) {
            return ResponseEntity.badRequest().body("Job ID cannot be null");
        }
        try {
            String fileUrl = jobImageService.storeBanner(file, id);
            return ResponseEntity.ok().body("{\"url\":\"" + fileUrl + "\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/images/{type}/{fileName:.+}")
    public ResponseEntity<Resource> downloadImage(@PathVariable String type, @PathVariable String fileName, HttpServletRequest request) {
        Resource resource;
        if ("logo".equals(type)) {
            resource = jobImageService.loadLogoAsResource(fileName);
        } else if ("banner".equals(type)) {
            resource = jobImageService.loadBannerAsResource(fileName);
        } else {
            return ResponseEntity.badRequest().build();
        }

        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (Exception ex) {
            // Fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
