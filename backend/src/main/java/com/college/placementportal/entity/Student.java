package com.college.placementportal.entity;

import com.college.placementportal.enums.VerificationStatus;
import jakarta.persistence.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(unique = true, nullable = false)
    private String rollNumber;
    
    @Enumerated(EnumType.STRING)
    private com.college.placementportal.enums.Department department;
    private String mobileNumber;
    private String location;
    private String githubUrl;
    private String linkedinUrl;
    private String profileImageUrl;

    private Double cgpa;
    private Integer semester;
    private Integer backlogs;
    private String academicYear;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
    
    private String verifiedBy;
    private java.time.LocalDateTime verifiedAt;
    
    private Boolean isActive = true;
    
    public Student() {}

    public Student(Long id, User user, String rollNumber, com.college.placementportal.enums.Department department, String mobileNumber, String location, String githubUrl, String linkedinUrl, Double cgpa, Integer semester, Integer backlogs, String academicYear) {
        this.id = id;
        this.user = user;
        this.rollNumber = rollNumber;
        this.department = department;
        this.mobileNumber = mobileNumber;
        this.location = location;
        this.githubUrl = githubUrl;
        this.linkedinUrl = linkedinUrl;
        this.cgpa = cgpa;
        this.semester = semester;
        this.backlogs = backlogs;
        this.academicYear = academicYear;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }
    
    public com.college.placementportal.enums.Department getDepartment() { return department; }
    public void setDepartment(com.college.placementportal.enums.Department department) { this.department = department; }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getProfileImageUrl() {
        return profileImageUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    public Double getCgpa() {
        return cgpa;
    }

    public void setCgpa(Double cgpa) {
        this.cgpa = cgpa;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getBacklogs() {
        return backlogs;
    }

    public void setBacklogs(Integer backlogs) {
        this.backlogs = backlogs;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(String verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public java.time.LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(java.time.LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public boolean isActive() {
        return isActive != null ? isActive : true;
    }

    public void setActive(boolean isActive) {
        this.isActive = isActive;
    }
}
