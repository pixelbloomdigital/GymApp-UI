package com.pixelbloom.multimediaService.serviceImpl;

import com.pixelbloom.multimediaService.entity.MediaAsset;
import com.pixelbloom.multimediaService.enums.AccessScope;
import com.pixelbloom.multimediaService.enums.MediaCategory;
import com.pixelbloom.multimediaService.enums.MediaType;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.exception.InvalidUploadRequestException;
import com.pixelbloom.multimediaService.exception.MediaAssetNotFoundException;
import com.pixelbloom.multimediaService.repository.MediaAssetRepository;
import com.pixelbloom.multimediaService.requestDto.UpdateVisibilityRequest;
import com.pixelbloom.multimediaService.responseDto.MediaAssetResponse;
import com.pixelbloom.multimediaService.service.AccessControlService;
import com.pixelbloom.multimediaService.service.MediaLibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MediaLibraryServiceImpl implements MediaLibraryService {

    private final MediaAssetRepository mediaAssetRepository;
    private final AccessControlService accessControlService;

    @Override
    public Page<MediaAssetResponse> listAssets(MediaType mediaType,
                                               MediaCategory category,
                                               Visibility visibility,
                                               String search,
                                               Pageable pageable,
                                               String role,
                                               Long memberId,
                                               Long callerBatchId) {

        Specification<MediaAsset> spec = accessControlService.libraryScope(role, memberId, callerBatchId);

        // Only active assets by default
        spec = spec.and((root, query, cb) -> cb.isTrue(root.get("isActive")));

        if (mediaType != null) {
            final MediaType mt = mediaType;
            spec = spec.and((root, query, cb) -> cb.equal(root.get("mediaType"), mt));
        }
        if (category != null) {
            final MediaCategory cat = category;
            spec = spec.and((root, query, cb) -> cb.equal(root.get("mediaCategory"), cat));
        }
        if (visibility != null) {
            final Visibility vis = visibility;
            spec = spec.and((root, query, cb) -> cb.equal(root.get("visibility"), vis));
        }
        if (search != null && !search.isBlank()) {
            final String pattern = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("originalFileName")), pattern));
        }

        return mediaAssetRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Override
    public MediaAssetResponse getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    @Override
    public MediaAssetResponse deactivate(Long id) {
        MediaAsset asset = findOrThrow(id);
        asset.setActive(false);
        return toResponse(mediaAssetRepository.save(asset));
    }

    @Override
    public MediaAssetResponse reactivate(Long id) {
        MediaAsset asset = findOrThrow(id);
        asset.setActive(true);
        return toResponse(mediaAssetRepository.save(asset));
    }

    @Override
    public MediaAssetResponse updateVisibility(Long id, UpdateVisibilityRequest request) {
        MediaAsset asset = findOrThrow(id);

        if (request.getVisibility() == Visibility.PRIVATE) {
            if (request.getAccessScope() == null) {
                throw new InvalidUploadRequestException(
                        "accessScope is required when setting visibility to PRIVATE");
            }
            if (request.getAccessScope() == AccessScope.BATCH && request.getBatchId() == null) {
                throw new InvalidUploadRequestException(
                        "batchId is required when accessScope is BATCH");
            }
            asset.setVisibility(Visibility.PRIVATE);
            asset.setAccessScope(request.getAccessScope());
            asset.setBatchId(request.getAccessScope() == AccessScope.BATCH ? request.getBatchId() : null);
        } else {
            // Setting to PUBLIC — clear access restrictions
            asset.setVisibility(Visibility.PUBLIC);
            asset.setAccessScope(null);
            asset.setBatchId(null);
        }

        return toResponse(mediaAssetRepository.save(asset));
    }

    // -----------------------------------------------------------------------

    private MediaAsset findOrThrow(Long id) {
        return mediaAssetRepository.findById(id)
                .orElseThrow(() -> new MediaAssetNotFoundException("Media asset not found: " + id));
    }

    private MediaAssetResponse toResponse(MediaAsset asset) {
        return MediaAssetResponse.builder()
                .id(asset.getId())
                .fileUrl(asset.getFileUrl())
                .mediaType(asset.getMediaType())
                .mediaCategory(asset.getMediaCategory())
                .visibility(asset.getVisibility())
                .accessScope(asset.getAccessScope())
                .batchId(asset.getBatchId())
                .originalFileName(asset.getOriginalFileName())
                .fileSizeBytes(asset.getFileSizeBytes())
                .mimeType(asset.getMimeType())
                .uploadedBy(asset.getUploadedBy())
                .uploadedAt(asset.getUploadedAt())
                .active(asset.isActive())
                .build();
    }
}
