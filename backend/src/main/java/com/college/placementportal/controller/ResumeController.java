package com.college.placementportal.controller;

import com.college.placementportal.entity.Resume;
import com.college.placementportal.entity.User;
import com.college.placementportal.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/student/resume")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            // validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("application/pdf") && !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only PDF and DOCX files are allowed"));
            }
            
            Resume storedResume = resumeService.storeFile(file, user.getId());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "File uploaded successfully");
            response.put("uploadedAt", storedResume.getUploadedAt());
            response.put("fileType", storedResume.getFileType());
            response.put("fileName", storedResume.getFileName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadResume(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Resource resource = resumeService.loadFileAsResource(user.getId());
            
            String filename = resource.getFilename();
            String contentType = filename != null && filename.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
            String attachmentFilename = filename != null ? filename : "resume";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachmentFilename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/details")
    public ResponseEntity<?> getResumeDetails(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Resume resume = resumeService.getResumeDetails(user.getId());
            if (resume != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("uploadedAt", resume.getUploadedAt());
                response.put("fileType", resume.getFileType());
                response.put("fileName", resume.getFileName());
                response.put("id", resume.getId());
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/view")
    public ResponseEntity<Resource> viewResume(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Resource resource = resumeService.loadFileAsResource(user.getId());
            
            String filename = resource.getFilename();
            String contentType = (filename != null && filename.toLowerCase().endsWith(".pdf")) ? "application/pdf" : "application/octet-stream";
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + (filename != null ? filename : "resume") + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
