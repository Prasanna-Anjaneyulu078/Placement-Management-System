package com.college.placementportal.service;

import com.college.placementportal.entity.Alumni;
import com.college.placementportal.entity.Job;
import com.college.placementportal.entity.Student;
import com.college.placementportal.enums.JobStatus;
import com.college.placementportal.enums.VerificationStatus;
import com.college.placementportal.repository.AlumniRepository;
import com.college.placementportal.repository.JobRepository;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.ApplicationRepository;
import com.college.placementportal.entity.Application;
import com.college.placementportal.enums.ApplicationStatus;
import com.college.placementportal.dto.response.StudentResponseDto;
import com.college.placementportal.dto.response.AlumniResponseDto;
import com.college.placementportal.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.college.placementportal.repository.AuditLogRepository;
import com.college.placementportal.entity.AuditLog;
import com.college.placementportal.entity.User;
import com.college.placementportal.entity.AdminProfile;
import com.college.placementportal.dto.AdminProfileDto;
import com.college.placementportal.dto.PasswordChangeDto;
import com.college.placementportal.repository.UserRepository;
import com.college.placementportal.repository.AdminProfileRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.lang.NonNull;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.time.LocalDateTime;
import com.college.placementportal.enums.AccountStatus;

@Service
public class AdminService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminProfileRepository adminProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private StudentService studentService;

    @Autowired
    private AlumniService alumniService;

    @Autowired
    private AlumniDocumentService alumniDocumentService;

    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.college.placementportal.repository.ResumeRepository resumeRepository;

    private User getCurrentAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email).orElse(null);
    }

    private void logAction(String action, String details) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setDetails(details);
        log.setPerformedBy(getCurrentAdmin());
        auditLogRepository.save(log);
    }

    public List<StudentResponseDto> getPendingStudents() {
        return studentRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream().map(studentService::mapToDto).toList();
    }

    public StudentResponseDto verifyStudent(@NonNull Long studentId, boolean isApproved) {
        Student student = studentRepository.findById(studentId).orElseThrow(() -> new ResourceNotFoundException("Student", studentId));
        student.setVerificationStatus(isApproved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED);
        Student updated = studentRepository.save(student);
        logAction(isApproved ? "STUDENT_APPROVED" : "STUDENT_REJECTED", "Student ID: " + studentId);
        return studentService.mapToDto(updated);
    }

    public String bulkVerifyStudents(@NonNull List<Long> studentIds, boolean isApproved) {
        List<Student> students = studentRepository.findAllById(studentIds);
        for (Student student : students) {
            student.setVerificationStatus(isApproved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED);
        }
        studentRepository.saveAll(students);
        logAction("BULK_STUDENT_VERIFICATION", "Count: " + students.size() + ", Approved: " + isApproved);
        return "Successfully verified " + students.size() + " students.";
    }

    public List<AlumniResponseDto> getPendingAlumni() {
        return alumniRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream().map(alumniService::mapToDto).toList();
    }

    public AlumniResponseDto verifyAlumni(@NonNull Long alumniId, boolean isApproved, String rejectionReason) {
        Alumni alumni = alumniRepository.findById(alumniId).orElseThrow(() -> new ResourceNotFoundException("Alumni", alumniId));
        alumni.setVerificationStatus(isApproved ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED);
        if (!isApproved) {
            alumni.setRejectionReason(rejectionReason);
            alumni.setRejectedDate(LocalDateTime.now());
        }
        Alumni updated = alumniRepository.save(alumni);
        logAction(isApproved ? "ALUMNI_APPROVED" : "ALUMNI_REJECTED", "Alumni ID: " + alumniId);
        return alumniService.mapToDto(updated);
    }

    public void deleteAlumni(@NonNull Long alumniId) {
        Alumni alumni = alumniRepository.findById(alumniId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni", alumniId));

        // Delete associated document physical file
        String docUrl = alumni.getVerificationDocumentUrl();
        if (docUrl != null && !docUrl.isEmpty()) {
            String fileName = docUrl.substring(docUrl.lastIndexOf('/') + 1);
            alumniDocumentService.deleteDocument(fileName);
        }

        // Soft-delete the Alumni record
        alumni.setActive(false);
        alumni.setDeletedAt(LocalDateTime.now());
        User admin = getCurrentAdmin();
        alumni.setDeletedBy(admin != null ? admin.getName() : "Unknown Admin");

        // Deactivate the User account to prevent login
        if (alumni.getUser() != null) {
            alumni.getUser().setAccountStatus(AccountStatus.DELETED);
            userRepository.save(alumni.getUser());
        }

        alumniRepository.save(alumni);
        
        logAction("ALUMNI_DELETED", "Admin " + (admin != null ? admin.getName() : "Unknown") + " deleted alumni " + (alumni.getUser() != null ? alumni.getUser().getName() : "Unknown") + " on " + LocalDateTime.now().toLocalDate());
    }

    public List<Job> getPendingJobs() {
        return jobRepository.findByStatus(JobStatus.PENDING);
    }

    public Job moderateJob(@NonNull Long jobId, boolean isApproved, String rejectionReason) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        job.setStatus(isApproved ? JobStatus.APPROVED : JobStatus.REJECTED);
        if (!isApproved) {
            job.setRejectionReason(rejectionReason);
        }
        Job updated = jobRepository.save(job);
        logAction(isApproved ? "JOB_APPROVED" : "JOB_REJECTED", "Job ID: " + jobId);
        return updated;
    }
    
    public List<AlumniResponseDto> getAllAlumni() {
        return alumniRepository.findAll().stream().map(alumniService::mapToDto).toList();
    }
    
    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll().stream().map(studentService::mapToDto).toList();
    }
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    public List<Application> getShortlistedApplications() {
        return applicationRepository.findByStatusIn(
            Arrays.asList(
                ApplicationStatus.SHORTLISTED,
                ApplicationStatus.SELECTED
            )
        );
    }
    
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalStudents = studentRepository.count();
        long totalVerifiedStudents = studentRepository.countByVerificationStatus(VerificationStatus.VERIFIED);
        long totalAlumni = alumniRepository.count();
        long totalVerifiedAlumni = alumniRepository.countByVerificationStatus(VerificationStatus.VERIFIED);
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long shortlisted = applicationRepository.countByStatus(ApplicationStatus.SHORTLISTED);
        long selected = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        
        stats.put("totalStudents", totalStudents);
        stats.put("totalVerifiedStudents", totalVerifiedStudents);
        stats.put("totalAlumni", totalAlumni);
        stats.put("totalVerifiedAlumni", totalVerifiedAlumni);
        stats.put("totalJobs", totalJobs);
        stats.put("totalApplications", totalApplications);
        stats.put("shortlisted", shortlisted);
        stats.put("selected", selected);
        
        stats.put("activeJobs", jobRepository.countByStatus(JobStatus.ACTIVE));
        stats.put("pendingVerifications", 
            studentRepository.countByVerificationStatus(VerificationStatus.PENDING) + 
            alumniRepository.countByVerificationStatus(VerificationStatus.PENDING));

        // Placement Ready and Resumes Uploaded Stats
        long resumesUploaded = resumeRepository.count();
        long placementReady = studentRepository.findAll().stream().filter(s -> {
            boolean hasResume = resumeRepository.findByStudentId(s.getId()).isPresent();
            return s.getVerificationStatus() == VerificationStatus.VERIFIED && hasResume && s.getCgpa() != null && s.getCgpa() >= 6.5;
        }).count();

        stats.put("resumesUploaded", resumesUploaded);
        stats.put("placementReady", placementReady);

        return stats;
    }
    
    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAll();
    }

    public AdminProfileDto getAdminProfile(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId()).orElse(new AdminProfile());
        
        AdminProfileDto dto = new AdminProfileDto();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setAccountCreatedDate(user.getCreatedAt().toString());
        
        dto.setMobileNumber(profile.getMobileNumber());
        dto.setLocation(profile.getLocation());
        dto.setGender(profile.getGender());
        dto.setDepartment(profile.getDepartment() != null ? profile.getDepartment().getCode() : null);
        dto.setDesignation(profile.getDesignation());
        dto.setEmployeeId(profile.getEmployeeId());
        dto.setOfficeLocation(profile.getOfficeLocation());
        dto.setProfileImageUrl(profile.getProfileImageUrl());
        
        return dto;
    }

    public AdminProfileDto updateAdminProfile(String email, AdminProfileDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setName(dto.getName());
        userRepository.save(user);

        AdminProfile profile = adminProfileRepository.findByUserId(user.getId()).orElse(new AdminProfile());
        profile.setUser(user);
        profile.setMobileNumber(dto.getMobileNumber());
        profile.setLocation(dto.getLocation());
        profile.setGender(dto.getGender());
        profile.setDepartment(dto.getDepartment() != null ? com.college.placementportal.enums.Department.fromString(dto.getDepartment()) : null);
        profile.setDesignation(dto.getDesignation());
        profile.setEmployeeId(dto.getEmployeeId());
        profile.setOfficeLocation(dto.getOfficeLocation());
        
        adminProfileRepository.save(profile);
        return getAdminProfile(email);
    }

    public void updateAdminProfileImage(String email, String imageUrl) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId()).orElse(new AdminProfile());
        profile.setUser(user);
        profile.setProfileImageUrl(imageUrl);
        adminProfileRepository.save(profile);
    }

    public boolean changePassword(String email, PasswordChangeDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            return false;
        }
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
        return true;
    }

    public Map<String, Object> getAlumniDocumentMetadata(@NonNull Long alumniId) {
        Alumni alumni = alumniRepository.findById(alumniId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni", alumniId));
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("id", alumni.getId());
        metadata.put("fullName", alumni.getUser() != null ? alumni.getUser().getName() : "Unknown Alumni");
        
        String url = alumni.getVerificationDocumentUrl();
        if (url != null && !url.trim().isEmpty()) {
            String fileName = url.substring(url.lastIndexOf('/') + 1);
            
            // Construct the full documentUrl using ServletUriComponentsBuilder
            String fullDocumentUrl = org.springframework.web.servlet.support.ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/alumni/")
                    .path(fileName)
                    .toUriString();

            metadata.put("documentUrl", fullDocumentUrl);
            metadata.put("documentName", fileName);
            
            String type = "Verification Document";
            String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            if (ext.equals("pdf")) type = "PDF Document";
            else if (ext.matches("png|jpg|jpeg")) type = "Image Document";
            
            metadata.put("documentType", type);
            metadata.put("uploadDate", alumni.getUser() != null && alumni.getUser().getCreatedAt() != null ? alumni.getUser().getCreatedAt().toString() : null);
        } else {
            metadata.put("documentUrl", null);
        }
        
        return metadata;
    }
}
