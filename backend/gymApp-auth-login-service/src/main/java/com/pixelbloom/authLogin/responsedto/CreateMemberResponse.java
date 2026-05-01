package com.pixelbloom.authLogin.responsedto;

import com.pixelbloom.authLogin.entity.BatchType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class CreateMemberResponse {

    private Long memberId;
    private String name;
    private String email;
    private String phone;
    private String gymCenter;
    private String role;
    private String memberStatus;
    private List<BatchType> preferredBatches;
    private LocalDateTime joinedAt;
    private String message;
}
