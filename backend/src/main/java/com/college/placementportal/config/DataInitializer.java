package com.college.placementportal.config;

import com.college.placementportal.entity.Alumni;
import com.college.placementportal.entity.Student;
import com.college.placementportal.entity.User;
import com.college.placementportal.enums.Role;
import com.college.placementportal.enums.VerificationStatus;
import com.college.placementportal.repository.AlumniRepository;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AlumniRepository alumniRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        boolean initialized = false;

        if (!userRepository.existsByEmail("admin@vvit.ac.in")) {
            User admin = new User();
            admin.setName("System Admin");
            admin.setEmail("admin@vvit.ac.in");
            admin.setPassword(encoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            initialized = true;
        }

        if (!userRepository.existsByEmail("student@vvit.ac.in")) {
            User studentUser = new User();
            studentUser.setName("John Doe");
            studentUser.setEmail("student@vvit.ac.in");
            studentUser.setPassword(encoder.encode("Student@123"));
            studentUser.setRole(Role.STUDENT);

            Student student = new Student();
            student.setUser(studentUser);
            student.setRollNumber("20BQ1A0501");
            student.setCgpa(8.5);
            student.setSemester(6);
            student.setBacklogs(0);
            student.setAcademicYear("2020-2024");
            student.setVerificationStatus(VerificationStatus.VERIFIED);
            
            studentRepository.save(student);
            initialized = true;
        }

        if (!userRepository.existsByEmail("alumni@vvit.ac.in")) {
            User alumniUser = new User();
            alumniUser.setName("Jane Smith");
            alumniUser.setEmail("alumni@vvit.ac.in");
            alumniUser.setPassword(encoder.encode("Alumni@123"));
            alumniUser.setRole(Role.ALUMNI);

            Alumni alumni = new Alumni();
            alumni.setUser(alumniUser);
            alumni.setCompany("Tech Corp");
            alumni.setDesignation("Software Engineer");
            alumni.setProfileImageUrl("https://ui-avatars.com/api/?name=Alumni+User&background=random");
            alumni.setPassingYear(2019);
            alumni.setVerificationStatus(VerificationStatus.VERIFIED);
            
            alumniRepository.save(alumni);
            initialized = true;
        }

        if (initialized) {
            System.out.println("╔══════════════════════════════════════════════════════╗");
            System.out.println("║        VVIT Placement Portal — Default Credentials   ║");
            System.out.println("╠══════════════════════════════════════════════════════╣");
            System.out.println("║  👤 ADMIN    admin@vvit.ac.in       / Admin@123      ║");
            System.out.println("║  🎓 STUDENT  student@vvit.ac.in     / Student@123    ║");
            System.out.println("║  🏢 ALUMNI   alumni@vvit.ac.in      / Alumni@123     ║");
            System.out.println("╚══════════════════════════════════════════════════════╝");
        }
    }
}
