package com.college.placementportal;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;


public class MigrateDepartments {
    public static void main(String[] args) {
        String url = "jdbc:mysql://localhost:3306/vvit_placement_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
        String user = "user";
        String password = "password";

        String[] tables = {"students", "alumni", "admin_profile"};

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to the database!");

            for (String table : tables) {
                // Update queries
                executeUpdate(conn, "UPDATE " + table + " SET department = 'CSE' WHERE department LIKE '%Computer Science Engineering%' OR department = 'Computer Science' OR department = 'CSE' OR department LIKE '%Computer Science and Engineering%' AND department NOT LIKE '%AI%' AND department NOT LIKE '%IoT%'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'IT' WHERE department LIKE '%Information Technology%' OR department = 'IT'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'AIML' WHERE department LIKE '%AI & ML%' OR department LIKE '%Artificial Intelligence and Machine Learning%' OR department = 'AIML'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'AIDS' WHERE department LIKE '%AI & DS%' OR department LIKE '%Data Science%' OR department = 'AIDS'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'CSM' WHERE department LIKE '%(AI & ML)%' OR (department LIKE '%Computer Science%' AND department LIKE '%Machine Learning%') OR department = 'CSM'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'CSO' WHERE department LIKE '%IoT%' OR department = 'CSO'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'CIC' WHERE department LIKE '%Computer Science and Information Technology%' OR department = 'CIC'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'ECE' WHERE department LIKE '%Electronics%' OR department = 'ECE'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'EEE' WHERE department LIKE '%Electrical%' OR department = 'EEE'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'CIVIL' WHERE department LIKE '%Civil%' OR department = 'CIVIL'");
                executeUpdate(conn, "UPDATE " + table + " SET department = 'MECH' WHERE department LIKE '%Mechanical%' OR department = 'MECH'");
                
                System.out.println("Completed migrations for table: " + table);
            }
            
            System.out.println("Database migration completed successfully.");

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static void executeUpdate(Connection conn, String sql) throws SQLException {
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            int rows = pstmt.executeUpdate();
            if (rows > 0) {
                System.out.println("Executed: " + sql + " | Rows affected: " + rows);
            }
        }
    }
}
