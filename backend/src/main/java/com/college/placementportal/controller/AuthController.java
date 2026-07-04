package com.college.placementportal.controller;

import com.college.placementportal.dto.JwtResponse;
import com.college.placementportal.dto.LoginRequest;
import com.college.placementportal.dto.RegisterAlumniRequest;
import com.college.placementportal.dto.RegisterStudentRequest;
import com.college.placementportal.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody RegisterStudentRequest request) {
        authService.registerStudent(request);
        return ResponseEntity.ok("Student registered successfully! Pending verification.");
    }

    @PostMapping(value = "/register/alumni", consumes = "multipart/form-data")
    public ResponseEntity<?> registerAlumni(
            @Valid @ModelAttribute RegisterAlumniRequest request,
            @RequestParam(value = "document", required = false) MultipartFile document) {
        authService.registerAlumni(request, document);
        return ResponseEntity.ok("Alumni registered successfully! Pending verification.");
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody com.college.placementportal.dto.request.ChangePasswordRequest request, org.springframework.security.core.Authentication authentication) {
        authService.changePassword(request, authentication.getName());
        return ResponseEntity.ok("Password changed successfully");
    }
}
