package com.college.placementportal.service;

import com.college.placementportal.entity.Alumni;
import com.college.placementportal.repository.AlumniRepository;
import com.college.placementportal.repository.JobRepository;
import com.college.placementportal.repository.ApplicationRepository;
import com.college.placementportal.entity.Job;
import com.college.placementportal.exception.ResourceNotFoundException;
import com.college.placementportal.dto.response.AlumniResponseDto;
import com.college.placementportal.dto.response.UserSummaryDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class AlumniService {

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;

    public Alumni getAlumniEntity(Long userId) {
        return alumniRepository.findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException("Alumni profile not found for user ID: " + userId));
    }

    public AlumniResponseDto getAlumniProfile(Long userId) {
        return mapToDto(getAlumniEntity(userId));
    }
    
    public Map<String, Object> getStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        List<Job> jobs = jobRepository.findByPostedById(userId);
        stats.put("jobsPosted", jobs.size());
        int applicants = jobs.stream().mapToInt(j -> applicationRepository.findByJobId(j.getId()).size()).sum();
        stats.put("totalApplicants", applicants);
        stats.put("activeJobs", jobs.stream().filter(j -> j.getStatus().name().equals("APPROVED")).count());
        return stats;
    }
    
    public AlumniResponseDto updateAlumniProfile(Long userId, Alumni updatedAlumni) {
        Alumni alumni = getAlumniEntity(userId);
        alumni.setCompany(updatedAlumni.getCompany());
        alumni.setDesignation(updatedAlumni.getDesignation());
        alumni.setPassingYear(updatedAlumni.getPassingYear());
        return mapToDto(alumniRepository.save(alumni));
    }

    public AlumniResponseDto mapToDto(Alumni alumni) {
        AlumniResponseDto dto = new AlumniResponseDto();
        dto.setId(alumni.getId());
        dto.setCompany(alumni.getCompany());
        dto.setDesignation(alumni.getDesignation());
        dto.setPassingYear(alumni.getPassingYear());
        dto.setVerificationStatus(alumni.getVerificationStatus() != null ? alumni.getVerificationStatus().name() : null);
        dto.setRollNumber(alumni.getRollNumber());
        dto.setDepartment(alumni.getDepartment() != null ? alumni.getDepartment().getCode() : null);
        dto.setDegree(alumni.getDegree());
        dto.setMobileNumber(alumni.getMobileNumber());
        dto.setGender(alumni.getGender());
        dto.setLinkedinUrl(alumni.getLinkedinUrl());
        dto.setVerificationDocumentUrl(alumni.getVerificationDocumentUrl());
        dto.setProfileImageUrl(alumni.getProfileImageUrl());
        dto.setOcrVerified(alumni.getOcrVerified());
        dto.setOcrExtractedName(alumni.getOcrExtractedName());
        dto.setOcrExtractedRollNumber(alumni.getOcrExtractedRollNumber());
        dto.setOcrDetectedCollege(alumni.getOcrDetectedCollege());

        if (alumni.getUser() != null) {
            UserSummaryDto userDto = new UserSummaryDto(
                    alumni.getUser().getId(),
                    alumni.getUser().getName(),
                    alumni.getUser().getEmail(),
                    alumni.getUser().getRole().name()
            );
            dto.setUser(userDto);
        }
        return dto;
    }
}
