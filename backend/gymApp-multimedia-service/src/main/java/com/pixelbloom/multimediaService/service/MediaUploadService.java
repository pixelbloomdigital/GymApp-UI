package com.pixelbloom.multimediaService.service;

import com.pixelbloom.multimediaService.enums.AccessScope;
import com.pixelbloom.multimediaService.enums.MediaCategory;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.responseDto.MediaAssetResponse;
import org.springframework.web.multipart.MultipartFile;

public interface MediaUploadService {

    MediaAssetResponse upload(MultipartFile file,
                              MediaCategory category,
                              Visibility visibility,
                              AccessScope accessScope,
                              Long batchId,
                              Long uploadedBy);
}
