package com.college.placementportal.dto.response;

import com.college.placementportal.enums.ApplicationStatus;
import java.time.LocalDateTime;

public class AppliedJobDto {
    private Long id; // Application ID
    private Long jobId;
    private String jobTitle;
    private String company;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;

    public AppliedJobDto() {}

    public AppliedJobDto(Long id, Long jobId, String jobTitle, String company, ApplicationStatus status, LocalDateTime appliedAt) {
        this.id = id;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.company = company;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }
}
