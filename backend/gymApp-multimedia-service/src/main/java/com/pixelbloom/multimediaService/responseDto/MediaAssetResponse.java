package com.pixelbloom.multimediaService.responseDto;

import com.pixelbloom.multimediaService.enums.*;
import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaAssetResponse {
    private Long id;
    private String fileUrl;
    private MediaType mediaType;
    private MediaCategory mediaCategory;
    private Visibility visibility;
    private AccessScope accessScope;
    private Long batchId;
    private String originalFileName;
    private Long fileSizeBytes;
    private String mimeType;
    private Long uploadedBy;
    private LocalDateTime uploadedAt;
    private boolean active;
}
