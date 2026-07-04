package com.college.placementportal.service;

import com.college.placementportal.dto.request.AddAdminRequest;
import com.college.placementportal.dto.request.AddStudentRequest;
import com.college.placementportal.dto.response.UserCredentialsResponse;
import com.college.placementportal.entity.AdminProfile;
import com.college.placementportal.entity.Student;
import com.college.placementportal.entity.User;
import com.college.placementportal.enums.AccountStatus;
import com.college.placementportal.enums.Role;
import com.college.placementportal.enums.VerificationStatus;
import com.college.placementportal.exception.DuplicateEntryException;
import com.college.placementportal.exception.ResourceNotFoundException;
import com.college.placementportal.repository.AdminProfileRepository;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.UserRepository;
import com.college.placementportal.repository.SkillRepository;
import com.college.placementportal.repository.ProjectRepository;
import com.college.placementportal.repository.ResumeRepository;
import com.college.placementportal.repository.ApplicationRepository;
import com.college.placementportal.dto.response.StudentResponseDto;
import com.college.placementportal.dto.response.UserSummaryDto;
import com.college.placementportal.dto.response.ProjectDto;
import com.college.placementportal.entity.Application;
import com.college.placementportal.entity.Skill;
import com.college.placementportal.entity.Project;
import com.college.placementportal.entity.Alumni;
import com.college.placementportal.entity.Job;
import com.college.placementportal.enums.ApplicationStatus;
import com.college.placementportal.repository.AlumniRepository;
import com.college.placementportal.repository.JobRepository;
import com.college.placementportal.repository.AuditLogRepository;
import java.security.Principal;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.apache.poi.ss.usermodel.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AdminUserManagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AdminProfileRepository adminProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AlumniDocumentService alumniDocumentService;

    @Transactional
    public void deleteStudent(@NonNull Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        student.setActive(false);
        student.getUser().setAccountStatus(AccountStatus.INACTIVE);
        studentRepository.save(student);

        auditLogService.logAction("Student Removed", "Soft deleted student account: " + student.getUser().getName() + " (" + student.getRollNumber() + ")");
    }

    public String generateTempPassword(String rollNumber) {
        if (rollNumber == null || rollNumber.length() < 6) {
            throw new IllegalArgumentException("Invalid Roll Number Format");
        }
        String firstTwo = rollNumber.substring(0, 2);
        String lastFour = rollNumber.substring(rollNumber.length() - 4);
        return "vvitu@" + firstTwo + lastFour;
    }

    @Transactional
    public UserCredentialsResponse addStudent(AddStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Email is already in use");
        }
        
        String rollNumber = request.getRollNumber();
        String tempPassword = generateTempPassword(rollNumber);
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(Role.STUDENT);
        user.setAccountStatus(AccountStatus.ACTIVE);
        
        Student student = new Student();
        student.setUser(user);
        student.setRollNumber(request.getRollNumber());
        student.setMobileNumber(request.getMobileNumber());
        student.setDepartment(com.college.placementportal.enums.Department.fromString(request.getDepartment()));
        student.setSemester(request.getSemester());
        student.setAcademicYear(request.getAcademicYear());
        student.setVerificationStatus(VerificationStatus.VERIFIED);
        student.setProfileImageUrl("https://ui-avatars.com/api/?name=" + java.net.URLEncoder.encode(request.getName(), java.nio.charset.StandardCharsets.UTF_8) + "&background=random");
        
        studentRepository.save(student);
        
        return new UserCredentialsResponse(user.getName(), user.getEmail(), tempPassword, request.getRollNumber());
    }

    @Transactional
    public UserCredentialsResponse addAdmin(AddAdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Email is already in use");
        }
        
        // Generate temporary password
        String tempPassword = "admin@" + request.getMobileNumber().substring(Math.max(0, request.getMobileNumber().length() - 4));
        
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setRole(Role.ADMIN);
        user.setAccountStatus(AccountStatus.ACTIVE);
        
        AdminProfile admin = new AdminProfile();
        admin.setUser(user);
        admin.setMobileNumber(request.getMobileNumber());
        admin.setDesignation(request.getDesignation());
        admin.setDepartment(request.getDepartment());
        admin.setProfileImageUrl("https://ui-avatars.com/api/?name=" + java.net.URLEncoder.encode(request.getName(), java.nio.charset.StandardCharsets.UTF_8) + "&background=random");
        
        adminProfileRepository.save(admin);
        
        return new UserCredentialsResponse(user.getName(), user.getEmail(), tempPassword, request.getDesignation());
    }

    public List<StudentResponseDto> getAllStudents() {
        return studentRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream().map(student -> {
            StudentResponseDto dto = new StudentResponseDto();
            dto.setId(student.getId());
            
            UserSummaryDto userDto = new UserSummaryDto();
            userDto.setId(student.getUser().getId());
            userDto.setName(student.getUser().getName());
            userDto.setEmail(student.getUser().getEmail());
            userDto.setRole(student.getUser().getRole().name());
            userDto.setAccountStatus(student.getUser().getAccountStatus().name());
            dto.setUser(userDto);
            dto.setCreatedAt(student.getUser().getCreatedAt());
            
            dto.setRollNumber(student.getRollNumber());
            dto.setDepartment(student.getDepartment() != null ? student.getDepartment().getCode() : null);
            dto.setMobileNumber(student.getMobileNumber());
            dto.setLocation(student.getLocation());
            dto.setGithubUrl(student.getGithubUrl());
            dto.setLinkedinUrl(student.getLinkedinUrl());
            dto.setProfileImageUrl(student.getProfileImageUrl());
            dto.setCgpa(student.getCgpa());
            dto.setSemester(student.getSemester());
            dto.setBacklogs(student.getBacklogs());
            dto.setAcademicYear(student.getAcademicYear());
            dto.setVerificationStatus(student.getVerificationStatus().name());
            
            List<Skill> skills = skillRepository.findByStudentId(student.getId());
            dto.setSkills(skills.stream().map(skill -> skill.getName()).collect(Collectors.toList()));
            
            List<Project> projects = projectRepository.findByStudentId(student.getId());
            dto.setProjects(projects.stream().map(p -> {
                ProjectDto pdto = new ProjectDto();
                pdto.setId(p.getId());
                pdto.setTitle(p.getTitle());
                pdto.setDescription(p.getDescription());
                pdto.setSourceUrl(p.getSourceUrl());
                pdto.setDemoUrl(p.getDemoUrl());
                return pdto;
            }).collect(Collectors.toList()));
            
            boolean hasResume = resumeRepository.findByStudentId(student.getId()).isPresent();
            dto.setHasResume(hasResume);
            
            boolean isPlacementReady = student.getVerificationStatus() == VerificationStatus.VERIFIED && hasResume && student.getCgpa() != null && student.getCgpa() >= 6.5;
            dto.setPlacementReady(isPlacementReady);
            
            List<Application> applications = applicationRepository.findByStudentId(student.getId());
            long applied = applications.size();
            long shortlisted = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.SHORTLISTED).count();
            long selected = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.SELECTED).count();
            long rejected = applications.stream().filter(a -> a.getStatus() == ApplicationStatus.REJECTED).count();
            
            dto.setApplicationStats(new StudentResponseDto.ApplicationStats(applied, shortlisted, selected, rejected));
            
            // Return null if soft deleted so it gets filtered out, or let frontend handle it.
            if (!student.isActive()) {
                return null;
            }
            
            return dto;
        }).filter(java.util.Objects::nonNull).collect(Collectors.toList());
    }
    
    public List<AdminProfile> getAllAdmins() {
        return adminProfileRepository.findAll();
    }
    
    @Transactional
    public void toggleUserStatus(@NonNull Long userId, AccountStatus status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setAccountStatus(status);
        userRepository.save(user);
    }
    
    @Transactional
    public void hardDeleteAlumni(@NonNull Long alumniId, Principal principal) {
        Alumni alumni = alumniRepository.findById(alumniId)
            .orElseThrow(() -> new ResourceNotFoundException("Alumni not found"));
            
        User user = alumni.getUser();
        
        // Delete files
        if (alumni.getProfileImageUrl() != null && !alumni.getProfileImageUrl().isEmpty() && !alumni.getProfileImageUrl().startsWith("http")) {
            String fileName = alumni.getProfileImageUrl().substring(alumni.getProfileImageUrl().lastIndexOf("/") + 1);
            alumniDocumentService.deleteDocument(fileName);
        }
        if (alumni.getVerificationDocumentUrl() != null && !alumni.getVerificationDocumentUrl().isEmpty() && !alumni.getVerificationDocumentUrl().startsWith("http")) {
            String fileName = alumni.getVerificationDocumentUrl().substring(alumni.getVerificationDocumentUrl().lastIndexOf("/") + 1);
            alumniDocumentService.deleteDocument(fileName);
        }
        
        // Delete jobs posted by this alumni and their applications
        List<Job> jobs = jobRepository.findByPostedById(user.getId());
        if (!jobs.isEmpty()) {
            List<Long> jobIds = jobs.stream().map(job -> job.getId()).collect(Collectors.toList());
            applicationRepository.deleteByJobIdIn(jobIds);
            jobRepository.deleteByPostedById(user.getId());
        }
        
        // Delete audit logs
        auditLogRepository.deleteByPerformedById(user.getId());
        
        // Delete Alumni
        alumniRepository.delete(alumni);
        
        // Explicitly delete User
        userRepository.delete(user);
        
        // Log deletion
        String adminName = principal != null ? principal.getName() : "System Admin";
        auditLogService.logAction("Alumni Permanently Deleted", "Hard deleted alumni: " + user.getName() + " (Roll: " + alumni.getRollNumber() + ") by " + adminName);
    }
    
    @Transactional
    public boolean verifyStudent(@NonNull Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            
        if (student.getVerificationStatus() == VerificationStatus.VERIFIED) {
            return false;
        }
        
        student.setVerificationStatus(VerificationStatus.VERIFIED);
        
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            student.setVerifiedBy(authentication.getName());
        }
        student.setVerifiedAt(java.time.LocalDateTime.now());
        
        studentRepository.save(student);
        
        auditLogService.logAction("Student Approved", "Approved student profile: " + student.getUser().getName() + " (" + student.getRollNumber() + ")");
        return true;
    }
    
    @Transactional
    public UserCredentialsResponse resetStudentPassword(@NonNull Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        
        String rollNumber = student.getRollNumber();
        String tempPassword = generateTempPassword(rollNumber);
        
        User user = student.getUser();
        user.setPassword(passwordEncoder.encode(tempPassword));
        userRepository.save(user);
        
        auditLogService.logAction("Password Reset", "Reset password for student: " + student.getUser().getName() + " (" + student.getRollNumber() + ")");
        
        return new UserCredentialsResponse(user.getName(), user.getEmail(), tempPassword, rollNumber);
    }
    
    @Transactional
    public java.util.Map<String, Object> migratePasswords() {
        java.util.List<Student> students = studentRepository.findAll();
        int updated = 0;
        int failed = 0;
        for (Student s : students) {
            try {
                if (s.getRollNumber() != null && s.getRollNumber().length() >= 6 && s.getUser() != null) {
                    String tempPassword = generateTempPassword(s.getRollNumber());
                    s.getUser().setPassword(passwordEncoder.encode(tempPassword));
                    updated++;
                } else {
                    failed++;
                }
            } catch (Exception e) {
                failed++;
            }
        }
        userRepository.saveAll(Objects.requireNonNull(students.stream().filter(s -> s != null).map(s -> s.getUser()).filter(Objects::nonNull).collect(Collectors.toList())));
        return java.util.Map.of("updated", updated, "failed", failed);
    }
    
    @Transactional
    public Map<String, Integer> importStudents(MultipartFile file) {
        int created = 0;
        int skipped = 0;
        int failed = 0;
        
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            // Skip header row
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                try {
                    String rollNumber = getCellValueAsString(row.getCell(0));
                    String name = getCellValueAsString(row.getCell(1));
                    String email = getCellValueAsString(row.getCell(2));
                    String mobileNumber = getCellValueAsString(row.getCell(3));
                    String department = getCellValueAsString(row.getCell(4));
                    String semesterStr = getCellValueAsString(row.getCell(5));
                    String academicYear = getCellValueAsString(row.getCell(6));
                    
                    if (email == null || rollNumber == null) {
                        skipped++;
                        continue;
                    }
                    
                    if (userRepository.existsByEmail(email)) {
                        skipped++;
                        continue;
                    }
                    
                    AddStudentRequest req = new AddStudentRequest();
                    req.setRollNumber(rollNumber);
                    req.setName(name);
                    req.setEmail(email);
                    req.setMobileNumber(mobileNumber);
                    req.setDepartment(department);
                    req.setSemester(semesterStr != null && !semesterStr.isEmpty() ? (int) Double.parseDouble(semesterStr) : 1);
                    req.setAcademicYear(academicYear);
                    
                    addStudent(req);
                    created++;
                } catch (Exception e) {
                    failed++;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process Excel file", e);
        }
        
        Map<String, Integer> summary = new HashMap<>();
        summary.put("created", created);
        summary.put("skipped", skipped);
        summary.put("failed", failed);
        return summary;
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf(cell.getNumericCellValue());
        }
        return null;
    }
}
