package com.college.placementportal.dto.response;

import java.util.List;

public class ProjectDto {
    private Long id;
    private String title;
    private String description;
    private List<String> tech;
    private String demoUrl;
    private String sourceUrl;

    public ProjectDto() {}

    public ProjectDto(Long id, String title, String description, List<String> tech, String demoUrl, String sourceUrl) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.tech = tech;
        this.demoUrl = demoUrl;
        this.sourceUrl = sourceUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTech() {
        return tech;
    }

    public void setTech(List<String> tech) {
        this.tech = tech;
    }

    public String getDemoUrl() {
        return demoUrl;
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = demoUrl;
    }

    public String getSourceUrl() {
        return sourceUrl;
    }

    public void setSourceUrl(String sourceUrl) {
        this.sourceUrl = sourceUrl;
    }
}
