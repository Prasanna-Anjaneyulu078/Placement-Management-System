package com.college.placementportal.config;

import com.college.placementportal.entity.User;
import com.college.placementportal.enums.Role;
import com.college.placementportal.repository.UserRepository;
import com.college.placementportal.entity.StudentMaster;
import com.college.placementportal.repository.StudentMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private StudentMasterRepository studentMasterRepository;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@vvit.edu.in")) {
            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@vvit.edu.in");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Seeded admin user: admin@vvit.edu.in / admin123");
        }

        if (studentMasterRepository.count() == 0) {
            StudentMaster sm1 = new StudentMaster(null, "21BQ1A0501", "Prasanna Anjaneyulu", "CSE", 2025, "prasanna@vvit.edu.in");
            StudentMaster sm2 = new StudentMaster(null, "21BQ1A0502", "Rahul Kumar", "ECE", 2025, "rahul@vvit.edu.in");
            studentMasterRepository.save(sm1);
            studentMasterRepository.save(sm2);
            System.out.println("Seeded dummy data in student_master table.");
        }
    }
}
