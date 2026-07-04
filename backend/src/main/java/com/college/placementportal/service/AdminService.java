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
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class AdminService {

    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);

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

    @Transactional
    public void deleteAlumni(@NonNull Long alumniId) {
        Alumni alumni = alumniRepository.findById(alumniId)
                .orElseThrow(() -> new ResourceNotFoundException("Alumni", alumniId));

        User user = alumni.getUser();

        // Delete associated document physical file
        String docUrl = alumni.getVerificationDocumentUrl();
        if (docUrl != null && !docUrl.isEmpty()) {
            String fileName = docUrl.substring(docUrl.lastIndexOf('/') + 1);
            alumniDocumentService.deleteDocument(fileName);
        }
        
        String profileUrl = alumni.getProfileImageUrl();
        if (profileUrl != null && !profileUrl.isEmpty() && !profileUrl.startsWith("http")) {
            String fileName = profileUrl.substring(profileUrl.lastIndexOf('/') + 1);
            alumniDocumentService.deleteDocument(fileName);
        }

        // Delete jobs posted by this alumni and their applications
        List<Job> jobs = jobRepository.findByPostedById(user.getId());
        if (!jobs.isEmpty()) {
            List<Long> jobIds = jobs.stream().map(job -> job.getId()).collect(java.util.stream.Collectors.toList());
            applicationRepository.deleteByJobIdIn(jobIds);
            jobRepository.deleteByPostedById(user.getId());
        }

        // Delete audit logs
        auditLogRepository.deleteByPerformedById(user.getId());

        User admin = getCurrentAdmin();
        String alumniName = user != null ? user.getName() : "Unknown";

        // Hard-delete the Alumni record from the database
        alumniRepository.delete(alumni);
        
        // Explicitly delete the linked user account to allow re-registration
        userRepository.delete(user);
        
        logAction("ALUMNI_DELETED", "Admin " + (admin != null ? admin.getName() : "Unknown") + " deleted alumni " + alumniName + " on " + LocalDateTime.now().toLocalDate());
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
        logger.info("Service: Retrieving admin profile for authenticated user email: {}", email);
        User user = userRepository.findByEmail(email).orElseThrow(() -> {
            logger.error("Admin user lookup failed. User not found for email: {}", email);
            return new ResourceNotFoundException("User not found");
        });
        
        logger.info("User lookup successful. User ID: {}", user.getId());
        logger.info("Repository: Fetching AdminProfile for User ID: {}", user.getId());
        
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> {
                logger.error("Admin profile record not found for user ID: {}", user.getId());
                return new ResourceNotFoundException("Admin profile not found");
            });

        logger.info("Admin lookup successful. Retrieved Admin Entity: AdminProfile(id={}) for Admin ID: {}", profile.getId(), profile.getId());
        logger.info("Starting DTO mapping...");
        
        AdminProfileDto dto = new AdminProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName() != null ? user.getName() : "");
        dto.setEmail(user.getEmail() != null ? user.getEmail() : "");
        dto.setRole(user.getRole() != null ? user.getRole().name() : "");
        dto.setStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : "ACTIVE");
        dto.setAccountCreatedDate(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        
        dto.setMobileNumber(profile.getMobileNumber());
        dto.setLocation(profile.getLocation());
        dto.setGender(profile.getGender());
        dto.setDepartment(profile.getDepartment());
        dto.setDesignation(profile.getDesignation());
        dto.setEmployeeId(profile.getEmployeeId());
        dto.setOfficeLocation(profile.getOfficeLocation());
        dto.setProfileImageUrl(profile.getProfileImageUrl() != null && !profile.getProfileImageUrl().isEmpty() ? profile.getProfileImageUrl() : "default_profile_image.png");
        
        logger.info("DTO mapping status: SUCCESS for Admin ID: {}", profile.getId());
        return dto;
    }

    public AdminProfileDto updateAdminProfile(String email, AdminProfileDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setName(dto.getName());
        
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty() && !dto.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new com.college.placementportal.exception.DuplicateEntryException("This email address is already associated with another account.");
            }
            user.setEmail(dto.getEmail());
        }
        userRepository.save(user);

        AdminProfile profile = adminProfileRepository.findByUserId(user.getId()).orElse(new AdminProfile());
        profile.setUser(user);
        profile.setMobileNumber(dto.getMobileNumber());
        profile.setLocation(dto.getLocation());
        profile.setGender(dto.getGender());
        profile.setDepartment(dto.getDepartment());
        profile.setDesignation(dto.getDesignation());
        profile.setEmployeeId(dto.getEmployeeId());
        profile.setOfficeLocation(dto.getOfficeLocation());
        
        adminProfileRepository.save(profile);
        return getAdminProfile(user.getEmail());
    }

    public void updateAdminProfileImage(String email, String imageUrl) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId()).orElse(new AdminProfile());
        profile.setUser(user);
        profile.setProfileImageUrl(imageUrl);
        adminProfileRepository.save(profile);
    }

    public void deleteAdminProfileImage(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AdminProfile profile = adminProfileRepository.findByUserId(user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Admin profile not found"));
        profile.setProfileImageUrl(null);
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
                    .path(java.util.Objects.requireNonNull(fileName))
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
