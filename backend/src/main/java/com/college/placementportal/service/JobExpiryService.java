package com.college.placementportal.service;

import com.college.placementportal.entity.Job;
import com.college.placementportal.enums.JobStatus;
import com.college.placementportal.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class JobExpiryService {

    @Autowired
    private JobRepository jobRepository;

    // Run every day at midnight
    @Scheduled(cron = "0 0 0 * * ?")
    public void expireJobs() {
        LocalDate today = LocalDate.now();
        List<Job> activeJobs = jobRepository.findByStatus(JobStatus.ACTIVE);
        
        for (Job job : activeJobs) {
            if (job.getExpiryDate() != null && job.getExpiryDate().isBefore(today)) {
                job.setStatus(JobStatus.EXPIRED);
                jobRepository.save(job);
            }
        }
    }
}
