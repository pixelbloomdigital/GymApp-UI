package com.pixelbloom.authLogin.responsedto;

import com.pixelbloom.authLogin.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MemberResponse {
    private Long memberId;
    private String name;
    private String email;
    private String phone;
    private String gymCenter;
    private LocalDateTime joinedAt;
    private Role role;
    private com.pixelbloom.authLogin.enums.MemberStatus memberStatus;
}