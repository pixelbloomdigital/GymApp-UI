package com.pixelbloom.publicInfo.service;

import com.pixelbloom.publicInfo.dto.GymProfileRequest;
import com.pixelbloom.publicInfo.entity.GymProfile;

public interface GymProfileService {
    GymProfile getProfile();
    GymProfile upsertProfile(GymProfileRequest request);
}
