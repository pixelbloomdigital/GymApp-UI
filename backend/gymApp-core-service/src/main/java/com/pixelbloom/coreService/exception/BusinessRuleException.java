package com.pixelbloom.coreService.exception;

/**
 * Thrown when a business rule is violated (e.g. duplicate attendance, active membership exists).
 * Maps to HTTP 409 Conflict.
 */
public class BusinessRuleException extends RuntimeException {
    public BusinessRuleException(String message) {
        super(message);
    }
}
