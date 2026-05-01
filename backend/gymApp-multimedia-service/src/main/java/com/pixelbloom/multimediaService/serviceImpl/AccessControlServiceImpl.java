package com.pixelbloom.multimediaService.serviceImpl;

import com.pixelbloom.multimediaService.entity.MediaAsset;
import com.pixelbloom.multimediaService.enums.AccessScope;
import com.pixelbloom.multimediaService.enums.Visibility;
import com.pixelbloom.multimediaService.exception.ServiceUnavailableException;
import com.pixelbloom.multimediaService.exception.UnauthorizedException;
import com.pixelbloom.multimediaService.feignClient.BatchAccessVerifier;
import com.pixelbloom.multimediaService.responseDto.MembershipResponse;
import com.pixelbloom.multimediaService.service.AccessControlService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccessControlServiceImpl implements AccessControlService {

    private final BatchAccessVerifier batchAccessVerifier;

    @Value("${jwt.secretKey}")
    private String jwtSecret;

    // -----------------------------------------------------------------------
    // canServe
    // -----------------------------------------------------------------------

    @Override
    public boolean canServe(MediaAsset asset, String jwtToken) {
        // PUBLIC assets are always accessible
        if (asset.getVisibility() == Visibility.PUBLIC) {
            return true;
        }

        // PRIVATE — must have a valid token
        if (jwtToken == null || jwtToken.isBlank()) {
            throw new UnauthorizedException("Authentication required to access this resource");
        }

        Claims claims = parseClaims(jwtToken);
        String role = claims.get("role", String.class);
        Long memberId = claims.get("memberId", Long.class);

        AccessScope scope = asset.getAccessScope();

        return switch (scope) {
            case ADMIN_ONLY -> isAdmin(role);
            case TRAINER    -> isAdmin(role) || isTrainer(role);
            case ALL_MEMBERS -> true; // any authenticated user
            case BATCH      -> {
                if (isAdmin(role) || isTrainer(role)) yield true;
                // MEMBER: check active membership batchId
                yield memberHasActiveBatchAccess(memberId, asset.getBatchId(), "Bearer " + jwtToken);
            }
        };
    }

    // -----------------------------------------------------------------------
    // libraryScope
    // -----------------------------------------------------------------------

    @Override
    public Specification<MediaAsset> libraryScope(String role, Long memberId, Long callerBatchId) {
        return (root, query, cb) -> {
            // ADMIN sees everything
            if (isAdmin(role)) {
                return cb.conjunction();
            }

            // TRAINER sees PUBLIC + TRAINER scope + ALL_MEMBERS scope + BATCH scope
            if (isTrainer(role)) {
                return cb.or(
                        cb.equal(root.get("visibility"), Visibility.PUBLIC),
                        cb.and(
                                cb.equal(root.get("visibility"), Visibility.PRIVATE),
                                cb.notEqual(root.get("accessScope"), AccessScope.ADMIN_ONLY)
                        )
                );
            }

            // MEMBER sees PUBLIC + ALL_MEMBERS scope + BATCH scope matching their batchId
            return cb.or(
                    cb.equal(root.get("visibility"), Visibility.PUBLIC),
                    cb.and(
                            cb.equal(root.get("visibility"), Visibility.PRIVATE),
                            cb.equal(root.get("accessScope"), AccessScope.ALL_MEMBERS)
                    ),
                    cb.and(
                            cb.equal(root.get("visibility"), Visibility.PRIVATE),
                            cb.equal(root.get("accessScope"), AccessScope.BATCH),
                            callerBatchId != null
                                    ? cb.equal(root.get("batchId"), callerBatchId)
                                    : cb.disjunction()
                    )
            );
        };
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }

    private boolean isTrainer(String role) {
        return "TRAINER".equalsIgnoreCase(role);
    }

    private boolean memberHasActiveBatchAccess(Long memberId, Long requiredBatchId, String bearerToken) {
        if (memberId == null || requiredBatchId == null) return false;
        try {
            List<MembershipResponse> memberships =
                    batchAccessVerifier.getMemberMemberships(memberId, bearerToken);
            return memberships.stream()
                    .anyMatch(m -> "ACTIVE".equalsIgnoreCase(m.getStatus())
                            && requiredBatchId.equals(m.getBatchId()));
        } catch (Exception e) {
            throw new ServiceUnavailableException(
                    "Unable to verify batch membership: " + e.getMessage());
        }
    }

    private Claims parseClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(jwtSecret.getBytes()))
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid or expired token");
        }
    }
}
