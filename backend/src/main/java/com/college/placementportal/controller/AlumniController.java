package com.college.placementportal.controller;

import com.college.placementportal.entity.Alumni;
import com.college.placementportal.entity.User;
import com.college.placementportal.service.AlumniService;
import com.college.placementportal.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/alumni")
public class AlumniController {

    @GetMapping("/directory")
    public ResponseEntity<?> getDirectory() {
        return ResponseEntity.ok(alumniService.getAlumniDirectory());
    }

    @GetMapping("/documents/my-document")
    public ResponseEntity<?> getMyDocument(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Alumni alumni = alumniService.getAlumniEntity(user.getId());
        if (alumni.getVerificationDocumentUrl() == null) {
            return ResponseEntity.badRequest().body("No verification document found");
        }
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        String rawUrl = alumni.getVerificationDocumentUrl();
        String fileName = rawUrl != null && rawUrl.contains("/") ? rawUrl.substring(rawUrl.lastIndexOf("/") + 1) : rawUrl;
        response.put("url", "/alumni/documents/" + fileName);
        response.put("documentName", alumni.getRollNumber() + "_AlumniVerification.pdf");
        response.put("uploadDate", alumni.getVerificationDocumentUploadDate() != null ? alumni.getVerificationDocumentUploadDate().toString() : null);
        response.put("documentType", "Verification Document");
        return ResponseEntity.ok(response);
    }

    @Autowired
    private com.college.placementportal.service.AlumniDocumentService alumniDocumentService;

    @GetMapping("/documents/{fileName:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getMyDocumentFile(@PathVariable String fileName, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Alumni alumni = alumniService.getAlumniEntity(user.getId());
        String rawUrl = alumni.getVerificationDocumentUrl();
        String storedFileName = rawUrl != null && rawUrl.contains("/") ? rawUrl.substring(rawUrl.lastIndexOf("/") + 1) : rawUrl;
        
        if (storedFileName == null || !storedFileName.equals(fileName)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        org.springframework.core.io.Resource resource = alumniDocumentService.loadDocumentAsResource(fileName);
        String contentType = "application/pdf";
        try {
            contentType = java.nio.file.Files.probeContentType(java.nio.file.Paths.get(resource.getFile().getAbsolutePath()));
        } catch (Exception ex) {
        }
        
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType != null ? contentType : "application/pdf"))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + alumni.getRollNumber() + "_AlumniVerification.pdf\"")
                .body(resource);
    }


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

    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile image, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(java.util.Map.of("profileImageUrl", alumniService.updateProfileImage(user.getId(), image)));
    }
}
