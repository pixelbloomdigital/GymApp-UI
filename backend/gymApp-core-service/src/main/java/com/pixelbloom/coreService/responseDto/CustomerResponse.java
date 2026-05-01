package com.pixelbloom.coreService.responseDto;

import com.pixelbloom.coreService.enums.MemberStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CustomerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private MemberStatus status;
}
