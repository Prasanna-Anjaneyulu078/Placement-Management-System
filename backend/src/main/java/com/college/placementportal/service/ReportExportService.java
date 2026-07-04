package com.college.placementportal.service;

import com.college.placementportal.entity.Alumni;
import com.college.placementportal.entity.Application;
import com.college.placementportal.entity.Job;
import com.college.placementportal.entity.Student;
import com.college.placementportal.repository.AlumniRepository;
import com.college.placementportal.repository.ApplicationRepository;
import com.college.placementportal.repository.JobRepository;
import com.college.placementportal.repository.StudentRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class ReportExportService {

    @Autowired
    private StudentRepository studentRepository;
    
    @Autowired
    private AlumniRepository alumniRepository;
    
    @Autowired
    private JobRepository jobRepository;
    
    @Autowired
    private ApplicationRepository applicationRepository;

    public Resource generateReport(String type, String format) {
        if ("EXCEL".equalsIgnoreCase(format)) {
            return generateExcelReport(type);
        } else {
            return generateCsvReport(type);
        }
    }

    private Resource generateCsvReport(String type) {
        StringBuilder sb = new StringBuilder();
        if ("STUDENT".equalsIgnoreCase(type)) {
            sb.append("ID,Name,Email,RollNumber,Department,Semester,CGPA,VerificationStatus\n");
            List<Student> students = studentRepository.findAll();
            for (Student s : students) {
                sb.append(s.getId()).append(",")
                  .append(s.getUser() != null ? s.getUser().getName() : "").append(",")
                  .append(s.getUser() != null ? s.getUser().getEmail() : "").append(",")
                  .append(s.getRollNumber()).append(",")
                  .append(s.getDepartment()).append(",")
                  .append(s.getSemester()).append(",")
                  .append(s.getCgpa()).append(",")
                  .append(s.getVerificationStatus()).append("\n");
            }
        } else if ("ALUMNI".equalsIgnoreCase(type)) {
            sb.append("ID,Name,Email,Company,Designation,PassingYear,VerificationStatus\n");
            List<Alumni> alumni = alumniRepository.findAll();
            for (Alumni a : alumni) {
                sb.append(a.getId()).append(",")
                  .append(a.getUser() != null ? a.getUser().getName() : "").append(",")
                  .append(a.getUser() != null ? a.getUser().getEmail() : "").append(",")
                  .append(a.getCompany()).append(",")
                  .append(a.getDesignation()).append(",")
                  .append(a.getPassingYear()).append(",")
                  .append(a.getVerificationStatus()).append("\n");
            }
        } else if ("JOB".equalsIgnoreCase(type)) {
            sb.append("ID,Title,Company,Location,Type,Status,CreatedAt\n");
            List<Job> jobs = jobRepository.findAll();
            for (Job j : jobs) {
                sb.append(j.getId()).append(",")
                  .append(j.getTitle()).append(",")
                  .append(j.getCompany()).append(",")
                  .append(j.getLocation()).append(",")
                  .append(j.getJobType()).append(",")
                  .append(j.getStatus()).append(",")
                  .append(j.getCreatedAt()).append("\n");
            }
        } else if ("APP".equalsIgnoreCase(type) || "APPLICATION".equalsIgnoreCase(type)) {
            sb.append("ID,StudentName,JobTitle,Company,Status,AppliedAt\n");
            List<Application> apps = applicationRepository.findAll();
            for (Application a : apps) {
                sb.append(a.getId()).append(",")
                  .append(a.getStudent() != null && a.getStudent().getUser() != null ? a.getStudent().getUser().getName() : "").append(",")
                  .append(a.getJob() != null ? a.getJob().getTitle() : "").append(",")
                  .append(a.getJob() != null ? a.getJob().getCompany() : "").append(",")
                  .append(a.getStatus()).append(",")
                  .append(a.getAppliedAt()).append("\n");
            }
        }
        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        return new ByteArrayResource(bytes != null ? bytes : new byte[0]);
    }

    private Resource generateExcelReport(String type) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet(type + " Report");
            int rowIndex = 0;
            
            if ("STUDENT".equalsIgnoreCase(type)) {
                Row header = sheet.createRow(rowIndex++);
                header.createCell(0).setCellValue("ID");
                header.createCell(1).setCellValue("Name");
                header.createCell(2).setCellValue("Email");
                header.createCell(3).setCellValue("RollNumber");
                header.createCell(4).setCellValue("Department");
                header.createCell(5).setCellValue("Semester");
                header.createCell(6).setCellValue("CGPA");
                header.createCell(7).setCellValue("VerificationStatus");

                List<Student> students = studentRepository.findAll();
                for (Student s : students) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(s.getId());
                    row.createCell(1).setCellValue(s.getUser() != null ? s.getUser().getName() : "");
                    row.createCell(2).setCellValue(s.getUser() != null ? s.getUser().getEmail() : "");
                    row.createCell(3).setCellValue(s.getRollNumber() != null ? s.getRollNumber() : "");
                    row.createCell(4).setCellValue(s.getDepartment() != null ? s.getDepartment().getCode() : "");
                    row.createCell(5).setCellValue(s.getSemester() != null ? String.valueOf(s.getSemester()) : "");
                    row.createCell(6).setCellValue(s.getCgpa() != null ? String.valueOf(s.getCgpa()) : "");
                    row.createCell(7).setCellValue(s.getVerificationStatus() != null ? s.getVerificationStatus().toString() : "");
                }
            } else if ("ALUMNI".equalsIgnoreCase(type)) {
                Row header = sheet.createRow(rowIndex++);
                header.createCell(0).setCellValue("ID");
                header.createCell(1).setCellValue("Name");
                header.createCell(2).setCellValue("Email");
                header.createCell(3).setCellValue("Company");
                header.createCell(4).setCellValue("Designation");
                header.createCell(5).setCellValue("PassingYear");
                header.createCell(6).setCellValue("VerificationStatus");

                List<Alumni> alumni = alumniRepository.findAll();
                for (Alumni a : alumni) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(a.getId());
                    row.createCell(1).setCellValue(a.getUser() != null ? a.getUser().getName() : "");
                    row.createCell(2).setCellValue(a.getUser() != null ? a.getUser().getEmail() : "");
                    row.createCell(3).setCellValue(a.getCompany() != null ? a.getCompany() : "");
                    row.createCell(4).setCellValue(a.getDesignation() != null ? a.getDesignation() : "");
                    row.createCell(5).setCellValue(a.getPassingYear() != null ? String.valueOf(a.getPassingYear()) : "");
                    row.createCell(6).setCellValue(a.getVerificationStatus() != null ? a.getVerificationStatus().toString() : "");
                }
            } else if ("JOB".equalsIgnoreCase(type)) {
                Row header = sheet.createRow(rowIndex++);
                header.createCell(0).setCellValue("ID");
                header.createCell(1).setCellValue("Title");
                header.createCell(2).setCellValue("Company");
                header.createCell(3).setCellValue("Location");
                header.createCell(4).setCellValue("Type");
                header.createCell(5).setCellValue("Status");
                header.createCell(6).setCellValue("CreatedAt");

                List<Job> jobs = jobRepository.findAll();
                for (Job j : jobs) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(j.getId());
                    row.createCell(1).setCellValue(j.getTitle() != null ? j.getTitle() : "");
                    row.createCell(2).setCellValue(j.getCompany() != null ? j.getCompany() : "");
                    row.createCell(3).setCellValue(j.getLocation() != null ? j.getLocation() : "");
                    row.createCell(4).setCellValue(j.getJobType() != null ? j.getJobType() : "");
                    row.createCell(5).setCellValue(j.getStatus() != null ? j.getStatus().toString() : "");
                    row.createCell(6).setCellValue(j.getCreatedAt() != null ? j.getCreatedAt().toString() : "");
                }
            } else if ("APP".equalsIgnoreCase(type) || "APPLICATION".equalsIgnoreCase(type)) {
                Row header = sheet.createRow(rowIndex++);
                header.createCell(0).setCellValue("ID");
                header.createCell(1).setCellValue("StudentName");
                header.createCell(2).setCellValue("JobTitle");
                header.createCell(3).setCellValue("Company");
                header.createCell(4).setCellValue("Status");
                header.createCell(5).setCellValue("AppliedAt");

                List<Application> apps = applicationRepository.findAll();
                for (Application a : apps) {
                    Row row = sheet.createRow(rowIndex++);
                    row.createCell(0).setCellValue(a.getId());
                    row.createCell(1).setCellValue(a.getStudent() != null && a.getStudent().getUser() != null ? a.getStudent().getUser().getName() : "");
                    row.createCell(2).setCellValue(a.getJob() != null ? a.getJob().getTitle() : "");
                    row.createCell(3).setCellValue(a.getJob() != null ? a.getJob().getCompany() : "");
                    row.createCell(4).setCellValue(a.getStatus() != null ? a.getStatus().toString() : "");
                    row.createCell(5).setCellValue(a.getAppliedAt() != null ? a.getAppliedAt().toString() : "");
                }
            }
            
            workbook.write(out);
            byte[] bytes = out.toByteArray();
            if (bytes == null) throw new IllegalStateException("Byte array is null");
            return new ByteArrayResource(bytes);
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }
}
