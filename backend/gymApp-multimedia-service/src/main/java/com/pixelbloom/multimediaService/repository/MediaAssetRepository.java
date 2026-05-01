package com.pixelbloom.multimediaService.repository;

import com.pixelbloom.multimediaService.entity.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long>,
        JpaSpecificationExecutor<MediaAsset> {

    Optional<MediaAsset> findByUniqueFileName(String uniqueFileName);
}
