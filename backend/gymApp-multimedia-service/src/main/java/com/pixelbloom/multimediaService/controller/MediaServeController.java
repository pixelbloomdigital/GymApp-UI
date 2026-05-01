package com.pixelbloom.multimediaService.controller;

import com.pixelbloom.multimediaService.service.MediaServeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpRange;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/media/files")
@RequiredArgsConstructor
@Tag(name = "Media Serve", description = "Stream or download media assets")
public class MediaServeController {

    private final MediaServeService mediaServeService;

    /**
     * No @PreAuthorize — PUBLIC assets must be accessible without authentication.
     * Authorization header and Range header are read manually and forwarded to the service.
     */
    @GetMapping("/{uniqueFileName}")
    @Operation(summary = "Serve a media asset by unique file name")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String uniqueFileName,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "Range", required = false) String rangeHeader) {

        // Extract raw token (strip "Bearer " prefix if present)
        String jwtToken = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwtToken = authHeader.substring(7);
        }

        // Parse Range header if present
        HttpRange range = null;
        if (rangeHeader != null && !rangeHeader.isBlank()) {
            List<HttpRange> ranges = HttpRange.parseRanges(rangeHeader);
            if (!ranges.isEmpty()) {
                range = ranges.get(0);
            }
        }

        return mediaServeService.serve(uniqueFileName, jwtToken, range);
    }
}
