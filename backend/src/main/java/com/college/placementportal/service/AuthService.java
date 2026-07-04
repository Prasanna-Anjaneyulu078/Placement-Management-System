package com.college.placementportal.service;

import com.college.placementportal.dto.LoginRequest;
import com.college.placementportal.dto.JwtResponse;
import com.college.placementportal.dto.request.ChangePasswordRequest;
import com.college.placementportal.dto.RegisterAlumniRequest;
import com.college.placementportal.dto.RegisterStudentRequest;
import com.college.placementportal.entity.Alumni;
import com.college.placementportal.entity.Student;
import com.college.placementportal.entity.User;
import com.college.placementportal.enums.Role;
import com.college.placementportal.enums.VerificationStatus;
import com.college.placementportal.repository.AlumniRepository;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.UserRepository;
import com.college.placementportal.repository.StudentMasterRepository;
import com.college.placementportal.entity.StudentMaster;
import com.college.placementportal.security.JwtUtils;
import com.college.placementportal.exception.DuplicateEntryException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AlumniDocumentService alumniDocumentService;

    @Autowired
    private StudentMasterRepository studentMasterRepository;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        User userDetails = (User) authentication.getPrincipal();
        String jwt = jwtUtils.generateToken(userDetails);
        
        userDetails.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(userDetails);

        String verificationStatus = null;
        if (userDetails.getRole() == Role.ALUMNI) {
            verificationStatus = alumniRepository.findByUserId(userDetails.getId())
                .map(a -> a.getVerificationStatus().name()).orElse(null);
        } else if (userDetails.getRole() == Role.STUDENT) {
            verificationStatus = studentRepository.findByUserId(userDetails.getId())
                .map(s -> s.getVerificationStatus().name()).orElse(null);
        }

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getRole().name(),
                verificationStatus);
    }

    @Transactional
    public void registerStudent(RegisterStudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Error: Email is already in use!");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);

        Student student = new Student();
        student.setUser(user);
        student.setRollNumber(request.getRollNumber());
        student.setCgpa(request.getCgpa());
        student.setSemester(request.getSemester());
        student.setBacklogs(request.getBacklogs());
        student.setAcademicYear(request.getAcademicYear());
        student.setVerificationStatus(VerificationStatus.PENDING);

        studentRepository.save(student);
    }

    @Transactional
    public void registerAlumni(RegisterAlumniRequest request, MultipartFile document) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEntryException("Error: Email is already in use!");
        }

        // Validate Roll Number
        StudentMaster studentMaster = studentMasterRepository.findByRollNumber(request.getRollNumber())
                .orElseThrow(() -> new RuntimeException("Roll Number not found in VVIT records. Please contact the Placement Cell."));

        // Validate Name (case-insensitive and trimmed)
        if (!studentMaster.getFullName().trim().equalsIgnoreCase(request.getName().trim())) {
            throw new RuntimeException("Name does not match college records.");
        }

        // Validate Document
        if (document == null || document.isEmpty()) {
            throw new RuntimeException("Verification document is required.");
        }
        
        long maxFileSize = 5 * 1024 * 1024; // 5 MB
        if (document.getSize() > maxFileSize) {
            throw new RuntimeException("Document size exceeds the maximum limit of 5MB.");
        }
        
        String contentType = document.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("application/pdf"))) {
            throw new RuntimeException("Invalid document format. Only JPG, JPEG, PNG, and PDF are allowed.");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(Role.ALUMNI);

        Alumni alumni = new Alumni();
        alumni.setUser(user);
        alumni.setCompany(request.getCompany());
        alumni.setDesignation(request.getDesignation());
        alumni.setPassingYear(request.getPassingYear());
        
        alumni.setRollNumber(request.getRollNumber());
        alumni.setDepartment(com.college.placementportal.enums.Department.fromString(request.getDepartment()));
        alumni.setDegree(request.getDegree());
        alumni.setMobileNumber(request.getMobileNumber());
        alumni.setGender(request.getGender());
        alumni.setLinkedinUrl(request.getLinkedinUrl());

        alumni.setVerificationStatus(VerificationStatus.PENDING);
        alumni.setProfileImageUrl("https://ui-avatars.com/api/?name=" + java.net.URLEncoder.encode(request.getName(), java.nio.charset.StandardCharsets.UTF_8) + "&background=random");

        String documentUrl = alumniDocumentService.storeDocument(document, request.getRollNumber());
        alumni.setVerificationDocumentUrl(documentUrl);

        alumniRepository.save(alumni);
    }
    
    @Transactional
    public void changePassword(ChangePasswordRequest request, String currentEmail) {
        if (!request.getEmail().equals(currentEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!encoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid old password");
        }
        
        user.setPassword(encoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
