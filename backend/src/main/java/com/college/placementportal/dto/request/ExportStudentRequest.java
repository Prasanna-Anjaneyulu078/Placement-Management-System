package com.college.placementportal.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class ExportStudentRequest {

    @NotNull(message = "Format is required (EXCEL, CSV, PDF)")
    private String format;

    @NotNull(message = "Student IDs cannot be null")
    private List<Long> studentIds;

    @NotEmpty(message = "At least one field must be selected for export")
    private List<String> fields;

    public ExportStudentRequest() {
    }

    public ExportStudentRequest(String format, List<Long> studentIds, List<String> fields) {
        this.format = format;
        this.studentIds = studentIds;
        this.fields = fields;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public List<Long> getStudentIds() {
        return studentIds;
    }

    public void setStudentIds(List<Long> studentIds) {
        this.studentIds = studentIds;
    }

    public List<String> getFields() {
        return fields;
    }

    public void setFields(List<String> fields) {
        this.fields = fields;
    }
}
