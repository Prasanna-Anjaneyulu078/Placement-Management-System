package com.college.placementportal.service;

import com.college.placementportal.dto.response.AppliedJobDto;
import com.college.placementportal.dto.response.StudentJobDto;
import com.college.placementportal.entity.Application;
import com.college.placementportal.entity.Job;
import com.college.placementportal.entity.Student;
import com.college.placementportal.entity.User;
import com.college.placementportal.enums.ApplicationStatus;
import com.college.placementportal.enums.JobStatus;
import com.college.placementportal.repository.ApplicationRepository;
import com.college.placementportal.repository.JobRepository;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
public class StudentJobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository;

    public List<StudentJobDto> getOpenJobs(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Student not found"));
        
        List<Job> allApprovedJobs = jobRepository.findByStatus(JobStatus.APPROVED);
        List<Application> studentApplications = applicationRepository.findByStudentId(student.getId());
        List<Long> appliedJobIds = studentApplications.stream().map(a -> a.getJob().getId()).collect(Collectors.toList());

        LocalDate today = LocalDate.now();

        return allApprovedJobs.stream()
                .filter(job -> job.getExpiryDate() == null || !job.getExpiryDate().isBefore(today))
                .filter(job -> !appliedJobIds.contains(job.getId()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AppliedJobDto> getAppliedJobs(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Student not found"));

        List<Application> applications = applicationRepository.findByStudentId(student.getId());

        return applications.stream().map(app -> {
            Job job = app.getJob();
            return new AppliedJobDto(
                    app.getId(),
                    job.getId(),
                    job.getTitle(),
                    job.getCompany(),
                    app.getStatus(),
                    app.getAppliedAt()
            );
        }).collect(Collectors.toList());
    }

    public List<StudentJobDto> getClosedJobs() {
        List<Job> allJobs = jobRepository.findAll();
        LocalDate today = LocalDate.now();

        return allJobs.stream()
                .filter(job -> job.getStatus() == JobStatus.CLOSED || 
                               job.getStatus() == JobStatus.EXPIRED || 
                               (job.getExpiryDate() != null && job.getExpiryDate().isBefore(today)))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private StudentJobDto mapToDto(Job job) {
        return new StudentJobDto(
            job.getId(), job.getTitle(), job.getCompany(), job.getDescription(), 
            job.getLocation(), job.getJobType(), job.getMinCgpa(), 
            job.getEligibleSemester(), job.getMaxBacklogs(), job.getExpiryDate()
        );
    }

    public Application applyToJob(@org.springframework.lang.NonNull Long jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow(() -> new RuntimeException("Student profile incomplete"));
        
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if job is active and not expired
        if (job.getStatus() != JobStatus.APPROVED) {
            throw new RuntimeException("This job is not currently open for applications.");
        }
        if (job.getExpiryDate() != null && job.getExpiryDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("This job has expired.");
        }

        // Check if already applied
        Optional<Application> existingApp = applicationRepository.findByJobIdAndStudentId(jobId, student.getId());
        if (existingApp.isPresent()) {
            throw new RuntimeException("You have already applied for this job.");
        }

        // Eligibility check
        if (job.getMinCgpa() != null && (student.getCgpa() == null || student.getCgpa() < job.getMinCgpa())) {
            throw new RuntimeException("You do not meet the minimum CGPA requirement.");
        }
        if (job.getEligibleSemester() != null && (student.getSemester() == null || student.getSemester() < job.getEligibleSemester())) {
            throw new RuntimeException("You do not meet the minimum semester requirement.");
        }
        if (job.getMaxBacklogs() != null && (student.getBacklogs() == null || student.getBacklogs() > job.getMaxBacklogs())) {
            throw new RuntimeException("You exceed the maximum allowed backlogs.");
        }

        Application application = new Application();
        application.setJob(job);
        application.setStudent(student);
        application.setStatus(ApplicationStatus.APPLIED);
        // appliedAt is set in @PrePersist in Application entity

        return applicationRepository.save(application);
    }
}
