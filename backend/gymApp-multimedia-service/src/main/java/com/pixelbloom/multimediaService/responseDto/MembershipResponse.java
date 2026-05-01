package com.pixelbloom.multimediaService.responseDto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MembershipResponse {
    private Long id;
    private Long memberId;
    private Long batchId;
    private String status; // e.g. "ACTIVE", "EXPIRED"
}
