package com.college.placementportal.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class DocumentVerificationException extends RuntimeException {
    public DocumentVerificationException(String message) {
        super(message);
    }
}
