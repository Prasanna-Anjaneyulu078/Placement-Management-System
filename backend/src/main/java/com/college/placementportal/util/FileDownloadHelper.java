package com.college.placementportal.util;

/**
 * Centralises the naming convention for all downloadable files:
 *   ROLLNUMBER_DocumentType.extension
 *
 * Examples:
 *   24BQ5A5403_Resume.pdf
 *   24BQ5A5403_VerificationDocument.pdf
 *   24BQ5A5403_ProfilePhoto.jpg
 */
public final class FileDownloadHelper {

    private FileDownloadHelper() {}

    /**
     * Build the standardized download filename.
     *
     * @param rollNumber    Student / alumni roll number (e.g. "24BQ5A5403")
     * @param documentType  Human-readable document type (e.g. "Resume", "VerificationDocument")
     * @param extension     File extension without leading dot (e.g. "pdf", "jpg")
     * @return              e.g. "24BQ5A5403_Resume.pdf"
     */
    public static String buildFilename(String rollNumber, String documentType, String extension) {
        String safeRoll = (rollNumber != null && !rollNumber.isBlank())
                ? rollNumber.replaceAll("[^A-Za-z0-9]", "")
                : "STUDENT";
        String safeType = (documentType != null && !documentType.isBlank())
                ? documentType.replaceAll("[^A-Za-z0-9]", "")
                : "Document";
        String safeExt  = (extension != null && !extension.isBlank())
                ? extension.toLowerCase().replaceAll("[^a-z0-9]", "")
                : "pdf";
        return safeRoll + "_" + safeType + "." + safeExt;
    }

    /**
     * Extract the file extension from a filename or path (without the dot).
     * Returns "pdf" if none found.
     */
    public static String extractExtension(String filename) {
        if (filename == null) return "pdf";
        int dot = filename.lastIndexOf('.');
        if (dot < 0 || dot >= filename.length() - 1) return "pdf";
        return filename.substring(dot + 1).toLowerCase();
    }
}
