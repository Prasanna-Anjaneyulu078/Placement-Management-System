package com.college.placementportal.service;

import com.college.placementportal.dto.request.ExportStudentRequest;
import com.college.placementportal.entity.AuditLog;
import com.college.placementportal.entity.Student;
import com.college.placementportal.entity.User;
import com.college.placementportal.repository.AuditLogRepository;
import com.college.placementportal.repository.StudentRepository;
import com.college.placementportal.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminExportService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    public byte[] exportStudents(ExportStudentRequest request) throws Exception {
        List<Long> studentIds = request.getStudentIds();
        if (studentIds == null) {
            throw new IllegalArgumentException("Student IDs cannot be null");
        }
        List<Student> students = studentRepository.findAllById(studentIds);
        Map<Long, Student> studentMap = students.stream().collect(Collectors.toMap(student -> student.getId(), s -> s));
        List<Student> orderedStudents = studentIds.stream()
                .filter(studentMap::containsKey)
                .map(studentMap::get)
                .collect(Collectors.toList());

        byte[] fileData = null;
        String format = request.getFormat().toUpperCase();

        if ("EXCEL".equals(format)) {
            fileData = generateExcel(orderedStudents, request.getFields());
        } else if ("CSV".equals(format)) {
            fileData = generateCsv(orderedStudents, request.getFields());
        } else if ("PDF".equals(format)) {
            fileData = generatePdf(orderedStudents, request.getFields());
        } else {
            throw new IllegalArgumentException("Unsupported format: " + format);
        }

        // Log audit
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User adminUser = userRepository.findByEmail(email).orElse(null);
        if (adminUser != null) {
            AuditLog log = new AuditLog();
            log.setAction("EXPORT_STUDENTS");
            log.setPerformedBy(adminUser);
            log.setDetails("Exported " + orderedStudents.size() + " student records in " + format + " format.");
            log.setTimestamp(LocalDateTime.now());
            auditLogRepository.save(log);
        }

        return fileData;
    }

    private byte[] generateExcel(List<Student> students, List<String> fields) throws Exception {
        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Students");
            sheet.createFreezePane(0, 1); // Freeze header row

            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < fields.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(fields.get(i));
                cell.setCellStyle(headerStyle);
                // SXSSF doesn't auto-size well for very large datasets without tracking all columns,
                // but we can set a default column width or autoSize tracking.
                ((org.apache.poi.xssf.streaming.SXSSFSheet) sheet).trackColumnForAutoSizing(i);
            }

            int rowIdx = 1;
            for (Student student : students) {
                Row row = sheet.createRow(rowIdx++);
                for (int i = 0; i < fields.size(); i++) {
                    String val = getFieldValue(student, fields.get(i));
                    row.createCell(i).setCellValue(val);
                }
            }

            for (int i = 0; i < fields.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private byte[] generateCsv(List<Student> students, List<String> fields) throws Exception {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(out);
             CSVWriter csvWriter = new CSVWriter(writer)) {

            String[] header = fields.toArray(new String[0]);
            csvWriter.writeNext(header);

            for (Student student : students) {
                String[] row = new String[fields.size()];
                for (int i = 0; i < fields.size(); i++) {
                    row[i] = getFieldValue(student, fields.get(i));
                }
                csvWriter.writeNext(row);
            }
            csvWriter.flush();
            return out.toByteArray();
        }
    }

    private byte[] generatePdf(List<Student> students, List<String> fields) throws Exception {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Student Details Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            Paragraph subtitle = new Paragraph("Exported on: " + dateStr + " | Total Records: " + students.size(), subFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(fields.size());
            table.setWidthPercentage(100);

            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            for (String field : fields) {
                PdfPCell cell = new PdfPCell(new Phrase(field, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9);
            for (Student student : students) {
                for (String field : fields) {
                    PdfPCell cell = new PdfPCell(new Phrase(getFieldValue(student, field), dataFont));
                    cell.setPadding(4);
                    table.addCell(cell);
                }
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        }
    }

    private String getFieldValue(Student student, String field) {
        if (student == null) return "";
        try {
            switch (field.toLowerCase()) {
                case "roll number":
                    return student.getRollNumber() != null ? student.getRollNumber() : "";
                case "student name":
                case "name":
                    return (student.getUser() != null && student.getUser().getName() != null) ? student.getUser().getName() : "";
                case "email":
                    return (student.getUser() != null && student.getUser().getEmail() != null) ? student.getUser().getEmail() : "";
                case "mobile number":
                case "phone":
                    return student.getMobileNumber() != null ? student.getMobileNumber() : "";
                case "department":
                    return student.getDepartment() != null ? student.getDepartment().getCode() : "";
                case "section":
                    return ""; // Not in Student entity
                case "batch":
                case "academic year":
                    return student.getAcademicYear() != null ? student.getAcademicYear() : "";
                case "semester":
                    return student.getSemester() != null ? student.getSemester().toString() : "";
                case "cgpa":
                    return student.getCgpa() != null ? student.getCgpa().toString() : "";
                case "placement status":
                case "status":
                    return student.getVerificationStatus() != null ? student.getVerificationStatus().name() : "";
                default:
                    return "";
            }
        } catch (Exception e) {
            return "";
        }
    }
}
