package com.pixelbloom.authLogin.requestdto;

import com.pixelbloom.authLogin.entity.BatchType;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
public class VisitorRegisterRequest {

    @NotBlank(message = "Name is required")
    public String name;

    @NotBlank(message = "Email is required")
    public String email;

    public String password;

    @NotBlank(message = "Phone is required")
    public String phone;

    public String gymCenter;
    public String city;
    public String state;

    public List<BatchType> preferredBatches;

    public Long interestedMembershipPlanId;
    public String inquirySource;
    public LocalDate demoDatePreference;
    public String demoTimeSlotPreference;
    public List<String> eventInterest;
    public Boolean costumeInterest;
}
