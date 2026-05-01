package com.pixelbloom.multimediaService.controller;

import com.pixelbloom.multimediaService.enums.AccessScope;
import com.pixelbloom.multimediaService.enums.MediaCategory;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.responseDto.MediaAssetResponse;
import com.pixelbloom.multimediaService.service.MediaUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@Tag(name = "Media Upload", description = "Upload images and videos")
@SecurityRequirement(name = "bearerAuth")
public class MediaUploadController {

    private final MediaUploadService mediaUploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    @Operation(summary = "Upload a media asset (ADMIN or TRAINER only)")
    public ResponseEntity<MediaAssetResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam MediaCategory category,
            @RequestParam(defaultValue = "PUBLIC") Visibility visibility,
            @RequestParam(required = false) AccessScope accessScope,
            @RequestParam(required = false) Long batchId,
            HttpServletRequest request) {

        // memberId is set as a request attribute by JwtAuthenticationFilter
        Long memberId = (Long) request.getAttribute("memberId");
        MediaAssetResponse response = mediaUploadService.upload(
                file, category, visibility, accessScope, batchId, memberId);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
