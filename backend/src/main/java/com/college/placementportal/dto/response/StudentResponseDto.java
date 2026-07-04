package com.college.placementportal.dto.response;

public class StudentResponseDto {
    private Long id;
    private UserSummaryDto user;
    private String rollNumber;
    private String department;
    private String mobileNumber;
    private String location;
    private String githubUrl;
    private String linkedinUrl;
    private String profileImageUrl;
    private Double cgpa;
    private Integer semester;
    private Integer backlogs;
    private String academicYear;
    private String verificationStatus;
    private java.util.List<String> skills;
    private java.util.List<ProjectDto> projects;
    private boolean hasResume;
    private boolean placementReady;
    private ApplicationStats applicationStats;
    private java.time.LocalDateTime createdAt;

    public static class ApplicationStats {
        private long applied;
        private long shortlisted;
        private long selected;
        private long rejected;

        public ApplicationStats() {}

        public ApplicationStats(long applied, long shortlisted, long selected, long rejected) {
            this.applied = applied;
            this.shortlisted = shortlisted;
            this.selected = selected;
            this.rejected = rejected;
        }

        public long getApplied() { return applied; }
        public void setApplied(long applied) { this.applied = applied; }
        public long getShortlisted() { return shortlisted; }
        public void setShortlisted(long shortlisted) { this.shortlisted = shortlisted; }
        public long getSelected() { return selected; }
        public void setSelected(long selected) { this.selected = selected; }
        public long getRejected() { return rejected; }
        public void setRejected(long rejected) { this.rejected = rejected; }
    }

    public StudentResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }
    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }
    public Integer getBacklogs() { return backlogs; }
    public void setBacklogs(Integer backlogs) { this.backlogs = backlogs; }
    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public java.util.List<String> getSkills() { return skills; }
    public void setSkills(java.util.List<String> skills) { this.skills = skills; }
    public java.util.List<ProjectDto> getProjects() { return projects; }
    public void setProjects(java.util.List<ProjectDto> projects) { this.projects = projects; }
    public boolean isHasResume() { return hasResume; }
    public void setHasResume(boolean hasResume) { this.hasResume = hasResume; }
    public boolean isPlacementReady() { return placementReady; }
    public void setPlacementReady(boolean placementReady) { this.placementReady = placementReady; }
    public ApplicationStats getApplicationStats() { return applicationStats; }
    public void setApplicationStats(ApplicationStats applicationStats) { this.applicationStats = applicationStats; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }
}
