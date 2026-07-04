package com.college.placementportal.service;

import com.college.placementportal.entity.Application;
import com.college.placementportal.entity.Job;
import com.college.placementportal.entity.Student;
import com.college.placementportal.entity.User;
import com.college.placementportal.enums.ApplicationStatus;
import com.college.placementportal.repository.ApplicationRepository;
import com.college.placementportal.repository.JobRepository;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.UserRepository;
import com.college.placementportal.exception.ResourceNotFoundException;
import com.college.placementportal.exception.DuplicateEntryException;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.lang.NonNull;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StudentRepository studentRepository;

    public Application applyToJob(@NonNull Long jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + user.getId()));
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        
        if (job.getStatus() != com.college.placementportal.enums.JobStatus.APPROVED) {
            throw new IllegalArgumentException("Job is not available for applying");
        }
        
        // Eligibility Checks
        if (job.getMinCgpa() != null && (student.getCgpa() == null || student.getCgpa() < job.getMinCgpa())) {
            throw new IllegalArgumentException("You do not meet the minimum CGPA requirement for this job.");
        }
        if (job.getEligibleSemester() != null && (student.getSemester() == null || student.getSemester() < job.getEligibleSemester())) {
            throw new IllegalArgumentException("You do not meet the minimum semester requirement for this job.");
        }
        if (job.getMaxBacklogs() != null && (student.getBacklogs() == null || student.getBacklogs() > job.getMaxBacklogs())) {
            throw new IllegalArgumentException("You exceed the maximum allowed backlogs for this job.");
        }
        
        if (applicationRepository.findByJobIdAndStudentId(jobId, student.getId()).isPresent()) {
            throw new DuplicateEntryException("You have already applied for this job");
        }
        
        Application application = new Application();
        application.setStudent(student);
        application.setJob(job);
        application.setStatus(ApplicationStatus.APPLIED);
        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsByStudentEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        Student student = studentRepository.findByUserId(user.getId()).orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user ID: " + user.getId()));
        return applicationRepository.findByStudentId(student.getId());
    }

    public List<Application> getApplicationsByJobId(@NonNull Long jobId) {
        return applicationRepository.findByJobId(jobId);
    }
    
    public Application updateApplicationStatus(@NonNull Long applicationId, ApplicationStatus status) {
        Application app = applicationRepository.findById(applicationId).orElseThrow(() -> new ResourceNotFoundException("Application", applicationId));
        app.setStatus(status);
        return applicationRepository.save(app);
    }
}
