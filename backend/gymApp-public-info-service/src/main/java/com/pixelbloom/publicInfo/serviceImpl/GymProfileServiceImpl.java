package com.pixelbloom.publicInfo.serviceImpl;

import com.pixelbloom.publicInfo.dto.GymProfileRequest;
import com.pixelbloom.publicInfo.entity.GymProfile;
import com.pixelbloom.publicInfo.repository.GymProfileRepository;
import com.pixelbloom.publicInfo.service.GymProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GymProfileServiceImpl implements GymProfileService {

    private final GymProfileRepository profileRepo;

    @Override
    public GymProfile getProfile() {
        return profileRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Gym profile not configured yet"));
    }

    @Override
    public GymProfile upsertProfile(GymProfileRequest req) {
        GymProfile profile = profileRepo.findAll().stream().findFirst()
                .orElse(new GymProfile());

        profile.setGymName(req.getGymName());
        profile.setTagline(req.getTagline());
        profile.setDescription(req.getDescription());
        profile.setAddress(req.getAddress());
        profile.setCity(req.getCity());
        profile.setPhone(req.getPhone());
        profile.setEmail(req.getEmail());
        profile.setWebsiteUrl(req.getWebsiteUrl());
        profile.setInstagramUrl(req.getInstagramUrl());
        profile.setFacebookUrl(req.getFacebookUrl());
        profile.setYoutubeUrl(req.getYoutubeUrl());
        profile.setWhatsappNumber(req.getWhatsappNumber());
        profile.setLogoUrl(req.getLogoUrl());
        profile.setBannerImageUrl(req.getBannerImageUrl());
        profile.setOperatingHours(req.getOperatingHours());

        return profileRepo.save(profile);
    }
}
