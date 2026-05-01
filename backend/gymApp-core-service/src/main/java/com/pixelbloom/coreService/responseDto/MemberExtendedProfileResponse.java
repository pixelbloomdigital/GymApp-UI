package com.pixelbloom.coreService.responseDto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class MemberExtendedProfileResponse {
    private LocalDate dob;
    private String gender;
    private String photo;
    private String emergencyName;
    private String emergencyPhone;
    private String gymExperience;

    private Double height;
    private Double weight;
    private Double bodyFat;
    private String medicalConditions;
    private String previousInjuries;
    private String currentMedications;
    private String allergies;

    private String fitnessGoal;
    private String dietPreference;
    private String dietTarget;
}
