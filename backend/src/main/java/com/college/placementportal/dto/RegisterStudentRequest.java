package com.college.placementportal.dto;

import jakarta.validation.constraints.*;

public class RegisterStudentRequest {
    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Roll Number must not be blank")
    private String rollNumber;

    @NotNull(message = "CGPA must be provided")
    @DecimalMin(value = "0.0", message = "CGPA cannot be negative")
    @DecimalMax(value = "10.0", message = "CGPA cannot exceed 10.0")
    private Double cgpa;

    @NotNull(message = "Semester must be provided")
    @Min(value = 1, message = "Semester must be at least 1")
    @Max(value = 8, message = "Semester must be at most 8")
    private Integer semester;

    @NotNull(message = "Backlogs must be provided")
    @Min(value = 0, message = "Backlogs cannot be negative")
    private Integer backlogs;

    @NotBlank(message = "Academic year must not be blank")
    private String academicYear;
    public RegisterStudentRequest() {}

    public RegisterStudentRequest(String name, String email, String password, String rollNumber, Double cgpa, Integer semester, Integer backlogs, String academicYear) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.rollNumber = rollNumber;
        this.cgpa = cgpa;
        this.semester = semester;
        this.backlogs = backlogs;
        this.academicYear = academicYear;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

}
