package com.college.placementportal.service;

import com.college.placementportal.entity.Resume;
import com.college.placementportal.entity.Student;
import com.college.placementportal.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;
    
    @Autowired
    private StudentService studentService;

    private final Path fileStorageLocation;

    public ResumeService() {
        this.fileStorageLocation = Paths.get("uploads/resumes").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public Resume storeFile(MultipartFile file, Long userId) {
        Student student = studentService.getStudentEntity(userId);
        
        String rawFileName = file.getOriginalFilename();
        if (rawFileName == null) {
            throw new RuntimeException("File name cannot be null");
        }
        String originalFileName = StringUtils.cleanPath(rawFileName);
        String fileName = student.getRollNumber() + "_" + System.currentTimeMillis() + "_" + originalFileName;

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Optional<Resume> existingResumeOpt = resumeRepository.findByStudentId(student.getId());
            Resume resume = existingResumeOpt.orElse(new Resume());
            
            // Delete old file if replacing
            if (existingResumeOpt.isPresent() && resume.getFilePath() != null) {
                try {
                    Files.deleteIfExists(Paths.get(resume.getFilePath()));
                } catch (IOException e) {
                    System.err.println("Could not delete old resume file: " + e.getMessage());
                }
            }
            
            resume.setStudent(student);
            resume.setFilePath(targetLocation.toString());
            resume.setFileName(originalFileName);
            resume.setFileType(file.getContentType());
            resume.setUploadedAt(LocalDateTime.now());
            
            return resumeRepository.save(resume);
            
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(Long userId) {
        Student student = studentService.getStudentEntity(userId);
        Resume resume = resumeRepository.findByStudentId(student.getId())
                .orElseThrow(() -> new RuntimeException("Resume not found for student"));
        
        try {
            Path filePath = Paths.get(resume.getFilePath()).normalize();
            java.net.URI uri = filePath.toUri();
            if (uri == null) {
                throw new RuntimeException("Could not get URI for file");
            }
            Resource resource = new UrlResource(uri);
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found");
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found", ex);
        }
    }
    
    public Resume getResumeDetails(Long userId) {
        Student student = studentService.getStudentEntity(userId);
        return resumeRepository.findByStudentId(student.getId()).orElse(null);
    }

    /**
     * Fetch resume entity directly by student primary-key ID (not userId).
     * Used by admin endpoints.
     */
    public Resume getResumeByStudentId(Long studentId) {
        return resumeRepository.findByStudentId(studentId).orElse(null);
    }

    /**
     * Load a file resource given an absolute file-system path.
     * Used by admin resume endpoints that already hold the stored path.
     */
    public Resource loadFileAsResourceByPath(String filePath) {
        try {
            java.nio.file.Path path = java.nio.file.Paths.get(filePath).normalize();
            Resource resource = new UrlResource(java.util.Objects.requireNonNull(path.toUri()));
            if (resource.exists()) {
                return resource;
            }
            throw new RuntimeException("File not found: " + filePath);
        } catch (Exception ex) {
            throw new RuntimeException("File not found: " + filePath, ex);
        }
    }
}
