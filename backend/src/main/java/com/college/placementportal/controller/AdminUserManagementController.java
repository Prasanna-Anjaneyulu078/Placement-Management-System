package com.college.placementportal.controller;

import com.college.placementportal.dto.request.AddAdminRequest;
import com.college.placementportal.dto.request.AddStudentRequest;
import com.college.placementportal.dto.response.UserCredentialsResponse;
import com.college.placementportal.entity.AdminProfile;
import com.college.placementportal.enums.AccountStatus;
import com.college.placementportal.service.AdminUserManagementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.lang.NonNull;
import java.security.Principal;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserManagementController {

    @Autowired
    private AdminUserManagementService userManagementService;

    @Autowired
    private com.college.placementportal.service.AdminExportService adminExportService;

    @PostMapping("/students/migrate-passwords")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<?> migratePasswords() {
        return ResponseEntity.ok(userManagementService.migratePasswords());
    }

    // --- Student Management ---
    @PostMapping("/students/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<byte[]> exportStudents(@Valid @RequestBody com.college.placementportal.dto.request.ExportStudentRequest request) throws Exception {
        byte[] fileData = adminExportService.exportStudents(request);
        String format = request.getFormat().toUpperCase();
        String contentType = "application/octet-stream";
        String extension = "txt";

        if ("EXCEL".equals(format)) {
            contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            extension = "xlsx";
        } else if ("CSV".equals(format)) {
            contentType = "text/csv";
            extension = "csv";
        } else if ("PDF".equals(format)) {
            contentType = "application/pdf";
            extension = "pdf";
        }

        String filename = "Students_Export_" + java.time.LocalDate.now() + "." + extension;

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(fileData);
    }

    // --- Student Management ---
    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<com.college.placementportal.dto.response.StudentResponseDto>> getAllStudents() {
        return ResponseEntity.ok(userManagementService.getAllStudents());
    }

    @GetMapping("/students/test")
    public ResponseEntity<List<com.college.placementportal.dto.response.StudentResponseDto>> testGetAllStudents() {
        return ResponseEntity.ok(userManagementService.getAllStudents());
    }

    @PostMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserCredentialsResponse> addStudent(@Valid @RequestBody AddStudentRequest request) {
        return ResponseEntity.ok(userManagementService.addStudent(request));
    }

    @PutMapping("/students/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> toggleStudentStatus(@PathVariable @NonNull Long id, @RequestParam AccountStatus status) {
        userManagementService.toggleUserStatus(id, status);
        return ResponseEntity.ok("Status updated successfully");
    }

    @PutMapping("/students/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> verifyStudent(@PathVariable @NonNull Long id) {
        userManagementService.verifyStudent(id);
        return ResponseEntity.ok("Student verified successfully");
    }
    
    @PatchMapping("/students/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> approveStudent(@PathVariable @NonNull Long id) {
        boolean approved = userManagementService.verifyStudent(id);
        if (!approved) {
            return ResponseEntity.ok(java.util.Map.of("success", false, "message", "Student is already approved"));
        }
        return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Student approved successfully"));
    }

    @PostMapping("/students/{id}/reset-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<UserCredentialsResponse> resetStudentPassword(@PathVariable @NonNull Long id) {
        // id is student id
        return ResponseEntity.ok(userManagementService.resetStudentPassword(id));
    }
    
    @DeleteMapping("/students/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteStudent(@PathVariable @NonNull Long id) {
        userManagementService.deleteStudent(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Student deleted successfully"));
    }
    
    @PostMapping("/students/import")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Integer>> importStudents(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(userManagementService.importStudents(file));
    }

    // --- Admin Management ---
    @GetMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<AdminProfile>> getAllAdmins() {
        return ResponseEntity.ok(userManagementService.getAllAdmins());
    }

    @PostMapping("/admins")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UserCredentialsResponse> addAdmin(@Valid @RequestBody AddAdminRequest request) {
        return ResponseEntity.ok(userManagementService.addAdmin(request));
    }

    @DeleteMapping("/alumni/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> deleteAlumni(@PathVariable @NonNull Long id, Principal principal) {
        try {
            userManagementService.hardDeleteAlumni(id, principal);
            return ResponseEntity.ok(java.util.Map.of("success", true, "message", "Alumni account permanently deleted."));
        } catch (com.college.placementportal.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(java.util.Map.of("success", false, "message", "Alumni record not found."));
        }
    }
}
