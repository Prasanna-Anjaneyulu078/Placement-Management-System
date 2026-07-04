package com.college.placementportal.dto;

public class AdminProfileDto {
    private Long id;
    private String name;
    private String email;
    private String mobileNumber;
    private String location;
    private String gender;
    
    private String department;
    private String designation;
    private String employeeId;
    private String officeLocation;
    
    private String profileImageUrl;
    private String role;
    private String status;
    private String accountCreatedDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getMobileNumber() { return mobileNumber; }
    public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }
    
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getOfficeLocation() { return officeLocation; }
    public void setOfficeLocation(String officeLocation) { this.officeLocation = officeLocation; }
    
    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    
    public String getAccountCreatedDate() { return accountCreatedDate; }
    public void setAccountCreatedDate(String accountCreatedDate) { this.accountCreatedDate = accountCreatedDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
