package com.pixelbloom.multimediaService.service;

import com.pixelbloom.multimediaService.entity.MediaAsset;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public interface AccessControlService {

    /**
     * Returns true if the caller (identified by jwtToken) is allowed to access the given asset.
     * Throws UnauthorizedException (401) if no valid token and asset is PRIVATE.
     * Throws UnauthorizedException (403) if token is valid but role/batch does not permit access.
     */
    boolean canServe(MediaAsset asset, String jwtToken);

    /**
     * Returns a JPA Specification that limits library queries to assets the caller may see,
     * based on their role, memberId, and active membership batchId.
     */
    Specification<MediaAsset> libraryScope(String role, Long memberId, Long callerBatchId);
}
