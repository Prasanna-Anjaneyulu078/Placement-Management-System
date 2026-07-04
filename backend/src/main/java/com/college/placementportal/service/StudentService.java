package com.college.placementportal.service;

import com.college.placementportal.entity.Student;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.ApplicationRepository;
import com.college.placementportal.entity.Application;
import com.college.placementportal.exception.ResourceNotFoundException;
import com.college.placementportal.dto.response.StudentResponseDto;
import com.college.placementportal.dto.response.UserSummaryDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.stream.Collectors;
import com.college.placementportal.repository.SkillRepository;
import com.college.placementportal.repository.ProjectRepository;
import com.college.placementportal.entity.Skill;
import com.college.placementportal.entity.Project;
import com.college.placementportal.dto.response.ProjectDto;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public Student getStudentEntity(Long userId) {
        return studentRepository.findByUserId(userId).orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + userId));
    }

    public StudentResponseDto getStudentProfile(Long userId) {
        return mapToDto(getStudentEntity(userId));
    }
    
    public Map<String, Object> getStats(Long userId) {
        Student student = getStudentEntity(userId);
        List<Application> apps = applicationRepository.findByStudentId(student.getId());
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalApplications", apps.size());
        stats.put("shortlisted", apps.stream().filter(a -> a.getStatus() != null && a.getStatus().name().equals("SHORTLISTED")).count());
        stats.put("pending", apps.stream().filter(a -> a.getStatus() != null && a.getStatus().name().equals("APPLIED")).count());
        return stats;
    }
    
    public StudentResponseDto updateStudentProfile(Long userId, Student updatedStudent) {
        Student student = getStudentEntity(userId);
        
        boolean academicsChanged = false;
        if ((updatedStudent.getCgpa() != null && !updatedStudent.getCgpa().equals(student.getCgpa())) ||
            (updatedStudent.getSemester() != null && !updatedStudent.getSemester().equals(student.getSemester())) ||
            (updatedStudent.getBacklogs() != null && !updatedStudent.getBacklogs().equals(student.getBacklogs())) ||
            (updatedStudent.getAcademicYear() != null && !updatedStudent.getAcademicYear().equals(student.getAcademicYear()))) {
            academicsChanged = true;
        }

        if (updatedStudent.getDepartment() != null) student.setDepartment(updatedStudent.getDepartment());
        if (updatedStudent.getMobileNumber() != null) student.setMobileNumber(updatedStudent.getMobileNumber());
        if (updatedStudent.getLocation() != null) student.setLocation(updatedStudent.getLocation());
        if (updatedStudent.getGithubUrl() != null) student.setGithubUrl(updatedStudent.getGithubUrl());
        if (updatedStudent.getLinkedinUrl() != null) student.setLinkedinUrl(updatedStudent.getLinkedinUrl());
        if (updatedStudent.getCgpa() != null) student.setCgpa(updatedStudent.getCgpa());
        if (updatedStudent.getSemester() != null) student.setSemester(updatedStudent.getSemester());
        if (updatedStudent.getBacklogs() != null) student.setBacklogs(updatedStudent.getBacklogs());
        if (updatedStudent.getAcademicYear() != null) student.setAcademicYear(updatedStudent.getAcademicYear());
        if (updatedStudent.getRollNumber() != null) student.setRollNumber(updatedStudent.getRollNumber());
        
        if (academicsChanged) {
            student.setVerificationStatus(com.college.placementportal.enums.VerificationStatus.PENDING);
        }
        
        studentRepository.save(java.util.Objects.requireNonNull(student));
        return mapToDto(student);
    }
    
    public Skill addSkill(Long userId, String skillName) {
        Student student = getStudentEntity(userId);
        Skill skill = new Skill();
        skill.setStudent(student);
        skill.setName(skillName);
        return skillRepository.save(skill);
    }
    
    public void removeSkill(Long userId, String skillName) {
        Student student = getStudentEntity(userId);
        List<Skill> skills = skillRepository.findByStudentId(student.getId());
        for (Skill skill : skills) {
            if (skill.getName().equalsIgnoreCase(skillName)) {
                skillRepository.delete(skill);
                break;
            }
        }
    }
    
    public ProjectDto addProject(Long userId, ProjectDto dto) {
        Student student = getStudentEntity(userId);
        Project project;
        Long projectId = dto.getId();
        if (projectId != null) {
            project = projectRepository.findById(projectId).orElse(new Project());
            if (project.getStudent() != null && !project.getStudent().getId().equals(student.getId())) {
                throw new RuntimeException("Unauthorized");
            }
        } else {
            project = new Project();
        }
        project.setStudent(student);
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setTechStack(dto.getTech() != null ? String.join(",", dto.getTech()) : "");
        project.setDemoUrl(dto.getDemoUrl());
        project.setSourceUrl(dto.getSourceUrl());
        project = projectRepository.save(project);
        dto.setId(project.getId());
        return dto;
    }
    
    public void removeProject(Long userId, Long projectId) {
        if (projectId == null) {
            return;
        }
        Student student = getStudentEntity(userId);
        Project project = projectRepository.findById(java.util.Objects.requireNonNull(projectId)).orElse(null);
        if (project != null && project.getStudent().getId().equals(student.getId())) {
            projectRepository.delete(project);
        }
    }

    public StudentResponseDto mapToDto(Student student) {
        StudentResponseDto dto = new StudentResponseDto();
        dto.setId(student.getId());
        dto.setRollNumber(student.getRollNumber());
        dto.setDepartment(student.getDepartment() != null ? student.getDepartment().getCode() : null);
        dto.setMobileNumber(student.getMobileNumber());
        dto.setLocation(student.getLocation());
        dto.setGithubUrl(student.getGithubUrl());
        dto.setLinkedinUrl(student.getLinkedinUrl());
        dto.setProfileImageUrl(student.getProfileImageUrl());
        dto.setCgpa(student.getCgpa());
        dto.setSemester(student.getSemester());
        dto.setBacklogs(student.getBacklogs());
        dto.setAcademicYear(student.getAcademicYear());
        dto.setVerificationStatus(student.getVerificationStatus() != null ? student.getVerificationStatus().name() : null);

        if (student.getUser() != null) {
            UserSummaryDto userDto = new UserSummaryDto(
                    student.getUser().getId(),
                    student.getUser().getName(),
                    student.getUser().getEmail(),
                    student.getUser().getRole() != null ? student.getUser().getRole().name() : null
            );
            dto.setUser(userDto);
        }
        
        List<Skill> skills = skillRepository.findByStudentId(student.getId());
        dto.setSkills(skills.stream().map(s -> s.getName()).collect(Collectors.toList()));
        
        List<Project> projects = projectRepository.findByStudentId(student.getId());
        dto.setProjects(projects.stream().map(p -> new ProjectDto(
            p.getId(),
            p.getTitle(),
            p.getDescription(),
            p.getTechStack() != null && !p.getTechStack().isEmpty() ? Arrays.asList(p.getTechStack().split(",")) : java.util.Collections.emptyList(),
            p.getDemoUrl(),
            p.getSourceUrl()
        )).collect(Collectors.toList()));
        
        return dto;
    }
}
