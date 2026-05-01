package com.pixelbloom.publicInfo.dto;

import lombok.Data;

@Data
public class EventRegistrationRequest {
    private Long bookerId;
    private String bookerType;  // MEMBER, VISITOR, WALK_IN
    private String bookerName;
    private String bookerPhone;
    private String bookerEmail;
}
