package com.pixelbloom.coreService.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Consumed from topic "gym.member.created" — published by auth-service
 * when a visitor is converted to a member. Used to sync member data
 * into gym_customersdb so core-service can look up members by ID.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberCreatedEvent {
    private Long memberId;
    private String name;
    private String email;
    private String phone;
}
