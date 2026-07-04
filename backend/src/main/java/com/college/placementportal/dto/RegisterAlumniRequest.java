package com.college.placementportal.dto;

import jakarta.validation.constraints.*;

public class RegisterAlumniRequest {
    @NotBlank(message = "Name must not be blank")
    private String name;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Company must not be blank")
    private String company;

    @NotBlank(message = "Designation must not be blank")
    private String designation;

    @NotNull(message = "Passing year must be provided")
    @Min(value = 1990, message = "Passing year must be valid")
    @Max(value = 2030, message = "Passing year must be valid")
    private Integer passingYear;

    @NotBlank(message = "Roll number must not be blank")
    private String rollNumber;

    @NotBlank(message = "Department must not be blank")
    private String department;

    private String degree;

    @NotBlank(message = "Mobile number must not be blank")
    private String mobileNumber;

    private String gender;

    private String linkedinUrl;
    public RegisterAlumniRequest() {}

    public RegisterAlumniRequest(String name, String email, String password, String company, String designation, Integer passingYear, String rollNumber, String department, String degree, String mobileNumber, String gender, String linkedinUrl) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.company = company;
        this.designation = designation;
        this.passingYear = passingYear;
        this.rollNumber = rollNumber;
        this.department = department;
        this.degree = degree;
        this.mobileNumber = mobileNumber;
        this.gender = gender;
        this.linkedinUrl = linkedinUrl;
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

}
