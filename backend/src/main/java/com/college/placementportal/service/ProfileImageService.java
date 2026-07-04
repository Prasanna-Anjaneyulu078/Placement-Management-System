package com.college.placementportal.service;

import com.college.placementportal.entity.Student;
import com.college.placementportal.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class ProfileImageService {

    @Autowired
    private StudentService studentService;

    @Autowired
    private StudentRepository studentRepository;

    private final Path fileStorageLocation;

    public ProfileImageService() {
        this.fileStorageLocation = Paths.get("uploads/profiles").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, Long userId) {
        Student student = studentService.getStudentEntity(userId);
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("File name is missing");
        }
        String originalFileName = StringUtils.cleanPath(originalFilename);
        
        // Ensure valid extension
        String fileExtension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFileName.substring(i);
        }
        
        String fileName = "profile_" + student.getRollNumber() + "_" + System.currentTimeMillis() + fileExtension;

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            
            // Delete old file if replacing
            if (student.getProfileImageUrl() != null) {
                try {
                    String oldFileName = student.getProfileImageUrl().substring(student.getProfileImageUrl().lastIndexOf("/") + 1);
                    Path oldFilePath = this.fileStorageLocation.resolve(oldFileName).normalize();
                    Files.deleteIfExists(oldFilePath);
                } catch (Exception e) {
                    System.err.println("Could not delete old profile image: " + e.getMessage());
                }
            }
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/student/profile/image/")
                    .path(fileName)
                    .toUriString();
                    
            student.setProfileImageUrl(fileDownloadUri);
            studentRepository.save(student);
            
            return fileDownloadUri;
            
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            java.net.URI uri = filePath.toUri();
            if (uri == null) {
                throw new RuntimeException("Could not get URI for file " + fileName);
            }
            Resource resource = new UrlResource(uri);
            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("File not found " + fileName);
            }
        } catch (Exception ex) {
            throw new RuntimeException("File not found " + fileName, ex);
        }
    }
}
