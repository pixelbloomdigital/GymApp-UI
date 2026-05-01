package com.pixelbloom.multimediaService.service;

import com.pixelbloom.multimediaService.enums.AccessScope;
import com.pixelbloom.multimediaService.enums.MediaType;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.exception.FileSizeLimitExceededException;
import com.pixelbloom.multimediaService.exception.InvalidUploadRequestException;
import com.pixelbloom.multimediaService.exception.UnsupportedMediaTypeException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Component
public class FileValidationService {

    private static final Set<String> ACCEPTED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final Set<String> ACCEPTED_VIDEO_TYPES = Set.of(
            "video/mp4", "video/webm", "video/quicktime"
    );
    private static final long MAX_IMAGE_SIZE = 10L * 1024 * 1024;   // 10 MB
    private static final long MAX_VIDEO_SIZE = 500L * 1024 * 1024;  // 500 MB

    /**
     * Validates the uploaded file and visibility/accessScope parameters.
     * Throws appropriate exceptions on validation failure.
     */
    public MediaType validate(MultipartFile file, Visibility visibility,
                              AccessScope accessScope, Long batchId) {
        String mimeType = file.getContentType();
        if (mimeType == null) {
            throw new UnsupportedMediaTypeException("File content type is missing or undetectable");
        }

        MediaType mediaType;
        if (ACCEPTED_IMAGE_TYPES.contains(mimeType)) {
            mediaType = MediaType.IMAGE;
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new FileSizeLimitExceededException(
                        "Image file exceeds maximum allowed size of 10 MB");
            }
        } else if (ACCEPTED_VIDEO_TYPES.contains(mimeType)) {
            mediaType = MediaType.VIDEO;
            if (file.getSize() > MAX_VIDEO_SIZE) {
                throw new FileSizeLimitExceededException(
                        "Video file exceeds maximum allowed size of 500 MB");
            }
        } else {
            throw new UnsupportedMediaTypeException(
                    "MIME type '" + mimeType + "' is not supported. " +
                    "Accepted types: image/jpeg, image/png, image/webp, image/gif, " +
                    "video/mp4, video/webm, video/quicktime");
        }

        // Visibility-specific validation
        if (visibility == Visibility.PRIVATE) {
            if (accessScope == null) {
                throw new InvalidUploadRequestException(
                        "accessScope is required when visibility is PRIVATE. " +
                        "Valid values: ADMIN_ONLY, TRAINER, ALL_MEMBERS, BATCH");
            }
            if (accessScope == AccessScope.BATCH && batchId == null) {
                throw new InvalidUploadRequestException(
                        "batchId is required when accessScope is BATCH");
            }
        }

        return mediaType;
    }
}
