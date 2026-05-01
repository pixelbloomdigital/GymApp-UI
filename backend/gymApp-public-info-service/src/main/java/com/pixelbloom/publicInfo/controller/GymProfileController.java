package com.pixelbloom.publicInfo.controller;

import com.pixelbloom.publicInfo.dto.GymProfileRequest;
import com.pixelbloom.publicInfo.entity.GymProfile;
import com.pixelbloom.publicInfo.service.GymProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/gym-profile")
@RequiredArgsConstructor
public class GymProfileController {

    private final GymProfileService profileService;

    /** Public — no auth required */
    @GetMapping
    public ResponseEntity<GymProfile> getProfile() {
        return ResponseEntity.ok(profileService.getProfile());
    }

    /** Admin only — create or update gym profile */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GymProfile> upsertProfile(@RequestBody GymProfileRequest request) {
        return ResponseEntity.ok(profileService.upsertProfile(request));
    }
}
