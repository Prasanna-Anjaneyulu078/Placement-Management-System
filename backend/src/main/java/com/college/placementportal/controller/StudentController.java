package com.college.placementportal.controller;

import com.college.placementportal.entity.User;
import com.college.placementportal.service.StudentService;
import com.college.placementportal.service.ProfileImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.HashMap;
import com.college.placementportal.dto.response.ProjectDto;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired
    private StudentService studentService;
    
    @Autowired
    private ProfileImageService profileImageService;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(studentService.getStudentProfile(user.getId()));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<?> getStats(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(studentService.getStats(user.getId()));
    }
    
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody com.college.placementportal.entity.Student student, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(studentService.updateStudentProfile(user.getId(), student));
    }
    
    @PostMapping("/skills")
    public ResponseEntity<?> addSkill(@RequestBody Map<String, String> request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(studentService.addSkill(user.getId(), request.get("name")));
    }
    
    @DeleteMapping("/skills/{skillName}")
    public ResponseEntity<?> removeSkill(@PathVariable String skillName, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        studentService.removeSkill(user.getId(), skillName);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/projects")
    public ResponseEntity<?> addProject(@RequestBody ProjectDto request, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(studentService.addProject(user.getId(), request));
    }
    
    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<?> removeProject(@PathVariable Long projectId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        studentService.removeProject(user.getId(), projectId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/profile/image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("file") MultipartFile file, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/"))) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed"));
            }
            
            String fileUrl = profileImageService.storeFile(file, user.getId());
            Map<String, String> response = new HashMap<>();
            response.put("message", "Profile image uploaded successfully");
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/profile/image/{fileName:.+}")
    public ResponseEntity<Resource> downloadProfileImage(@PathVariable String fileName) {
        try {
            Resource resource = profileImageService.loadFileAsResource(fileName);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("image/" + fileName.substring(fileName.lastIndexOf(".") + 1)))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
