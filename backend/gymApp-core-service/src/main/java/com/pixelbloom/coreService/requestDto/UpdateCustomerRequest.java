package com.pixelbloom.coreService.requestDto;
import lombok.Data;

@Data
public class UpdateCustomerRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
}