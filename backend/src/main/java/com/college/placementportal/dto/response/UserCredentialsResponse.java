package com.college.placementportal.dto.response;


public class UserCredentialsResponse {
    private String name;
    private String email;
    private String temporaryPassword;
    private String identifier; // rollNumber for students, designation for admins

    public UserCredentialsResponse() {}

    public UserCredentialsResponse(String name, String email, String temporaryPassword, String identifier) {
        this.name = name;
        this.email = email;
        this.temporaryPassword = temporaryPassword;
        this.identifier = identifier;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTemporaryPassword() { return temporaryPassword; }
    public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
}
