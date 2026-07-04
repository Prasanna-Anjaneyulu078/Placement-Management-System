package com.college.placementportal.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;

@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum Department {
    CSE("Computer Science and Engineering"),
    IT("Information Technology"),
    AIML("Artificial Intelligence and Machine Learning"),
    CSM("Computer Science and Engineering (Artificial Intelligence & Machine Learning)"),
    AIDS("Artificial Intelligence and Data Science"),
    CSO("Computer Science and Engineering (Internet of Things)"),
    CIC("Computer Science and Information Technology"),
    ECE("Electronics and Communication Engineering"),
    EEE("Electrical and Electronics Engineering"),
    CIVIL("Civil Engineering"),
    MECH("Mechanical Engineering");

    private final String name;

    Department(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return name();
    }

    @JsonCreator
    public static Department fromString(String key) {
        if (key == null) return null;
        for (Department dept : Department.values()) {
            if (dept.name().equalsIgnoreCase(key) || dept.name.equalsIgnoreCase(key)) {
                return dept;
            }
        }
        throw new IllegalArgumentException("Invalid Department Selected");
    }
}
