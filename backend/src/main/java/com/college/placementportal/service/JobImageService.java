package com.college.placementportal.service;

import com.college.placementportal.entity.Job;
import com.college.placementportal.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.lang.NonNull;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class JobImageService {

    @Autowired
    private JobRepository jobRepository;

    private final Path logoStorageLocation;
    private final Path bannerStorageLocation;

    public JobImageService() {
        this.logoStorageLocation = Paths.get("uploads/jobs/logos").toAbsolutePath().normalize();
        this.bannerStorageLocation = Paths.get("uploads/jobs/banners").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.logoStorageLocation);
            Files.createDirectories(this.bannerStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directories where the uploaded files will be stored.", ex);
        }
    }

    public String storeLogo(MultipartFile file, @NonNull Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        return storeImage(file, job, "logo", logoStorageLocation, "/api/jobs/images/logo/");
    }

    public String storeBanner(MultipartFile file, @NonNull Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        return storeImage(file, job, "banner", bannerStorageLocation, "/api/jobs/images/banner/");
    }

    private String storeImage(MultipartFile file, Job job, String type, Path storageLocation, @NonNull String endpointPath) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("File name is missing");
        }
        String originalFileName = StringUtils.cleanPath(originalFilename);
        
        String fileExtension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            fileExtension = originalFileName.substring(i);
        }
        
        String fileName = "job_" + job.getId() + "_" + type + "_" + System.currentTimeMillis() + fileExtension;

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }

            Path targetLocation = storageLocation.resolve(fileName);
            
            // Delete old file if replacing
            String oldUrl = type.equals("logo") ? job.getCompanyLogoUrl() : job.getJobBannerUrl();
            if (oldUrl != null) {
                try {
                    String oldFileName = oldUrl.substring(oldUrl.lastIndexOf("/") + 1);
                    Path oldFilePath = storageLocation.resolve(oldFileName).normalize();
                    Files.deleteIfExists(oldFilePath);
                } catch (Exception e) {
                    System.err.println("Could not delete old " + type + " image: " + e.getMessage());
                }
            }
            
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path(endpointPath)
                    .path(fileName)
                    .toUriString();
                    
            if (type.equals("logo")) {
                job.setCompanyLogoUrl(fileDownloadUri);
            } else {
                job.setJobBannerUrl(fileDownloadUri);
            }
            
            jobRepository.save(job);
            
            return fileDownloadUri;
            
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    public Resource loadLogoAsResource(String fileName) {
        return loadFileAsResource(fileName, logoStorageLocation);
    }

    public Resource loadBannerAsResource(String fileName) {
        return loadFileAsResource(fileName, bannerStorageLocation);
    }

    private Resource loadFileAsResource(String fileName, Path storageLocation) {
        try {
            Path filePath = storageLocation.resolve(fileName).normalize();
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
