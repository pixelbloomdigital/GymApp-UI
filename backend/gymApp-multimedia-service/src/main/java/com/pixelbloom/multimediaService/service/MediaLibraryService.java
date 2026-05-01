package com.pixelbloom.multimediaService.service;

import com.pixelbloom.multimediaService.enums.MediaCategory;
import com.pixelbloom.multimediaService.enums.MediaType;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.requestDto.UpdateVisibilityRequest;
import com.pixelbloom.multimediaService.responseDto.MediaAssetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MediaLibraryService {

    Page<MediaAssetResponse> listAssets(MediaType mediaType,
                                        MediaCategory category,
                                        Visibility visibility,
                                        String search,
                                        Pageable pageable,
                                        String role,
                                        Long memberId,
                                        Long callerBatchId);

    MediaAssetResponse getById(Long id);

    MediaAssetResponse deactivate(Long id);

    MediaAssetResponse reactivate(Long id);

    MediaAssetResponse updateVisibility(Long id, UpdateVisibilityRequest request);
}
