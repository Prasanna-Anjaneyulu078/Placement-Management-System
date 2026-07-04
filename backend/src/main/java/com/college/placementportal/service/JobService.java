package com.college.placementportal.service;

import com.college.placementportal.entity.Job;
import com.college.placementportal.entity.User;
import com.college.placementportal.enums.JobStatus;
import com.college.placementportal.repository.JobRepository;
import com.college.placementportal.repository.UserRepository;
import com.college.placementportal.exception.ResourceNotFoundException;
import com.college.placementportal.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.lang.NonNull;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private UserRepository userRepository;

    public Job createJob(Job job, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        job.setPostedBy(user);
        if (user.getRole().name().equals("ADMIN")) {
            job.setStatus(JobStatus.APPROVED);
        } else {
            job.setStatus(JobStatus.PENDING);
        }
        return jobRepository.save(job);
    }

    public List<Job> getApprovedJobs() {
        return jobRepository.findByStatus(JobStatus.APPROVED);
    }
    
    public List<Job> getJobsByPostedBy(@NonNull Long userId) {
        return jobRepository.findByPostedById(userId);
    }
    
    public List<Job> getJobsByPostedByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return jobRepository.findByPostedById(user.getId());
    }
    
    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
    
    public Job updateJobStatus(@NonNull Long jobId, JobStatus status, String rejectionReason) {
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        job.setStatus(status);
        if (status == JobStatus.REJECTED) {
            job.setRejectionReason(rejectionReason);
        }
        return jobRepository.save(job);
    }
    
    public Job updateJob(@NonNull Long jobId, Job updatedJob, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        
        // Ensure user owns the job or is admin
        if (!job.getPostedBy().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Not authorized to update this job");
        }
        
        job.setTitle(updatedJob.getTitle());
        job.setCompany(updatedJob.getCompany());
        job.setDescription(updatedJob.getDescription());
        job.setLocation(updatedJob.getLocation());
        job.setJobType(updatedJob.getJobType());
        job.setMinCgpa(updatedJob.getMinCgpa());
        job.setEligibleSemester(updatedJob.getEligibleSemester());
        job.setMaxBacklogs(updatedJob.getMaxBacklogs());
        job.setExpiryDate(updatedJob.getExpiryDate());
        
        if (!user.getRole().name().equals("ADMIN")) {
            job.setStatus(JobStatus.PENDING);
        }
        
        return jobRepository.save(job);
    }
    
    public void deleteJob(@NonNull Long jobId, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        Job job = jobRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job", jobId));
        
        if (!job.getPostedBy().getId().equals(user.getId()) && !user.getRole().name().equals("ADMIN")) {
            throw new UnauthorizedException("Not authorized to delete this job");
        }
        
        jobRepository.delete(job);
    }
}
