package com.college.placementportal.controller;

import com.college.placementportal.enums.Department;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> departments = Arrays.stream(Department.values())
                .map(dept -> new DepartmentDto(dept.getCode(), dept.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(departments);
    }

    public static class DepartmentDto {
        private String code;
        private String name;

        public DepartmentDto() {}

        public DepartmentDto(String code, String name) {
            this.code = code;
            this.name = name;
        }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
