package com.college.placementportal.dto.response;

public class AlumniResponseDto {
    private Long id;
    private UserSummaryDto user;
    private String company;
    private String designation;
    private Integer passingYear;
    private String verificationStatus;
    private String rollNumber;
    private String department;
    private String degree;
    private String mobileNumber;
    private String gender;
    private String linkedinUrl;
    private String verificationDocumentUrl;
    private String profileImageUrl;
    // OCR verification metadata
    private Boolean ocrVerified;
    private String ocrExtractedName;
    private String ocrExtractedRollNumber;
    private String ocrDetectedCollege;

    public AlumniResponseDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public UserSummaryDto getUser() { return user; }
    public void setUser(UserSummaryDto user) { this.user = user; }
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    public Integer getPassingYear() { return passingYear; }
    public void setPassingYear(Integer passingYear) { this.passingYear = passingYear; }
    public String getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
    public String getVerificationDocumentUrl() { return verificationDocumentUrl; }
    public void setVerificationDocumentUrl(String verificationDocumentUrl) { this.verificationDocumentUrl = verificationDocumentUrl; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    public Boolean getOcrVerified() { return ocrVerified; }
    public void setOcrVerified(Boolean ocrVerified) { this.ocrVerified = ocrVerified; }
    public String getOcrExtractedName() { return ocrExtractedName; }
    public void setOcrExtractedName(String ocrExtractedName) { this.ocrExtractedName = ocrExtractedName; }
    public String getOcrExtractedRollNumber() { return ocrExtractedRollNumber; }
    public void setOcrExtractedRollNumber(String ocrExtractedRollNumber) { this.ocrExtractedRollNumber = ocrExtractedRollNumber; }
    public String getOcrDetectedCollege() { return ocrDetectedCollege; }
    public void setOcrDetectedCollege(String ocrDetectedCollege) { this.ocrDetectedCollege = ocrDetectedCollege; }
}
