package com.college.placementportal.repository;

import com.college.placementportal.entity.StudentMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentMasterRepository extends JpaRepository<StudentMaster, Long> {
    Optional<StudentMaster> findByRollNumber(String rollNumber);
}
