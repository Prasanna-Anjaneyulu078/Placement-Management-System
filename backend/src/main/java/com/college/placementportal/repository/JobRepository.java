package com.college.placementportal.repository;

import com.college.placementportal.entity.Job;
import com.college.placementportal.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByStatus(JobStatus status);
    List<Job> findByPostedById(Long userId);
    long countByStatus(JobStatus status);
}
