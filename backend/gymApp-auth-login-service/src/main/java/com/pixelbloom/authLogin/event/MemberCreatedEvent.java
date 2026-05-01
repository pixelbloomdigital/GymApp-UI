package com.pixelbloom.authLogin.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Published to Kafka when a visitor is converted to a member.
 * Consumed by gym-core-service to sync the member into gym_customersdb.
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
