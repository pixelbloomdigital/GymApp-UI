package com.pixelbloom.publicInfo.dto;

import lombok.Data;

@Data
public class GymProfileRequest {
    private String gymName;
    private String tagline;
    private String description;
    private String address;
    private String city;
    private String phone;
    private String email;
    private String websiteUrl;
    private String instagramUrl;
    private String facebookUrl;
    private String youtubeUrl;
    private String whatsappNumber;
    private String logoUrl;
    private String bannerImageUrl;
    private String operatingHours;
}
