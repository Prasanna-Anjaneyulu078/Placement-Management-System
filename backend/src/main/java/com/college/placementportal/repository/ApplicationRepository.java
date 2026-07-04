package com.college.placementportal.repository;

import com.college.placementportal.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobId(Long jobId);
    List<Application> findByStudentId(Long studentId);
    Optional<Application> findByJobIdAndStudentId(Long jobId, Long studentId);
    List<Application> findByStatusIn(List<com.college.placementportal.enums.ApplicationStatus> statuses);
    long countByStatus(com.college.placementportal.enums.ApplicationStatus status);
}
