package com.pixelbloom.multimediaService.exception;

public class FileSizeLimitExceededException extends RuntimeException {
    public FileSizeLimitExceededException(String message) { super(message); }
}
