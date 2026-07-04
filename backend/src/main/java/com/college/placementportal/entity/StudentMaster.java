package com.college.placementportal.entity;

import jakarta.persistence.*;


@Entity
@Table(name = "student_master")
public class StudentMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "roll_number", unique = true, nullable = false)
    private String rollNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "department")
    private String department;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Column(name = "email")
    private String email;

    public StudentMaster() {
    }

    public StudentMaster(Long id, String rollNumber, String fullName, String department, Integer graduationYear, String email) {
        this.id = id;
        this.rollNumber = rollNumber;
        this.fullName = fullName;
        this.department = department;
        this.graduationYear = graduationYear;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Integer getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(Integer graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
