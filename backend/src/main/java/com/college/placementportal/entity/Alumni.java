package com.college.placementportal.entity;

import com.college.placementportal.enums.VerificationStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alumni")
public class Alumni {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String company;
    private String designation;
    private Integer passingYear;

    @Enumerated(EnumType.STRING)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private String linkedinUrl;
    private String degree;

    @Column(unique = true)
    private String rollNumber;
    
    @Enumerated(EnumType.STRING)
    private com.college.placementportal.enums.Department department;
    private String mobileNumber;
    private String gender;
    
    private String profileImageUrl;

    private String verificationDocumentUrl;
    
    @Column(name = "verification_document_name")
    private String verificationDocumentName;
    
    @Column(name = "verification_document_upload_date")
    private LocalDateTime verificationDocumentUploadDate;


    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;
    private LocalDateTime rejectedDate;



    // OCR Verification fields
    @Column(name = "ocr_verified")
    private Boolean ocrVerified = false;

    @Column(name = "ocr_extracted_name")
    private String ocrExtractedName;

    @Column(name = "ocr_extracted_roll_number")
    private String ocrExtractedRollNumber;

    @Column(name = "ocr_detected_college")
    private String ocrDetectedCollege;

    public Alumni() {}

    public Alumni(Long id, User user, String company, String designation, Integer passingYear) {
        this.id = id;
        this.user = user;
        this.company = company;
        this.designation = designation;
        this.passingYear = passingYear;
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

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public Integer getPassingYear() {
        return passingYear;
    }

    public void setPassingYear(Integer passingYear) {
        this.passingYear = passingYear;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public com.college.placementportal.enums.Department getDepartment() { return department; }
    public void setDepartment(com.college.placementportal.enums.Department department) { this.department = department; }

    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getVerificationDocumentUrl() { return verificationDocumentUrl; }
    public void setVerificationDocumentUrl(String verificationDocumentUrl) { this.verificationDocumentUrl = verificationDocumentUrl; }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getRejectedDate() {
        return rejectedDate;
    }

    public void setRejectedDate(LocalDateTime rejectedDate) {
        this.rejectedDate = rejectedDate;
    }



    public Boolean getOcrVerified() {
        return ocrVerified;
    }

    public void setOcrVerified(Boolean ocrVerified) {
        this.ocrVerified = ocrVerified;
    }

    public String getOcrExtractedName() {
        return ocrExtractedName;
    }

    public void setOcrExtractedName(String ocrExtractedName) {
        this.ocrExtractedName = ocrExtractedName;
    }

    public String getOcrExtractedRollNumber() {
        return ocrExtractedRollNumber;
    }

    public void setOcrExtractedRollNumber(String ocrExtractedRollNumber) {
        this.ocrExtractedRollNumber = ocrExtractedRollNumber;
    }

    public String getOcrDetectedCollege() {
        return ocrDetectedCollege;
    }

    public void setOcrDetectedCollege(String ocrDetectedCollege) {
        this.ocrDetectedCollege = ocrDetectedCollege;
    }

    public Boolean getIsActive() {
        return isActive != null ? isActive : true;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getVerificationDocumentName() {
        return verificationDocumentName;
    }

    public void setVerificationDocumentName(String verificationDocumentName) {
        this.verificationDocumentName = verificationDocumentName;
    }

    public LocalDateTime getVerificationDocumentUploadDate() {
        return verificationDocumentUploadDate;
    }

    public void setVerificationDocumentUploadDate(LocalDateTime verificationDocumentUploadDate) {
        this.verificationDocumentUploadDate = verificationDocumentUploadDate;
    }
}
