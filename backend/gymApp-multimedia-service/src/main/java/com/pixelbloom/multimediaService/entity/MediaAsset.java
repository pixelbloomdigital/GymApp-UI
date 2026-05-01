package com.pixelbloom.multimediaService.entity;

import com.pixelbloom.multimediaService.enums.*;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "media_assets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MediaAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String originalFileName;
    private String uniqueFileName;
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    private MediaType mediaType;

    @Enumerated(EnumType.STRING)
    private MediaCategory mediaCategory;

    @Enumerated(EnumType.STRING)
    private Visibility visibility;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private AccessScope accessScope;

    @Column(nullable = true)
    private Long batchId;

    private Long fileSizeBytes;
    private String mimeType;
    private Long uploadedBy;

    @CreationTimestamp
    private LocalDateTime uploadedAt;

    @Builder.Default
    private boolean active = true;
}
