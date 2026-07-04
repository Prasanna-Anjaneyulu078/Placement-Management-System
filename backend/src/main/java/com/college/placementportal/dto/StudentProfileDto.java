package com.college.placementportal.dto;

import com.college.placementportal.enums.VerificationStatus;

import java.util.List;

public class StudentProfileDto {
    private Long id;
    private String name;
    private String email;
    private String rollNumber;
    private Double cgpa;
    private Integer semester;
    private Integer backlogs;
    private String academicYear;
    private VerificationStatus verificationStatus;
    
    private List<String> skills;
    // For simplicity, we can just return IDs or basic info of projects
    public StudentProfileDto() {}

    public StudentProfileDto(Long id, String name, String email, String rollNumber, Double cgpa, Integer semester, Integer backlogs, String academicYear, VerificationStatus verificationStatus, List<String> skills) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.rollNumber = rollNumber;
        this.cgpa = cgpa;
        this.semester = semester;
        this.backlogs = backlogs;
        this.academicYear = academicYear;
        this.verificationStatus = verificationStatus;
        this.skills = skills;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
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

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

}
