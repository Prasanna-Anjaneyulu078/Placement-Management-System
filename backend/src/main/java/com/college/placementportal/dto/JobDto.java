package com.college.placementportal.dto;

import com.college.placementportal.enums.JobStatus;

import java.time.LocalDate;

public class JobDto {
    private Long id;
    private String title;
    private String company;
    private String description;
    private String location;
    private String jobType;
    private Double minCgpa;
    private Integer eligibleSemester;
    private Integer maxBacklogs;
    private LocalDate expiryDate;
    private JobStatus status;
    private String postedBy; // Name of the alumni/admin
    private String rejectionReason;
    public JobDto() {}

    public JobDto(Long id, String title, String company, String description, String location, String jobType, Double minCgpa, Integer eligibleSemester, Integer maxBacklogs, LocalDate expiryDate, JobStatus status, String postedBy, String rejectionReason) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.description = description;
        this.location = location;
        this.jobType = jobType;
        this.minCgpa = minCgpa;
        this.eligibleSemester = eligibleSemester;
        this.maxBacklogs = maxBacklogs;
        this.expiryDate = expiryDate;
        this.status = status;
        this.postedBy = postedBy;
        this.rejectionReason = rejectionReason;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getJobType() {
        return jobType;
    }

    public void setJobType(String jobType) {
        this.jobType = jobType;
    }

    public Double getMinCgpa() {
        return minCgpa;
    }

    public void setMinCgpa(Double minCgpa) {
        this.minCgpa = minCgpa;
    }

    public Integer getEligibleSemester() {
        return eligibleSemester;
    }

    public void setEligibleSemester(Integer eligibleSemester) {
        this.eligibleSemester = eligibleSemester;
    }

    public Integer getMaxBacklogs() {
        return maxBacklogs;
    }

    public void setMaxBacklogs(Integer maxBacklogs) {
        this.maxBacklogs = maxBacklogs;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(String postedBy) {
        this.postedBy = postedBy;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

}
