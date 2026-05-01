package com.pixelbloom.multimediaService.service;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpRange;
import org.springframework.http.ResponseEntity;

public interface MediaServeService {

    /**
     * Serves the media file identified by uniqueFileName.
     *
     * @param uniqueFileName the stored file name
     * @param jwtToken       raw token string (without "Bearer " prefix), may be null for PUBLIC assets
     * @param range          HTTP Range header value, may be null
     * @return ResponseEntity with the file resource (200 or 206 for range requests)
     */
    ResponseEntity<Resource> serve(String uniqueFileName, String jwtToken, HttpRange range);
}
