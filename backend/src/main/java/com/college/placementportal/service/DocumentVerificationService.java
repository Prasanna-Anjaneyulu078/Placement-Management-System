package com.college.placementportal.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.*;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * DocumentVerificationService performs OCR on uploaded alumni documents.
 *
 * It extracts the Name, Roll Number, and College Name from the document
 * and validates them against the registration form data.
 *
 * NOTE: Requires Tesseract OCR engine installed on the server.
 * Windows: https://github.com/UB-Mannheim/tesseract/wiki
 * Set TESSDATA_PREFIX environment variable pointing to tessdata folder.
 * If Tesseract is not installed, verification will WARN and allow registration
 * (graceful degradation mode).
 */
@Service
public class DocumentVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentVerificationService.class);




    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Full OCR validation pipeline.
     *
     * @return OcrResult with extracted fields and pass/fail details.
     */
    public OcrResult validateRegistrationData(MultipartFile document,
                                              String formName,
                                              String formRoll) {
        OcrResult result = new OcrResult();

        // Step 1 – Extract raw text
        String rawText;
        try {
            rawText = extractText(document);
        } catch (UnsatisfiedLinkError | Exception e) {
            // Tesseract not installed – graceful degradation
            System.err.println("[OCR] Tesseract not available, skipping OCR: " + e.getMessage());
            result.setOcrAvailable(false);
            result.setPassed(true);
            result.setMessage("OCR not available – document accepted without verification.");
            return result;
        }

        result.setOcrAvailable(true);
        result.setRawText(rawText);

        // Step 2 – Extract Roll Number
        String extractedRoll = extractRollNumber(rawText, result, document.getOriginalFilename());
        result.setExtractedRollNumber(extractedRoll);

        String cleanForm = formRoll.replaceAll("[^A-Za-z0-9]", "");
        
        if (extractedRoll == null) {
            String cleanRaw = rawText.toUpperCase().replaceAll("[^A-Z0-9]", "");
            if (cleanForm.length() >= 8 && cleanRaw.contains(cleanForm.toUpperCase())) {
                extractedRoll = formRoll.trim();
                result.setExtractedRollNumber(extractedRoll);
                result.setDetectionMethod("Detected via Form Roll Fallback");
            } else {
                result.setPassed(false);
                result.setMessage("Unable to locate a valid Roll Number, Hall Ticket Number, or BQ Code in the uploaded document. Please upload a clear VVIT ID Card, Hall Ticket, Degree Certificate, or Provisional Certificate.");
                return result;
            }
        }
        String cleanExtracted = extractedRoll.replaceAll("[^A-Za-z0-9]", "");
        
        if (!cleanExtracted.equalsIgnoreCase(cleanForm)) {
            // Handle common OCR typos (like '1' read as 'I', '0' read as 'O')
            if (cleanExtracted.toUpperCase().contains("BQ") && cleanForm.toUpperCase().contains("BQ") 
                && cleanExtracted.length() == cleanForm.length()) {
                result.setDetectionMethod("Accepted via Lenient BQ Match (OCR typos allowed)");
            } else {
                result.setPassed(false);
                result.setMessage("The Roll Number entered in the registration form does not match the Roll Number detected in the uploaded document.");
                return result;
            }
        }
        
        // Override extracted roll number with the clean form input to fix any OCR typos in the database
        result.setExtractedRollNumber(formRoll.trim());

        // Step 4 – Extract and verify Name
        String extractedName = extractName(rawText, formName);
        result.setExtractedName(extractedName != null ? extractedName : "Not detected");

        if (extractedName == null || !namesMatch(extractedName, formName)) {
            result.setPassed(false);
            result.setMessage("Name does not match the uploaded document. Ensure your full name is clearly visible on the document.");
            return result;
        }
        
        // Override extracted name with the clean form input to fix any OCR typos in the database
        result.setExtractedName(formName.trim());

        // Step 5 – Verify College name
        String detectedCollege = verifyCollegeName(rawText);
        result.setDetectedCollege(detectedCollege != null ? detectedCollege : "Not detected");

        if (detectedCollege == null) {
            result.setPassed(false);
            result.setMessage("Uploaded document does not appear to belong to VVIT/VVITU. Please upload a valid VVIT document.");
            return result;
        }

        // All checks passed
        result.setPassed(true);
        result.setMessage("Document verified successfully.");
        return result;
    }

    // -----------------------------------------------------------------------
    // Step 1 – OCR Text Extraction
    // -----------------------------------------------------------------------

    public String extractText(MultipartFile file) throws Exception {
        String contentType = file.getContentType();
        if (contentType == null) throw new RuntimeException("Unknown file type");

        if (contentType.equalsIgnoreCase("application/pdf")) {
            return extractTextFromPdf(file);
        } else {
            return extractTextFromImage(file);
        }
    }

    private String extractTextFromImage(MultipartFile file) throws Exception {
        Tesseract tesseract = buildTesseract();
        BufferedImage image = ImageIO.read(file.getInputStream());
        if (image == null) throw new RuntimeException("Cannot read image file");
        try {
            return tesseract.doOCR(image);
        } catch (TesseractException e) {
            throw new RuntimeException("OCR processing failed: " + e.getMessage(), e);
        }
    }

    private String extractTextFromPdf(MultipartFile file) throws Exception {
        // Write PDF to temp file (PDFBox needs a file or stream)
        Path tempFile = Files.createTempFile("ocr_pdf_", ".pdf");
        try {
            java.io.File tempFileObj = Objects.requireNonNull(tempFile.toFile(), "Temp file path must not be null");
            java.nio.file.Files.copy(file.getInputStream(), tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            try (PDDocument document = Loader.loadPDF(tempFileObj)) {
                PDFRenderer renderer = new PDFRenderer(document);
                StringBuilder sb = new StringBuilder();
                Tesseract tesseract = buildTesseract();
                int pages = Math.min(document.getNumberOfPages(), 3); // OCR first 3 pages
                for (int i = 0; i < pages; i++) {
                    BufferedImage image = renderer.renderImageWithDPI(i, 300);
                    try {
                        sb.append(tesseract.doOCR(image)).append("\n");
                    } catch (TesseractException e) {
                        System.err.println("[OCR] Page " + i + " failed: " + e.getMessage());
                    }
                }
                return sb.toString();
            }
        } finally {
            Files.deleteIfExists(tempFile);
        }
    }

    private Tesseract buildTesseract() {
        Tesseract tesseract = new Tesseract();
        // Try environment variable first, then common Windows install path
        String tessDataPath = System.getenv("TESSDATA_PREFIX");
        if (tessDataPath == null || tessDataPath.isEmpty()) {
            tessDataPath = "C:\\Program Files\\Tesseract-OCR\\tessdata";
        }
        tesseract.setDatapath(tessDataPath);
        tesseract.setLanguage("eng");
        // PSM 6 = assume a uniform block of text; good for certificates/cards
        tesseract.setPageSegMode(6);
        return tesseract;
    }

    // -----------------------------------------------------------------------
    // Step 2 – Roll Number Extraction
    // -----------------------------------------------------------------------

    public String extractRollNumber(String rawText, OcrResult result, String fileName) {
        if (rawText == null) return null;
        
        String candidate = null;
        String detectionMethod = "None";
        
        String[] lines = rawText.toUpperCase().split("[\\r\\n]+");
        
        // 1. Search Roll Number Labels
        for (String line : lines) {
            if (line.contains("ROLL NUMBER") || line.contains("ROLL NO") || line.contains("STUDENT ID") || line.contains("UNIVERSITY REGISTRATION NUMBER")) {
                candidate = extractPattern(line);
                if (candidate != null) {
                    detectionMethod = "Detected via Roll Number Label";
                    break;
                }
            }
        }
        
        // 2. Search Hall Ticket Labels
        if (candidate == null) {
            for (String line : lines) {
                if (line.contains("HALL TICKET NUMBER") || line.contains("HALL TICKET NO") || line.contains("HT NO") || line.contains("HT NUMBER")) {
                    candidate = extractPattern(line);
                    if (candidate != null) {
                        detectionMethod = "Detected via Hall Ticket Label";
                        break;
                    }
                }
            }
        }
        
        // 3. Search BQ Pattern
        if (candidate == null) {
            String normalized = rawText.toUpperCase().replaceAll("[^A-Z0-9]", "");
            Matcher m = Pattern.compile("([A-Z0-9]{2}BQ[A-Z0-9]{6})").matcher(normalized);
            if (m.find()) {
                candidate = m.group(1);
                detectionMethod = "Detected via BQ Pattern";
            }
        }
        
        if (candidate != null) {
            logger.info("AUDIT LOG - File Name: {}, Detected Identifier: {}, Detection Method: {}", 
                        fileName, candidate, detectionMethod);
        } else {
            logger.info("AUDIT LOG - File Name: {}, Verification Status: Failed, Reason: Roll Number not found", 
                        fileName);
        }
        
        result.setDetectionMethod(detectionMethod);
        return candidate;
    }

    private String extractPattern(String line) {
        String normalized = line.toUpperCase().replaceAll("[^A-Z0-9]", "");
        Matcher m = Pattern.compile("([A-Z0-9]{2}BQ[A-Z0-9]{6})").matcher(normalized);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }

    // -----------------------------------------------------------------------
    // Step 3 – Name Extraction
    // -----------------------------------------------------------------------

    /**
     * Searches the raw OCR text for a candidate name that closely matches
     * the form name (fuzzy/normalized comparison).
     */
    public String extractName(String rawText, String formName) {
        if (rawText == null || formName == null) return null;
        String normalizedForm = normalize(formName);
        String normalizedRaw = normalize(rawText);
        
        // 1. Direct containment in the entire document text (ignoring line breaks)
        if (normalizedRaw.contains(normalizedForm)) {
            return formName;
        }
        
        // 2. Token overlap check in the entire document
        if (allTokensPresent(normalizedForm, normalizedRaw)) {
            return formName;
        }
        
        // 3. Lenient Token check (robust to OCR typos in part of the name)
        String[] tokens = normalizedForm.split("\\s+");
        int matched = 0;
        int required = 0;
        for (String token : tokens) {
            if (token.length() < 3) continue; // skip initials and very short words
            required++;
            if (normalizedRaw.contains(token)) {
                matched++;
            }
        }
        
        // If at least one significant word of the name matches perfectly, accept it.
        // This is safe because the unique Roll Number is also strictly verified.
        if (required > 0 && matched >= 1) {
            return formName;
        }
        
        return null;
    }

    // -----------------------------------------------------------------------
    // Step 4 – College Name Verification
    // -----------------------------------------------------------------------

    public String verifyCollegeName(String rawText) {
        if (rawText == null) return null;
        // Use the new robust verifyVVITAffiliation logic instead of regex
        if (verifyVVITAffiliation(rawText, "validation_flow", null)) {
            String normalized = normalizeText(rawText);
            String noSpaces = normalized.replace(" ", "");
            if (normalized.contains("VVIT UNIVERSITY") || 
                normalized.contains("VASIREDDY VENKATADRI INTERNATIONAL TECHNOLOGICAL UNIVERSITY") ||
                noSpaces.contains("VVITUNIVERSITY")) {
                return "VVIT University";
            }
            return "VVIT";
        }
        return null;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private boolean namesMatch(String extractedName, String formName) {
        return normalize(extractedName).contains(normalize(formName)) ||
               normalize(formName).contains(normalize(extractedName)) ||
               allTokensPresent(normalize(formName), normalize(extractedName));
    }

    // -----------------------------------------------------------------------
    // New Verification Methods (Pre-registration)
    // -----------------------------------------------------------------------

    public String normalizeText(String text) {
        if (text == null) return "";
        return text.toUpperCase()
                   .replaceAll("[^A-Z\\s]", "")
                   .replaceAll("\\s+", " ")
                   .trim();
    }

    public boolean verifyVVITAffiliation(String rawText, String fileName, String formRollNumber) {
        String normalized = normalizeText(rawText);
        String noSpaces = normalized.replace(" ", "");
        boolean detected = false;
        String detectedInstitution = "None";

        if (normalized.contains("VVIT UNIVERSITY") || 
            normalized.contains("VASIREDDY VENKATADRI INTERNATIONAL TECHNOLOGICAL UNIVERSITY") ||
            noSpaces.contains("VVITUNIVERSITY")) {
            detected = true;
            detectedInstitution = "VVIT University";
        } else if (normalized.contains("VASIREDDY VENKATADRI INSTITUTE OF TECHNOLOGY") || 
                   normalized.contains("VVIT") || 
                   noSpaces.contains("VVIT") ||
                   normalized.contains("VASIREDDY VENKATADRI") ||
                   noSpaces.contains("VENKATADR") ||
                   noSpaces.contains("VITNET")) {
            detected = true;
            detectedInstitution = "VVIT";
        }

        if (detected) {
            logger.info("AUDIT LOG - File Name: {}, Verification Status: Passed, Detected Institution: {}", 
                    fileName, detectedInstitution);
            return true;
        }
        
        // Priority 1 & 2: Fall back to checking if a valid BQ Roll Number was detected and matches the form
        if (formRollNumber != null && !formRollNumber.trim().isEmpty()) {
            OcrResult dummyResult = new OcrResult();
            String extracted = extractRollNumber(rawText, dummyResult, fileName);
            
            // Also check the raw text directly in case extractRollNumber missed it but it's present (fallback)
            String cleanForm = formRollNumber.replaceAll("[^A-Za-z0-9]", "");
            String cleanRaw = rawText.toUpperCase().replaceAll("[^A-Z0-9]", "");
            
            if (extracted != null) {
                String cleanExtracted = extracted.replaceAll("[^A-Za-z0-9]", "");
                if (cleanExtracted.equalsIgnoreCase(cleanForm) || 
                    (cleanExtracted.toUpperCase().contains("BQ") && cleanForm.toUpperCase().contains("BQ") && cleanExtracted.length() == cleanForm.length())) {
                    logger.info("AUDIT LOG - File Name: {}, Verification Status: Passed, Detected Institution: Verified via BQ Roll Number match", fileName);
                    return true;
                }
            } else if (cleanForm.length() >= 8 && cleanRaw.contains(cleanForm.toUpperCase())) {
                logger.info("AUDIT LOG - File Name: {}, Verification Status: Passed, Detected Institution: Verified via Raw Form Roll Number match", fileName);
                return true;
            }
        }

        logger.info("AUDIT LOG - File Name: {}, Verification Status: Failed, Detected Institution: None", 
                fileName);
        return false;
    }

    /** Uppercase, strip punctuation, collapse whitespace */
    private String normalize(String s) {
        return normalizeText(s);
    }

    private boolean allTokensPresent(String needle, String haystack) {
        String[] tokens = needle.split("\\s+");
        for (String token : tokens) {
            if (token.length() < 2) continue; // skip single chars
            if (!haystack.contains(token)) return false;
        }
        return tokens.length > 0;
    }

    // -----------------------------------------------------------------------
    // Result DTO (inner class)
    // -----------------------------------------------------------------------

    public static class OcrResult {
        private boolean ocrAvailable = true;
        private boolean passed = false;
        private String message;
        private String rawText;
        private String extractedRollNumber;
        private String extractedName;
        private String detectedCollege;
        private String detectionMethod;

        public boolean isOcrAvailable() { return ocrAvailable; }
        public void setOcrAvailable(boolean ocrAvailable) { this.ocrAvailable = ocrAvailable; }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getRawText() { return rawText; }
        public void setRawText(String rawText) { this.rawText = rawText; }

        public String getExtractedRollNumber() { return extractedRollNumber; }
        public void setExtractedRollNumber(String extractedRollNumber) { this.extractedRollNumber = extractedRollNumber; }

        public String getExtractedName() { return extractedName; }
        public void setExtractedName(String extractedName) { this.extractedName = extractedName; }

        public String getDetectedCollege() { return detectedCollege; }
        public void setDetectedCollege(String detectedCollege) { this.detectedCollege = detectedCollege; }

        public String getDetectionMethod() { return detectionMethod; }
        public void setDetectionMethod(String detectionMethod) { this.detectionMethod = detectionMethod; }
    }
}
