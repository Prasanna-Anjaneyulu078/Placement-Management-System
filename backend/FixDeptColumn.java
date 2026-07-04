import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDeptColumn {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/vvit_placement_db?allowPublicKeyRetrieval=true&useSSL=false", "user", "password");
        Statement stmt = conn.createStatement();
        try {
            stmt.execute("ALTER TABLE students MODIFY COLUMN department VARCHAR(255)");
        } catch(Exception e) {
            e.printStackTrace();
        }
        try {
            stmt.execute("ALTER TABLE admin_profiles MODIFY COLUMN department VARCHAR(255)");
        } catch(Exception e) {
            e.printStackTrace();
        }
        System.out.println("Done");
    }
}
