package com.pixelbloom.multimediaService.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;

public interface StorageService {
    /**
     * Stores the file and returns the generated uniqueFileName.
     * Throws StorageUnavailableException if the backend is unavailable.
     */
    String store(MultipartFile file);

    /**
     * Loads the file as a Spring Resource.
     * Returns empty Optional if the file does not exist.
     */
    Optional<Resource> load(String uniqueFileName);

    /**
     * Returns true if the backend is reachable (used by health indicator).
     */
    boolean isHealthy();
}
