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
    private String packageDetails;
    private String experienceRequired;
    private String requiredSkills;
    private String applicationLink;

    private String companyLogoUrl;
    private String jobBannerUrl;
    private String industry;
    private String companySize;
    private Integer openings;

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

    public Job(Long id, String title, String company, String description, String location, String jobType, String packageDetails, String experienceRequired, String requiredSkills, String applicationLink, String companyLogoUrl, String jobBannerUrl, String industry, String companySize, Integer openings, Double minCgpa, Integer eligibleSemester, Integer maxBacklogs, LocalDate expiryDate, String rejectionReason, User postedBy, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.company = company;
        this.description = description;
        this.location = location;
        this.jobType = jobType;
        this.packageDetails = packageDetails;
        this.experienceRequired = experienceRequired;
        this.requiredSkills = requiredSkills;
        this.applicationLink = applicationLink;
        this.companyLogoUrl = companyLogoUrl;
        this.jobBannerUrl = jobBannerUrl;
        this.industry = industry;
        this.companySize = companySize;
        this.openings = openings;
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

    public String getPackageDetails() {
        return packageDetails;
    }

    public void setPackageDetails(String packageDetails) {
        this.packageDetails = packageDetails;
    }

    public String getExperienceRequired() {
        return experienceRequired;
    }

    public void setExperienceRequired(String experienceRequired) {
        this.experienceRequired = experienceRequired;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getApplicationLink() {
        return applicationLink;
    }

    public void setApplicationLink(String applicationLink) {
        this.applicationLink = applicationLink;
    }

    public String getCompanyLogoUrl() {
        return companyLogoUrl;
    }

    public void setCompanyLogoUrl(String companyLogoUrl) {
        this.companyLogoUrl = companyLogoUrl;
    }

    public String getJobBannerUrl() {
        return jobBannerUrl;
    }

    public void setJobBannerUrl(String jobBannerUrl) {
        this.jobBannerUrl = jobBannerUrl;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public Integer getOpenings() {
        return openings;
    }

    public void setOpenings(Integer openings) {
        this.openings = openings;
    }

}
