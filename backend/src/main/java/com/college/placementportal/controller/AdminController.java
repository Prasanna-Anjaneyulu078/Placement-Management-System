package com.college.placementportal.controller;

import com.college.placementportal.enums.ApplicationStatus;
import com.college.placementportal.service.AdminService;
import com.college.placementportal.service.ApplicationService;
import com.college.placementportal.service.ReportExportService;
import com.college.placementportal.service.AlumniDocumentService;
import com.college.placementportal.service.ResumeService;
import com.college.placementportal.service.StudentService;
import com.college.placementportal.service.JobService;
import com.college.placementportal.util.FileDownloadHelper;
import com.college.placementportal.entity.Resume;
import com.college.placementportal.entity.Student;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminService adminService;

    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private ReportExportService reportExportService;

    @Autowired
    private AlumniDocumentService alumniDocumentService;

    @Autowired
    private ResumeService resumeService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private JobService jobService;

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
        try {
            adminService.deleteAlumni(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Alumni account permanently deleted"
            ));
        } catch (com.college.placementportal.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "success", false,
                "message", "Alumni record not found"
            ));
        }
    }

    @GetMapping("/alumni/{id}/document")
    public ResponseEntity<Map<String, Object>> getAlumniDocumentMetadata(@PathVariable("id") @NonNull Long id) {
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
        // Extract roll number from stored filename pattern: alumni_doc_ROLLNUMBER_TIMESTAMP.ext
        String rollNumber = extractRollFromAlumniFilename(fileName);
        String ext = FileDownloadHelper.extractExtension(fileName);
        String downloadName = FileDownloadHelper.buildFilename(rollNumber, "VerificationDocument", ext);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + downloadName + "\"")
                .body(resource);
    }

    /** Extract the roll number segment from a stored alumni filename: alumni_doc_ROLLNUMBER_TIMESTAMP.ext */
    private String extractRollFromAlumniFilename(String fileName) {
        if (fileName == null) return null;
        // Pattern: alumni_doc_<ROLL>_<TIMESTAMP>.ext
        try {
            String base = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
            String[] parts = base.split("_", 4);
            // parts: ["alumni", "doc", ROLL, TIMESTAMP]
            if (parts.length >= 3) return parts[2];
        } catch (Exception ignored) {}
        return null;
    }

    // -------------------------------------------------------------------------
    // Admin: Student Resume View & Download
    // -------------------------------------------------------------------------

    /**
     * Admin views a student's resume inline (PDF viewer).
     */
    @GetMapping("/students/{studentId}/resume/view")
    public ResponseEntity<Resource> adminViewStudentResume(@PathVariable("studentId") @NonNull Long studentId) {
        try {
            Student student = studentService.getStudentEntityById(studentId);
            Resume resume = resumeService.getResumeByStudentId(student.getId());
            if (resume == null) return ResponseEntity.notFound().build();

            Resource resource = resumeService.loadFileAsResourceByPath(resume.getFilePath());
            String ext = FileDownloadHelper.extractExtension(resume.getFileName());
            String viewName = FileDownloadHelper.buildFilename(student.getRollNumber(), "Resume", ext);
            String contentType = "pdf".equals(ext) ? "application/pdf" : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + viewName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Admin downloads a student's resume with a standardized filename.
     */
    @GetMapping("/students/{studentId}/resume/download")
    public ResponseEntity<Resource> adminDownloadStudentResume(@PathVariable("studentId") @NonNull Long studentId) {
        try {
            Student student = studentService.getStudentEntityById(studentId);
            Resume resume = resumeService.getResumeByStudentId(student.getId());
            if (resume == null) return ResponseEntity.notFound().build();

            Resource resource = resumeService.loadFileAsResourceByPath(resume.getFilePath());
            String ext = FileDownloadHelper.extractExtension(resume.getFileName());
            String downloadName = FileDownloadHelper.buildFilename(student.getRollNumber(), "Resume", ext);
            String contentType = "pdf".equals(ext) ? "application/pdf" : "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
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
    public ResponseEntity<?> getProfile(Principal principal) {
        if (principal == null || principal.getName() == null) {
            logger.warn("Unauthorized access attempt to /api/admin/profile");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "User not authenticated"));
        }
        logger.info("Controller: GET /api/admin/profile called by user: {}", principal.getName());
        return ResponseEntity.ok(adminService.getAdminProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(Principal principal, @RequestBody AdminProfileDto dto) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized access"));
        }
        return ResponseEntity.ok(adminService.updateAdminProfile(principal.getName(), dto));
    }

    @PostMapping("/profile/image")
    public ResponseEntity<?> uploadProfileImage(Principal principal, @RequestParam("image") MultipartFile file) throws Exception {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized access"));
        }
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }
        String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
        String imageUrl = "data:" + file.getContentType() + ";base64," + base64Image;
        adminService.updateAdminProfileImage(principal.getName(), imageUrl);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    @DeleteMapping("/profile/image")
    public ResponseEntity<?> deleteProfileImage(Principal principal) {
        if (principal == null || principal.getName() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Unauthorized access"));
        }
        adminService.deleteAdminProfileImage(principal.getName());
        return ResponseEntity.ok(Map.of("success", true, "message", "Profile image deleted successfully"));
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
