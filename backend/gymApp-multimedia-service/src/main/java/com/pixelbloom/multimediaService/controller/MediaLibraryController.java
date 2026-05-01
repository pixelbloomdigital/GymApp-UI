package com.pixelbloom.multimediaService.controller;

import com.pixelbloom.multimediaService.enums.MediaCategory;
import com.pixelbloom.multimediaService.enums.MediaType;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.requestDto.UpdateVisibilityRequest;
import com.pixelbloom.multimediaService.responseDto.MediaAssetResponse;
import com.pixelbloom.multimediaService.service.MediaLibraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/media/assets")
@RequiredArgsConstructor
@Tag(name = "Media Library", description = "Browse, manage, and update media assets")
@SecurityRequirement(name = "bearerAuth")
public class MediaLibraryController {

    private final MediaLibraryService mediaLibraryService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List media assets with optional filters and pagination")
    public ResponseEntity<Page<MediaAssetResponse>> listAssets(
            @RequestParam(required = false) MediaType mediaType,
            @RequestParam(required = false) MediaCategory category,
            @RequestParam(required = false) Visibility visibility,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {

        String role        = (String) request.getAttribute("role");
        Long memberId      = (Long)   request.getAttribute("memberId");
        Long callerBatchId = (Long)   request.getAttribute("callerBatchId");

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadedAt"));

        return ResponseEntity.ok(
                mediaLibraryService.listAssets(mediaType, category, visibility, search,
                        pageable, role, memberId, callerBatchId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get metadata for a single media asset")
    public ResponseEntity<MediaAssetResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mediaLibraryService.getById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate (soft-delete) a media asset")
    public ResponseEntity<MediaAssetResponse> deactivate(@PathVariable Long id) {
        return ResponseEntity.ok(mediaLibraryService.deactivate(id));
    }

    @PatchMapping("/{id}/reactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reactivate a previously deactivated media asset")
    public ResponseEntity<MediaAssetResponse> reactivate(@PathVariable Long id) {
        return ResponseEntity.ok(mediaLibraryService.reactivate(id));
    }

    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update visibility and access scope of a media asset")
    public ResponseEntity<MediaAssetResponse> updateVisibility(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVisibilityRequest request) {
        return ResponseEntity.ok(mediaLibraryService.updateVisibility(id, request));
    }
}
