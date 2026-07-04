package com.college.placementportal.entity;

import com.college.placementportal.enums.JobStatus;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String company;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String location;
    private String jobType;

    // Eligibility Criteria
    private Double minCgpa;
    private Integer eligibleSemester;
    private Integer maxBacklogs;

    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private JobStatus status = JobStatus.PENDING;

    private String rejectionReason;

    @ManyToOne
    @JoinColumn(name = "posted_by_id", referencedColumnName = "id")
    private User postedBy; // Can be Alumni or Admin

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    public Job() {}

    public Job(Long id, String title, String company, String description, String location, String jobType, Double minCgpa, Integer eligibleSemester, Integer maxBacklogs, LocalDate expiryDate, String rejectionReason, User postedBy, LocalDateTime createdAt) {
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
        this.rejectionReason = rejectionReason;
        this.postedBy = postedBy;
        this.createdAt = createdAt;
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

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public User getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(User postedBy) {
        this.postedBy = postedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

}
