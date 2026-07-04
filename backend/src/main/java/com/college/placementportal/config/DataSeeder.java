package com.college.placementportal.config;

import com.college.placementportal.entity.User;
import com.college.placementportal.enums.Role;
import com.college.placementportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private com.college.placementportal.repository.StudentRepository studentRepository;
    
    @Autowired
    private com.college.placementportal.repository.AlumniRepository alumniRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("admin@vvit.edu.in")) {
            User admin = new User();
            admin.setName("Placement Cell Admin");
            admin.setEmail("admin@vvit.edu.in");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Default Admin created: admin@vvit.edu.in / admin123");
        }

        if (!userRepository.existsByEmail("superadmin@vvit.edu.in")) {
            try {
                User superAdmin = new User();
                superAdmin.setName("Super Admin");
                superAdmin.setEmail("superadmin@vvit.edu.in");
                superAdmin.setPassword(passwordEncoder.encode("superadmin123"));
                superAdmin.setRole(Role.SUPER_ADMIN);
                userRepository.save(superAdmin);
                System.out.println("Default Super Admin created: superadmin@vvit.edu.in / superadmin123");
            } catch (Exception e) {
                System.out.println("Could not create Super Admin due to schema constraints: " + e.getMessage());
            }
        }
        
        if (!userRepository.existsByEmail("student@vvit.edu.in")) {
            User studentUser = new User();
            studentUser.setName("Demo Student");
            studentUser.setEmail("student@vvit.edu.in");
            studentUser.setPassword(passwordEncoder.encode("student123"));
            studentUser.setRole(Role.STUDENT);
            // user is saved via cascade from Student
            
            com.college.placementportal.entity.Student student = new com.college.placementportal.entity.Student();
            student.setUser(studentUser);
            student.setRollNumber("1234567890");
            student.setCgpa(8.5);
            student.setSemester(6);
            student.setBacklogs(0);
            student.setAcademicYear("2023-2024");
            student.setVerificationStatus(com.college.placementportal.enums.VerificationStatus.VERIFIED);
            studentRepository.save(student);

            System.out.println("Default Student created: student@vvit.edu.in / student123");
        }

        if (!userRepository.existsByEmail("alumni@vvit.edu.in")) {
            User alumniUser = new User();
            alumniUser.setName("Demo Alumni");
            alumniUser.setEmail("alumni@vvit.edu.in");
            alumniUser.setPassword(passwordEncoder.encode("alumni123"));
            alumniUser.setRole(Role.ALUMNI);
            // user is saved via cascade from Alumni
            
            com.college.placementportal.entity.Alumni alumni = new com.college.placementportal.entity.Alumni();
            alumni.setUser(alumniUser);
            alumni.setCompany("Demo Company");
            alumni.setDesignation("Software Engineer");
            alumni.setPassingYear(2022);
            alumni.setVerificationStatus(com.college.placementportal.enums.VerificationStatus.VERIFIED);
            alumniRepository.save(alumni);

            System.out.println("Default Alumni created: alumni@vvit.edu.in / alumni123");
        }
    }
}
