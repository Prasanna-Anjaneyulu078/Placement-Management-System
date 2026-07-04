package com.college.placementportal;

import com.college.placementportal.service.AdminUserManagementService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Map;

@SpringBootTest
public class MigratePasswords {

    @Autowired
    private AdminUserManagementService adminUserManagementService;

    @Test
    public void executeMigration() {
        System.out.println("Starting password migration...");
        Map<String, Object> result = adminUserManagementService.migratePasswords();
        System.out.println("Migration complete. Result: " + result);
    }
}
