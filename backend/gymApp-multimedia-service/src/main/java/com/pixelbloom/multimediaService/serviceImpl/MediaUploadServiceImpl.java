package com.pixelbloom.multimediaService.serviceImpl;

import com.pixelbloom.multimediaService.entity.MediaAsset;
import com.pixelbloom.multimediaService.enums.AccessScope;
import com.pixelbloom.multimediaService.enums.MediaCategory;
import com.pixelbloom.multimediaService.enums.MediaType;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.exception.StorageUnavailableException;
import com.pixelbloom.multimediaService.repository.MediaAssetRepository;
import com.pixelbloom.multimediaService.responseDto.MediaAssetResponse;
import com.pixelbloom.multimediaService.service.FileValidationService;
import com.pixelbloom.multimediaService.service.MediaUploadService;
import com.pixelbloom.multimediaService.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MediaUploadServiceImpl implements MediaUploadService {

    private final FileValidationService fileValidationService;
    private final StorageService storageService;
    private final MediaAssetRepository mediaAssetRepository;

    @Value("${app.media.base-url:http://localhost:8080/api/media/files}")
    private String mediaBaseUrl;

    @Override
    public MediaAssetResponse upload(MultipartFile file,
                                     MediaCategory category,
                                     Visibility visibility,
                                     AccessScope accessScope,
                                     Long batchId,
                                     Long uploadedBy) {

        // 1. Validate file + visibility rules; returns resolved MediaType
        MediaType mediaType = fileValidationService.validate(file, visibility, accessScope, batchId);

        // 2. Check storage health before attempting to store
        if (!storageService.isHealthy()) {
            throw new StorageUnavailableException("Storage backend is currently unavailable");
        }

        // 3. Store file and get uniqueFileName
        String uniqueFileName = storageService.store(file);

        // 4. Build stable public URL
        String fileUrl = mediaBaseUrl.stripTrailing() + "/" + uniqueFileName;

        // 5. Persist entity
        MediaAsset asset = MediaAsset.builder()
                .originalFileName(file.getOriginalFilename())
                .uniqueFileName(uniqueFileName)
                .fileUrl(fileUrl)
                .mediaType(mediaType)
                .mediaCategory(category)
                .visibility(visibility)
                .accessScope(visibility == Visibility.PRIVATE ? accessScope : null)
                .batchId(visibility == Visibility.PRIVATE && accessScope == AccessScope.BATCH ? batchId : null)
                .fileSizeBytes(file.getSize())
                .mimeType(file.getContentType())
                .uploadedBy(uploadedBy)
                .build();

        MediaAsset saved = mediaAssetRepository.save(asset);
        return toResponse(saved);
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