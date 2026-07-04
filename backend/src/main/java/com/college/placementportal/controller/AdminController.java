package com.college.placementportal.controller;

import com.college.placementportal.enums.ApplicationStatus;
import com.college.placementportal.service.AdminService;
import com.college.placementportal.service.ApplicationService;
import com.college.placementportal.service.ReportExportService;
import com.college.placementportal.service.AlumniDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Base64;
import org.springframework.web.multipart.MultipartFile;
import com.college.placementportal.dto.AdminProfileDto;
import com.college.placementportal.dto.PasswordChangeDto;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private ReportExportService reportExportService;

    @Autowired
    private AlumniDocumentService alumniDocumentService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/students/pending")
    public ResponseEntity<?> getPendingStudents() {
        return ResponseEntity.ok(adminService.getPendingStudents());
    }

    @PostMapping("/students/verify/{id}")
    public ResponseEntity<?> verifyStudent(@PathVariable @NonNull Long id, @RequestBody Map<String, Boolean> payload) {
        return ResponseEntity.ok(adminService.verifyStudent(id, payload.get("approved")));
    }

    public record BulkVerifyRequest(@NonNull List<Long> studentIds, Boolean approved) {}

    @PostMapping("/students/verify/bulk")
    public ResponseEntity<?> bulkVerifyStudents(@RequestBody BulkVerifyRequest request) {
        return ResponseEntity.ok(adminService.bulkVerifyStudents(request.studentIds(), request.approved()));
    }

    @GetMapping("/alumni")
    public ResponseEntity<?> getAllAlumni() {
        return ResponseEntity.ok(adminService.getAllAlumni());
    }

    @GetMapping("/alumni/pending")
    public ResponseEntity<?> getPendingAlumni() {
        return ResponseEntity.ok(adminService.getPendingAlumni());
    }

    @PostMapping("/alumni/verify/{id}")
    public ResponseEntity<?> verifyAlumni(@PathVariable @NonNull Long id, @RequestBody Map<String, Object> payload) {
        Boolean approved = (Boolean) payload.get("approved");
        String rejectionReason = (String) payload.get("rejectionReason");
        return ResponseEntity.ok(adminService.verifyAlumni(id, approved, rejectionReason));
    }

    @DeleteMapping("/alumni/{id}")
    public ResponseEntity<?> deleteAlumni(@PathVariable @NonNull Long id) {
        adminService.deleteAlumni(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Alumni account deleted successfully"
        ));
    }

    @GetMapping("/alumni/{id}/document")
    public ResponseEntity<Map<String, Object>> getAlumniDocumentMetadata(@PathVariable("id") Long id) {
        return ResponseEntity.ok(adminService.getAlumniDocumentMetadata(id));
    }

    @GetMapping("/alumni/documents/{fileName:.+}")
    public ResponseEntity<Resource> getAlumniDocument(@PathVariable String fileName) {
        Resource resource = alumniDocumentService.loadDocumentAsResource(fileName);
        String contentType = "application/octet-stream";
        try {
            contentType = Files.probeContentType(Paths.get(resource.getFile().getAbsolutePath()));
        } catch (Exception ex) {
            // Fallback
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<?> getPendingJobs() {
        return ResponseEntity.ok(adminService.getPendingJobs());
    }

    @PostMapping("/jobs/moderate/{id}")
    public ResponseEntity<?> moderateJob(@PathVariable @NonNull Long id, @RequestBody Map<String, Object> payload) {
        Boolean approved = (Boolean) payload.get("approved");
        String rejectionReason = (String) payload.get("rejectionReason");
        return ResponseEntity.ok(adminService.moderateJob(id, approved, rejectionReason));
    }

    @GetMapping("/applications/shortlisted")
    public ResponseEntity<?> getShortlistedApplications() {
        return ResponseEntity.ok(adminService.getShortlistedApplications());
    }

    @GetMapping("/jobs/{id}/applications")
    public ResponseEntity<?> getJobApplications(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobId(id));
    }

    @PostMapping("/applications/{id}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable @NonNull Long id, @RequestBody Map<String, String> payload) {
        ApplicationStatus status = ApplicationStatus.valueOf(payload.get("status"));
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }
    
    @GetMapping("/reports/export")
    public ResponseEntity<Resource> exportReports(
            @RequestParam String type, 
            @RequestParam String format) {
        
        Resource resource = reportExportService.generateReport(type, format);
        
        String contentType = format.equalsIgnoreCase("EXCEL") ? 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : 
            "text/csv";
            
        String extension = format.equalsIgnoreCase("EXCEL") ? ".xlsx" : ".csv";
        String filename = type.toLowerCase() + "_report" + extension;
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @GetMapping("/profile")
    public ResponseEntity<AdminProfileDto> getProfile(Principal principal) {
        return ResponseEntity.ok(adminService.getAdminProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<AdminProfileDto> updateProfile(Principal principal, @RequestBody AdminProfileDto dto) {
        return ResponseEntity.ok(adminService.updateAdminProfile(principal.getName(), dto));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<?> uploadProfileImage(Principal principal, @RequestParam("image") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            String imageUrl = "data:" + file.getContentType() + ";base64," + base64Image;
            adminService.updateAdminProfileImage(principal.getName(), imageUrl);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload image"));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(Principal principal, @RequestBody PasswordChangeDto dto) {
        boolean success = adminService.changePassword(principal.getName(), dto);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect current password"));
        }
    }
}
